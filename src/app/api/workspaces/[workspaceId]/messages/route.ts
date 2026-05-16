import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDmThreadIdForPair } from "@/lib/dm";

export async function GET(
  req: Request,
  context: { params: Promise<{ workspaceId: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { workspaceId } = await context.params;
  const { searchParams } = new URL(req.url);
  const channelId = searchParams.get("channelId");
  const peerUserId = searchParams.get("peerUserId");

  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: { workspaceId, userId: session.user.id },
    },
  });
  if (!member) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  if (!channelId && !peerUserId) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  if (channelId) {
    const channel = await prisma.channel.findFirst({
      where: { id: channelId, workspaceId },
    });
    if (!channel) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    const messages = await prisma.message.findMany({
      where: { channelId, deletedAt: null },
      orderBy: { createdAt: "asc" },
      take: 150,
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({
      messages: messages.map((m) => ({
        id: m.id,
        body: m.body,
        createdAt: m.createdAt.toISOString(),
        author: { id: m.author.id, name: m.author.name, email: m.author.email },
      })),
    });
  }

  const peer = peerUserId!;

  const peerMember = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: { workspaceId, userId: peer },
    },
  });
  if (!peerMember) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const threadId = await getDmThreadIdForPair(workspaceId, session.user.id, peer);
  if (!threadId) {
    return NextResponse.json({ messages: [] });
  }

  const messages = await prisma.message.findMany({
    where: { dmThreadId: threadId, deletedAt: null },
    orderBy: { createdAt: "asc" },
    take: 150,
    include: {
      author: { select: { id: true, name: true, email: true } },
    },
  });

  return NextResponse.json({
    messages: messages.map((m) => ({
      id: m.id,
      body: m.body,
      createdAt: m.createdAt.toISOString(),
      author: { id: m.author.id, name: m.author.name, email: m.author.email },
    })),
  });
}
