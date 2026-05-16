"use client";

import { signOut } from "next-auth/react";

export function SignOutLink() {
  return (
    <button
      type="button"
      onClick={() => void signOut({ callbackUrl: "/login" })}
      className="w-full rounded border border-white/22 bg-transparent px-2 py-1 text-[11px] text-white/88 hover:bg-black/37"
    >
      ログアウト
    </button>
  );
}
