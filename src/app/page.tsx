import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Chat Lite",
  description: "Slack に近いチャット MVP（Vercel / PostgreSQL 向け）",
};

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const membership = await prisma.workspaceMember.findFirst({
    where: { userId: session.user.id },
    include: {
      workspace: {
        include: {
          channels: { where: { name: "general" }, take: 1 },
        },
      },
    },
    orderBy: { joinedAt: "asc" },
  });

  if (!membership) {
    return (
      <main className="mx-auto flex max-w-md flex-col gap-4 p-8 text-white">
        <h1 className="text-xl font-semibold">ワークスペースがありません</h1>
        <p className="text-slate-300">招待リンクから参加してください。</p>
        <Link className="text-violet-300 underline hover:text-white" href="/login">
          ログインへ
        </Link>
      </main>
    );
  }

  const general = membership.workspace.channels[0];
  if (!general) {
    const anyCh = await prisma.channel.findFirst({ where: { workspaceId: membership.workspaceId } });
    if (!anyCh) redirect("/login");
    redirect(`/w/${membership.workspaceId}/channel/${anyCh.id}`);
  }

  redirect(`/w/${membership.workspaceId}/channel/${general.id}`);
}
