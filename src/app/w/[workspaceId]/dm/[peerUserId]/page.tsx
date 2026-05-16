import { ConversationView } from "@/components/conversation-view";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ workspaceId: string; peerUserId: string }> };

export default async function DmPage({ params }: Props) {
  const { workspaceId, peerUserId } = await params;

  const row = await prisma.workspaceMember.findFirst({
    where: { workspaceId, userId: peerUserId },
    include: { user: true },
  });

  if (!row) notFound();

  return (
    <ConversationView
      mode="dm"
      workspaceId={workspaceId}
      peerUserId={peerUserId}
      peerName={row.user.name}
    />
  );
}
