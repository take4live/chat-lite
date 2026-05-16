"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createChannel } from "@/actions/workspace";
import { InviteLinkBox } from "@/components/invite-link-box";
import { SignOutLink } from "@/components/sign-out-link";

export type SidebarChannel = { id: string; name: string };
export type SidebarMember = { id: string; name: string };

export type SidebarRole = "ADMIN" | "MEMBER";

type Props = {
  workspaceId: string;
  workspaceName: string;
  slug: string;
  channels: SidebarChannel[];
  colleagues: SidebarMember[];
  currentUserId: string;
  userRole: SidebarRole;
};

export function WorkspaceSidebar({
  workspaceId,
  workspaceName,
  slug,
  channels,
  colleagues,
  currentUserId,
  userRole,
}: Props) {
  const pathname = usePathname();

  function active(path: string) {
    return pathname === path;
  }

  return (
    <aside className="flex w-[230px] shrink-0 flex-col border-r border-slate-700/70 bg-[#341c53] px-3 py-3 text-[13px] text-slate-100">
      <div className="mb-4 rounded-md bg-black/25 px-2 py-1.5">
        <p className="text-[15px] font-semibold">{workspaceName}</p>
        <p className="truncate text-[11px] text-slate-300/80">{slug}</p>
      </div>

      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-white/65">
        チャンネル
      </p>
      <nav className="mb-4 flex flex-col gap-px">
        {channels.map((c) => {
          const path = `/w/${workspaceId}/channel/${c.id}`;
          const isCur = active(path);
          return (
            <Link
              key={c.id}
              href={path}
              prefetch={false}
              className={
                isCur
                  ? "rounded bg-white/14 px-2 py-1 text-white no-underline"
                  : "rounded px-2 py-1 text-slate-50/92 no-underline hover:bg-black/28"
              }
            >
              <span aria-hidden>#</span> {c.name}
            </Link>
          );
        })}
      </nav>

      <details className="mb-6 rounded-md border border-white/17 bg-black/18">
        <summary className="cursor-pointer px-2 py-1 text-[11px] font-medium text-white/92">
          ＋ チャンネルを追加
        </summary>
        <form
          action={createChannel.bind(null, workspaceId)}
          className="space-y-2 border-t border-white/12 px-2 py-2"
        >
          <label className="block text-[10px] text-white/73" htmlFor="new-ch-name">
            名前（英小文字）
          </label>
          <input
            id="new-ch-name"
            type="text"
            name="name"
            required
            placeholder="例: announcements"
            className="w-full rounded border border-slate-500/85 bg-[#29153f] px-2 py-1 text-[12px] text-white outline-none placeholder:text-slate-500"
            autoComplete="off"
          />
          <button
            type="submit"
            className="w-full rounded bg-white/94 py-1 text-[11px] font-semibold text-[#381d59] hover:bg-white"
          >
            作成
          </button>
        </form>
      </details>

      <InviteLinkBox workspaceId={workspaceId} isAdmin={userRole === "ADMIN"} />

      <div className="my-6 border-t border-white/14" />

      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-white/65">
        メンバー
      </p>
      <nav className="flex min-h-0 flex-1 flex-col gap-px overflow-auto pb-6">
        {colleagues
          .filter((u) => u.id !== currentUserId)
          .map((u) => {
            const path = `/w/${workspaceId}/dm/${u.id}`;
            return (
              <Link
                key={u.id}
                href={path}
                prefetch={false}
                className={
                  active(path)
                    ? "rounded bg-white/14 px-2 py-1 text-white no-underline"
                    : "rounded px-2 py-1 text-slate-50/92 no-underline hover:bg-black/28"
                }
              >
                {u.name}
              </Link>
            );
          })}
      </nav>

      <div className="mt-auto border-t border-white/14 pt-3">
        <SignOutLink />
      </div>
    </aside>
  );
}
