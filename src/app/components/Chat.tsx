"use client";

import { useEffect, useRef, useState } from "react";
import { useActiveAccount, useSendTransaction } from "thirdweb/react";
import { getContract, prepareContractCall } from "thirdweb";

import { client } from "../client";
import { KAIA } from "../lib/kaia";
import { ADDRESSES } from "../lib/constants";

type Msg = { id: string; who: "you" | "ai"; text: string };

export default function Chat() {
  const [msgs, setMsgs] = useState<Msg[]>([
    { id: "1", who: "ai", text: "Hey! I’m Aiko. How’s your day? 💖" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scroller = useRef<HTMLDivElement | null>(null);

  const account = useActiveAccount();
  const { mutateAsync: sendTx } = useSendTransaction();

  // WaifuTopUp contract
  const waifu = getContract({
    client,
    chain: KAIA,
    address: ADDRESSES.WAIFU_TOP_UP,
  });

  useEffect(() => {
    scroller.current?.scrollTo({
      top: scroller.current.scrollHeight,
      behavior: "smooth",
    });
  }, [msgs]);

  async function send() {
    const t = input.trim();
    if (!t) return;

    // show user bubble immediately
    setMsgs((m) => [...m, { id: crypto.randomUUID(), who: "you", text: t }]);
    setInput("");
    setLoading(true);

    try {
      // 1) ask Anthropic
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...msgs.map((m) => ({
              role: m.who === "you" ? "user" : "assistant",
              content: m.text,
            })),
            { role: "user", content: t },
          ],
        }),
      });

      const data = await res.json();
      const reply = data.reply ?? "⚠️ No reply from AI.";

      if (!reply || reply === "⚠️ No reply from AI.") {
        setMsgs((m) => [
          ...m,
          { id: crypto.randomUUID(), who: "ai", text: "⚠️ No reply from AI." },
        ]);
        return;
      }

      // 2) charge credits on-chain *before showing reply*
      if (account?.address) {
        try {
          await sendTx(
            prepareContractCall({
              contract: waifu,
              method: "function message()",
              params: [],
            })
          );
          console.log("✅ message() charged on-chain");
        } catch (err) {
          console.error("⚠️ On-chain message() failed", err);
          setMsgs((m) => [
            ...m,
            { id: crypto.randomUUID(), who: "ai", text: "⚠️ Transaction failed." },
          ]);
          return;
        }
      }

      // 3) only now show reply bubble
      setMsgs((m) => [...m, { id: crypto.randomUUID(), who: "ai", text: reply }]);

      // 4) animate mouth
      const ms = Math.max(800, Math.min(8000, reply.length * 45));
      window.dispatchEvent(new CustomEvent("waifu:talk", { detail: { ms } }));
      window.setTimeout(() => {
        window.dispatchEvent(new Event("waifu:talk-stop"));
      }, ms + 150);
    } catch (err) {
      console.error(err);
      setMsgs((m) => [
        ...m,
        { id: crypto.randomUUID(), who: "ai", text: "⚠️ Error talking to AI." },
      ]);
      window.dispatchEvent(new Event("waifu:talk-stop"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="h-full w-full flex flex-col rounded-xl border border-zinc-800 bg-zinc-900 shadow overflow-hidden">
      {/* Messages */}
      <div
        ref={scroller}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-zinc-950"
      >
        {msgs.map((m) => (
          <div
            key={m.id}
            className={`max-w-[85%] md:max-w-[70%] px-3 py-2 rounded-lg text-sm ${
              m.who === "you"
                ? "ml-auto bg-emerald-600 text-white"
                : "mr-auto bg-zinc-800 text-neutral-100"
            }`}
          >
            {m.text}
          </div>
        ))}
        {loading && (
          <div className="mr-auto bg-zinc-800 text-neutral-400 px-3 py-2 rounded-lg text-sm">
            Aiko is typing…
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!loading) send();
        }}
        className="border-t border-zinc-800 p-3 flex items-center gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message…"
          disabled={loading}
          className="flex-1 rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-neutral-100 placeholder-neutral-400 focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm disabled:opacity-50"
        >
          {loading ? "..." : "Send"}
        </button>
      </form>
    </section>
  );
}
