"use client";

import { useEffect, useRef, type KeyboardEvent } from "react";
import { sendChannelMessage, sendDmMessage } from "@/actions/workspace";

type Props =
  | { mode: "channel"; workspaceId: string; channelId: string; onSent: () => void }
  | { mode: "dm"; workspaceId: string; peerUserId: string; onSent: () => void };

export function Composer(props: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  async function submit(formData: FormData) {
    if (props.mode === "channel") {
      await sendChannelMessage(props.workspaceId, props.channelId, formData);
    } else {
      await sendDmMessage(props.workspaceId, props.peerUserId, formData);
    }
    formRef.current?.reset();
    textareaRef.current?.focus();
    props.onSent();
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key !== "Enter" || !e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    formRef.current?.requestSubmit();
  }

  return (
    <footer className="border-t border-slate-700/80 bg-slate-950/80 px-4 py-3">
      <form ref={formRef} action={(fd) => void submit(fd)} className="mx-auto flex max-w-[min(100%,48rem)] gap-2">
        <textarea
          ref={textareaRef}
          name="body"
          required
          rows={2}
          placeholder="メッセージを入力…（送信: Ctrl + Enter）"
          className="min-h-[2.5rem] flex-1 resize-y rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          onKeyDown={onKeyDown}
        />
        <button
          type="submit"
          className="shrink-0 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500"
        >
          送信
        </button>
      </form>
      <p className="mx-auto mt-2 max-w-[min(100%,48rem)] text-xs text-slate-500">
        Shift+Enter で改行。Ctrl+Enter で送信です。
      </p>
    </footer>
  );
}
