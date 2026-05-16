"use client";

import { useEffect, useRef, useState } from "react";

export type UiMessage = {
  id: string;
  body: string;
  createdAt: string;
  author: { id: string; name: string; email: string | null };
};

type Props =
  | { workspaceId: string; channelId: string; peerUserId?: undefined; refreshSignal: number }
  | { workspaceId: string; peerUserId: string; channelId?: undefined; refreshSignal: number };

export function MessageFeed(props: Props) {
  const [items, setItems] = useState<UiMessage[]>([]);
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
  }, [props.workspaceId, query, props.refreshSignal]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [items.length]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-4">
      {items.length === 0 && (
        <p className="text-sm text-slate-400">メッセージはまだありません。話し始めましょう。</p>
      )}
      {items.map((m) => (
        <article
          key={m.id}
          className="max-w-[min(100%,48rem)] rounded-lg border border-slate-700/60 bg-slate-800/40 px-3 py-2"
        >
          <header className="mb-1 flex flex-wrap gap-2 text-xs text-slate-400">
            <span className="font-medium text-slate-300">{m.author.name}</span>
            <time dateTime={m.createdAt}>
              {new Date(m.createdAt).toLocaleString("ja-JP", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </time>
          </header>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-100">{m.body}</p>
        </article>
      ))}
      <div ref={bottom} />
    </div>
  );
}
