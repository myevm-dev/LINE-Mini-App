// src/app/topup/page.tsx
"use client";

import TopUpCard from "../components/TopUpCard";

export default function TopUpPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-neutral-200 pt-20">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-white mb-6">Top Up Balance</h1>

        {/* TopUpCard already shows current balance & refresh */}
        <TopUpCard />

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
