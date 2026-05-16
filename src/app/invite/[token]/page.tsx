import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { joinWithInvite } from "@/actions/auth";

type Props = { params: Promise<{ token: string }> };

export default async function InvitePage({ params }: Props) {
  const { token } = await params;
  const session = await getServerSession(authOptions);

  return (
    <main className="mx-auto flex min-h-[100vh] max-w-lg flex-col justify-center px-8 py-20">
      <h1 className="mb-10 text-center text-2xl font-semibold tracking-tight text-white">
        ワークスペースへの招待
      </h1>
      {!session ? (
        <div className="flex flex-col gap-6 rounded-xl border border-slate-700 bg-slate-900/96 p-6">
          <p className="text-sm leading-relaxed text-slate-300">
            参加するにはログインまたは新規登録が必要です。ログインするとこのページに戻って参加できます。
          </p>
          <div className="flex flex-wrap gap-5">
            <Link
              className="inline-flex flex-1 items-center justify-center rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white no-underline hover:bg-violet-500"
              href={`/login?callbackUrl=${encodeURIComponent(`/invite/${token}`)}`}
            >
              ログイン
            </Link>
            <Link
              className="inline-flex flex-1 items-center justify-center rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-100 no-underline hover:border-slate-500"
              href={`/signup?callback=${encodeURIComponent(`/invite/${token}`)}`}
            >
              登録する
            </Link>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-700 bg-slate-900/96 p-6">
          <p className="mb-10 text-base text-slate-300">{session.user.name} として参加します。</p>
          <form action={joinWithInvite} className="flex flex-col gap-4">
            <input type="hidden" name="token" value={token} />
            <button type="submit" className="rounded-lg bg-emerald-600 py-2 text-sm font-medium text-white hover:bg-emerald-500">
              ワークスペースに参加
            </button>
          </form>
        </div>
      )}
    </main>
  );
}
