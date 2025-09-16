"use client";

import TopUpCard from "../components/TopUpCard";
import { useCredits } from "../components/useCredits";

export default function TopUpPage() {
  const { credits } = useCredits();

  return (
    <main className="min-h-screen bg-zinc-950 text-neutral-200 pt-20">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-white mb-6">Top Up Balance</h1>

        <div className="mb-8">
          <p className="text-neutral-400 text-sm">Current Balance</p>
          <div className="text-3xl font-semibold text-white">
            {credits.toLocaleString()}{" "}
            <span className="text-sm text-neutral-400">credits</span>
          </div>
        </div>

        <TopUpCard />

        {/* About section */}
        <section className="mt-12 border-t border-zinc-800 pt-6">
          <h2 className="text-lg font-semibold text-white mb-2">About</h2>
          <p className="text-sm text-neutral-300 leading-6">
            Credits power your Pocket Waifu experience: chat, animations, and
            premium features. Top ups here only update local balance. To make
            them persistent or on-chain, connect this flow to your smart
            contract or server.
          </p>
        </section>
      </div>
    </main>
  );
}
