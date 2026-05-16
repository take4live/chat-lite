"use client";

import { useState } from "react";
import { Composer } from "@/components/composer";
import { MessageFeed } from "@/components/message-feed";

type Props =
  | { mode: "channel"; workspaceId: string; channelId: string; title: string }
  | { mode: "dm"; workspaceId: string; peerUserId: string; peerName: string };

export function ConversationView(props: Props) {
  const [refreshSignal, setRefreshSignal] = useState(0);
  function bump() {
    setRefreshSignal((n) => n + 1);
  }

  if (props.mode === "channel") {
    return (
      <section className="flex min-h-0 min-w-0 flex-1 flex-col bg-slate-900">
        <header className="border-b border-slate-700/80 px-4 py-3">
          <p className="text-lg font-semibold text-white">
            <span aria-hidden className="text-slate-500">
              #
            </span>{" "}
            {props.title}
          </p>
        </header>
        <MessageFeed workspaceId={props.workspaceId} channelId={props.channelId} refreshSignal={refreshSignal} />
        <Composer mode="channel" workspaceId={props.workspaceId} channelId={props.channelId} onSent={bump} />
      </section>
    );
  }

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col bg-slate-900">
      <header className="border-b border-slate-700/80 px-4 py-3">
        <p className="text-lg font-semibold text-white">DM · {props.peerName}</p>
      </header>
      <MessageFeed workspaceId={props.workspaceId} peerUserId={props.peerUserId} refreshSignal={refreshSignal} />
      <Composer mode="dm" workspaceId={props.workspaceId} peerUserId={props.peerUserId} onSent={bump} />
    </section>
  );
}
