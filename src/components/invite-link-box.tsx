"use client";

import { useState } from "react";
import { createInvite } from "@/actions/workspace";

type Props = {
  workspaceId: string;
  isAdmin: boolean;
};

export function InviteLinkBox({ workspaceId, isAdmin }: Props) {
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!isAdmin) return null;

  async function onCreate() {
    setBusy(true);
    setErr(null);
    try {
      const result = await createInvite(workspaceId);
      if ("error" in result && result.error) setErr(result.error);
      else if (result.url) setInviteUrl(result.url);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-md border border-white/17 bg-black/18 px-2 py-2">
      <p className="mb-2 text-[11px] font-medium text-white/85">メンバー招待（管理者のみ）</p>
      <button
        type="button"
        disabled={busy}
        onClick={() => void onCreate()}
        className="w-full rounded bg-violet-500/95 py-1 text-[11px] font-semibold text-white hover:bg-violet-400 disabled:opacity-60"
      >
        {busy ? "作成中…" : "招待リンクを発行"}
      </button>
      {inviteUrl ? (
        <p className="mt-2 break-all text-[11px] text-emerald-200/95">{inviteUrl}</p>
      ) : null}
      {err ? <p className="mt-1 text-[11px] text-red-300">{err}</p> : null}
    </div>
  );
}
