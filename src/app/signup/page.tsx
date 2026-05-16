"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/actions/auth";

export default function SignupPage() {
  const router = useRouter();
  const [state, formAction] = useActionState(registerUser, undefined);

  useEffect(() => {
    if (!state?.ok) return;
    router.push("/login?registered=1");
  }, [state?.ok, router]);

  return (
    <main className="min-h-[100vh] px-6 py-14">
      <div className="mb-14 text-center">
        <Link href="/" className="text-3xl font-bold text-white no-underline">
          アカウント作成
        </Link>
      </div>
      <form
        action={formAction}
        className="mx-auto flex max-w-md flex-col gap-4 rounded-xl border border-slate-700 bg-slate-900/96 p-6 shadow-lg"
      >
        {state?.error ? (
          <p className="rounded-md bg-red-950/94 px-3 py-2 text-sm text-red-200" role="alert">
            {state.error}
          </p>
        ) : null}
        <label className="block">
          <span className="text-xs text-slate-400">表示名</span>
          <input
            name="name"
            type="text"
            required
            maxLength={64}
            className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
          />
        </label>
        <label className="block">
          <span className="text-xs text-slate-400">メール</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
          />
        </label>
        <label className="block">
          <span className="text-xs text-slate-400">パスワード（8文字以上）</span>
          <input
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
          />
        </label>
        <button
          type="submit"
          className="rounded-lg bg-emerald-600 py-2 text-sm font-medium text-white hover:bg-emerald-500"
        >
          登録してワークスペースを作成
        </button>
        <p className="text-center text-sm text-slate-400">
          アカウントがありますか？
          <Link href="/login" className="ml-1 text-violet-300 underline hover:text-white">
            ログイン
          </Link>
        </p>
      </form>
    </main>
  );
}
