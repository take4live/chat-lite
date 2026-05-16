import { getServerSession } from "next-auth";
import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WorkspaceSidebar } from "@/components/workspace-sidebar";

type Props = { children: React.ReactNode; params: Promise<{ workspaceId: string }> };

export const metadata: Metadata = {
  title: "ワークスペース",
};

export default async function WorkspaceLayout({ children, params }: Props) {
  const { workspaceId } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) redirect("/login");

  const membership = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: { workspaceId, userId: session.user.id },
    },
    include: { workspace: true },
  });

  if (!membership) notFound();

  const [channelsRaw, colleagueRows] = await Promise.all([
    prisma.channel.findMany({
      where: { workspaceId },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: { user: { select: { id: true, name: true } } },
    }),
  ]);

  const slug = membership.workspace.slug;
  const colleagueList = colleagueRows.map((r) => ({ id: r.user.id, name: r.user.name }));

  return (
    <div className="flex max-h-[100vh] min-h-[100vh] min-w-0 flex-1">
      <WorkspaceSidebar
        workspaceId={workspaceId}
        workspaceName={membership.workspace.name}
        slug={slug}
        channels={channelsRaw}
        colleagues={colleagueList}
        currentUserId={session.user.id}
        userRole={membership.role}
      />
      {children}
    </div>
  );
}
