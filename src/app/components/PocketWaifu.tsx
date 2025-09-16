"use client";

import { useActiveAccount } from "thirdweb/react";
import Navbar from "./Navbar";

export default function PocketWaifu() {
  const account = useActiveAccount();

  return (
    <div className="min-h-screen w-full bg-zinc-950 text-neutral-200 flex flex-col overflow-x-hidden">
      <Navbar />

      {/* Main content */}
      <main className="flex-1 w-full pt-24 md:pt-16">
        <div className="mx-auto w-full max-w-4xl px-4">
          <div className="mx-auto w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl shadow p-8 text-center">
            <h1 className="text-2xl font-bold text-white mb-6">Mini Game</h1>

            {!account ? (
              <p className="text-sm text-neutral-400">Connect wallet to play</p>
            ) : (
              <>
                <p className="text-neutral-300 mb-6">
                  Rock–Paper–Scissors coming soon.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    disabled
                    className="px-4 py-2 rounded bg-zinc-800 text-neutral-500 cursor-not-allowed"
                  >
                    🪨
                  </button>
                  <button
                    disabled
                    className="px-4 py-2 rounded bg-zinc-800 text-neutral-500 cursor-not-allowed"
                  >
                    📄
                  </button>
                  <button
                    disabled
                    className="px-4 py-2 rounded bg-zinc-800 text-neutral-500 cursor-not-allowed"
                  >
                    ✂️
                  </button>
                </div>
              </>
            )}

            <div className="text-xs text-neutral-500 mt-8">
              Placeholder build • AA enabled
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
