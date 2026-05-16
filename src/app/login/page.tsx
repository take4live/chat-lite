"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get("registered") === "1") {
      /* optional toast */
    }
  }, [searchParams]);

  async function onSubmit(formData: FormData) {
    setError(null);
    const email = formData.get("email");
    const password = formData.get("password");
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    if (res?.error) {
      setError("メールアドレスまたはパスワードが正しくありません。");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form action={(fd) => void onSubmit(fd)} className="mx-auto mt-10 flex max-w-md flex-col gap-4 rounded-xl border border-slate-700 bg-slate-900/96 p-6 shadow-lg">
      <h1 className="text-xl font-semibold text-white">ログイン</h1>
      {error ? (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      ) : null}
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
        <span className="text-xs text-slate-400">パスワード</span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
        />
      </label>
      <button
        type="submit"
        className="rounded-lg bg-violet-600 py-2 text-sm font-medium text-white hover:bg-violet-500"
      >
        ログインする
      </button>
      <p className="text-center text-sm text-slate-400">
        アカウントがありませんか？{" "}
        <Link href="/signup" className="text-violet-300 underline hover:text-white">
          登録へ
        </Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-[100vh] px-6 py-14">
      <div className="mb-16 text-center">
        <Link href="/" className="text-3xl font-bold tracking-tight text-white no-underline">
          Chat Lite
        </Link>
        <p className="mt-4 text-lg text-slate-400">
          Slack 風チャット MVP — Vercel と PostgreSQL 向け
        </p>
      </div>
      <Suspense fallback={<p className="text-center text-slate-400">読み込み中…</p>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
