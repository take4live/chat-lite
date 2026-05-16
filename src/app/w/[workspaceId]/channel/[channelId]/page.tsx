import { ConversationView } from "@/components/conversation-view";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ workspaceId: string; channelId: string }> };

export default async function ChannelConversationPage({ params }: Props) {
  const { workspaceId, channelId } = await params;

  const ch = await prisma.channel.findFirst({
    where: { id: channelId, workspaceId },
    select: { name: true },
  });

  if (!ch) notFound();

  return <ConversationView mode="channel" workspaceId={workspaceId} channelId={channelId} title={ch.name} />;
}
