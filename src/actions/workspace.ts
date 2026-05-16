"use server";

import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ensureDmThread } from "@/lib/dm";

async function requireUser() {
  const session = await getServerSession(authOptions);
  const id = session?.user?.id;
  if (!id) throw new Error("Unauthorized");
  return id;
}

async function requireMember(workspaceId: string, userId: string, admin = false) {
  const row = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
  });
  if (!row) throw new Error("ワークスペースに参加していません。");
  if (admin && row.role !== "ADMIN") throw new Error("管理者のみ実行できます。");
  return row;
}

const slugifySchema = z
  .string()
  .trim()
  .min(1)
  .max(80)
  .transform((s) =>
    s
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9_-]/g, ""),
  );

function isValidChannelSlug(s: string) {
  return /^([a-z0-9])([a-z0-9_-]*[a-z0-9])?$|^[a-z0-9]$/.test(s);
}

export async function createChannel(workspaceId: string, formData: FormData): Promise<void> {
  const userId = await requireUser();
  await requireMember(workspaceId, userId);

  const raw = String(formData.get("name") ?? "");
  const parsed = slugifySchema.safeParse(raw);
  if (!parsed.success || !isValidChannelSlug(parsed.data)) {
    return;
  }
  const name = parsed.data;

  try {
    await prisma.channel.create({
      data: { workspaceId, name },
    });
  } catch {
    return;
  }

  revalidatePath(`/w/${workspaceId}`, "layout");
}

const messageSchema = z.object({
  body: z.string().trim().min(1).max(8000),
});

export async function sendChannelMessage(workspaceId: string, channelId: string, formData: FormData) {
  const userId = await requireUser();
  await requireMember(workspaceId, userId);

  const parsed = messageSchema.safeParse({ body: formData.get("body") });
  if (!parsed.success) return;

  const ch = await prisma.channel.findFirst({
    where: { id: channelId, workspaceId },
  });
  if (!ch) return;

  await prisma.message.create({
    data: {
      channelId,
      authorId: userId,
      body: parsed.data.body,
    },
  });

  revalidatePath(`/w/${workspaceId}/channel/${channelId}`);
}

export async function sendDmMessage(workspaceId: string, peerUserId: string, formData: FormData) {
  const userId = await requireUser();
  await requireMember(workspaceId, userId);
  await requireMember(workspaceId, peerUserId);

  const parsed = messageSchema.safeParse({ body: formData.get("body") });
  if (!parsed.success) return;

  const threadId = await ensureDmThread(workspaceId, userId, peerUserId);

  await prisma.message.create({
    data: {
      dmThreadId: threadId,
      authorId: userId,
      body: parsed.data.body,
    },
  });

  revalidatePath(`/w/${workspaceId}/dm/${peerUserId}`);
}

function appOrigin(): string {
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export async function createInvite(workspaceId: string): Promise<{ url?: string; error?: string }> {
  const userId = await requireUser();
  await requireMember(workspaceId, userId, true);

  const token = randomBytes(24).toString("hex");

  await prisma.invite.create({
    data: {
      workspaceId,
      token,
      createdById: userId,
      expiresAt: null,
    },
  });

  const url = `${appOrigin()}/invite/${token}`;
  return { url };
}
