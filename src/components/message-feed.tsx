"use client";

import { useEffect, useRef, useState } from "react";
import { addMessageComment } from "@/actions/workspace";

export type UiComment = {
  id: string;
  body: string;
  createdAt: string;
  author: { id: string; name: string; email: string | null };
};

export type UiMessage = {
  id: string;
  body: string;
  createdAt: string;
  author: { id: string; name: string; email: string | null };
  comments: UiComment[];
};

type Props =
  | { workspaceId: string; channelId: string; peerUserId?: undefined; refreshSignal: number }
  | { workspaceId: string; peerUserId: string; channelId?: undefined; refreshSignal: number };

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("ja-JP", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function MessageCard({
  message,
  workspaceId,
  onCommentSent,
}: {
  message: UiMessage;
  workspaceId: string;
  onCommentSent: () => void;
}) {
  const [showComments, setShowComments] = useState(false);
  const [pending, setPending] = useState(false);
  const comments = message.comments ?? [];
  const count = comments.length;

  useEffect(() => {
    if (count > 0) setShowComments(true);
  }, [count]);

  async function submitComment(formData: FormData) {
    setPending(true);
    try {
      await addMessageComment(workspaceId, message.id, formData);
      onCommentSent();
    } finally {
      setPending(false);
    }
  }

  return (
    <article className="max-w-[min(100%,48rem)] rounded-lg border border-slate-700/60 bg-slate-800/40 px-3 py-2">
      <header className="mb-1 flex flex-wrap gap-2 text-xs text-slate-400">
        <span className="font-medium text-slate-300">{message.author.name}</span>
        <time dateTime={message.createdAt}>{formatTime(message.createdAt)}</time>
      </header>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-100">{message.body}</p>

      <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-slate-700/50 pt-2">
        <button
          type="button"
          onClick={() => setShowComments((v) => !v)}
          className="text-xs text-violet-300 hover:text-violet-200"
        >
          {showComments ? "コメントを隠す" : count > 0 ? `コメント (${count})` : "コメント"}
        </button>
      </div>

      {showComments ? (
        <div className="mt-2 space-y-2 border-l-2 border-violet-500/40 pl-3">
          {comments.length === 0 ? (
            <p className="text-xs text-slate-500">まだコメントはありません。</p>
          ) : (
            <ul className="space-y-2">
              {comments.map((c) => (
                <li key={c.id} className="rounded-md bg-slate-900/60 px-2 py-1.5">
                  <div className="mb-0.5 flex flex-wrap gap-2 text-[11px] text-slate-400">
                    <span className="font-medium text-slate-300">{c.author.name}</span>
                    <time dateTime={c.createdAt}>{formatTime(c.createdAt)}</time>
                  </div>
                  <p className="whitespace-pre-wrap text-xs leading-relaxed text-slate-200">{c.body}</p>
                </li>
              ))}
            </ul>
          )}

          <form action={(fd) => void submitComment(fd)} className="flex gap-2 pt-1">
            <input
              type="text"
              name="body"
              required
              maxLength={4000}
              disabled={pending}
              placeholder="コメントを書く…"
              className="min-w-0 flex-1 rounded-md border border-slate-600 bg-slate-950 px-2 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={pending}
              className="shrink-0 rounded-md bg-violet-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-violet-500 disabled:opacity-60"
            >
              {pending ? "…" : "送信"}
            </button>
          </form>
        </div>
      ) : null}
    </article>
  );
}

export function MessageFeed(props: Props) {
  const [items, setItems] = useState<UiMessage[]>([]);
  const [commentBump, setCommentBump] = useState(0);
  const bottom = useRef<HTMLDivElement>(null);

  const query =
    "channelId" in props && props.channelId != null
      ? `channelId=${encodeURIComponent(props.channelId)}`
      : `peerUserId=${encodeURIComponent(props.peerUserId!)}`;

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const res = await fetch(`/api/workspaces/${props.workspaceId}/messages?${query}`, {
        cache: "no-store",
        credentials: "include",
      });
      if (!res.ok) return;
      const data = (await res.json()) as { messages: UiMessage[] };
      if (!cancelled) setItems(data.messages);
    }
    void load();
    const t = setInterval(load, 2500);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [props.workspaceId, query, props.refreshSignal, commentBump]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [items.length, props.refreshSignal]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-4">
      {items.length === 0 && (
        <p className="text-sm text-slate-400">メッセージはまだありません。話し始めましょう。</p>
      )}
      {items.map((m) => (
        <MessageCard
          key={m.id}
          message={m}
          workspaceId={props.workspaceId}
          onCommentSent={() => setCommentBump((n) => n + 1)}
        />
      ))}
      <div ref={bottom} />
    </div>
  );
}
