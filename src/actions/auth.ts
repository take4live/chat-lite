"use server";

import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "パスワードは8文字以上にしてください"),
  name: z.string().min(1).max(64),
});

export type RegisterResult = { ok?: true; error?: string };

export async function registerUser(
  _prev: RegisterResult | undefined,
  formData: FormData,
): Promise<RegisterResult> {
  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    name: formData.get("name"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join(" / ") };
  }

  const { email, password, name } = parsed.data;
  const normalizedEmail = email.trim().toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return { error: "そのメールアドレスは既に登録されています。" };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const slug = `w-${randomBytes(12).toString("hex")}`;

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { email: normalizedEmail, passwordHash, name },
    });

    const workspace = await tx.workspace.create({
      data: { name: `${name} のワークスペース`, slug },
    });

    await tx.workspaceMember.create({
      data: { workspaceId: workspace.id, userId: user.id, role: "ADMIN" },
    });

    await tx.channel.create({
      data: { workspaceId: workspace.id, name: "general", topic: "全体向けチャンネル" },
    });
  });

  return { ok: true };
}

export async function joinWithInvite(formData: FormData) {
  const session = await getServerSession(authOptions);
  const tokenRaw = formData.get("token");
  const token = typeof tokenRaw === "string" ? tokenRaw : "";
  const parsedTok = z.string().min(10).safeParse(token);
  if (!parsedTok.success) {
    redirect("/login?error=invite");
  }

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/invite/${token}`)}`);
  }

  const invite = await prisma.invite.findUnique({
    where: { token },
  });

  if (!invite) {
    redirect("/login?error=invite_not_found");
  }

  if (invite.expiresAt && invite.expiresAt < new Date()) {
    redirect("/login?error=invite_expired");
  }

  const already = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: { workspaceId: invite.workspaceId, userId: session.user.id },
    },
  });

  if (already) {
    redirect(`/w/${invite.workspaceId}`);
  }

  await prisma.workspaceMember.create({
    data: {
      workspaceId: invite.workspaceId,
      userId: session.user.id,
      role: "MEMBER",
    },
  });

  redirect(`/w/${invite.workspaceId}`);
}
