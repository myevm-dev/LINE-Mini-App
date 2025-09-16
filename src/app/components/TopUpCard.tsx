"use client";

import { useMemo, useState } from "react";
import { useCredits } from "./useCredits";
// If you want thirdweb later, import what you actually use from their docs:
// import { useActiveAccount } from "thirdweb/react";

export default function TopUpCard() {
  const { credits, addCredits } = useCredits();
  const [usd, setUsd] = useState<string>("");
  const [busy, setBusy] = useState(false);

  // Simple conversion: $1 = 100 credits (change to your rate)
  const rate = 100;
  const creditsToAdd = useMemo(() => {
    const n = Number(usd);
    return Number.isFinite(n) && n > 0 ? Math.floor(n * rate) : 0;
  }, [usd]);

  const quick = [5, 10, 20, 50];

  async function confirmTopUp(amountUsd: number) {
    const add = Math.floor(amountUsd * rate);
    if (add <= 0) return;
    setBusy(true);

    try {
      // ---- PLACEHOLDER PAYMENT ----
      // Hook up your payment or on-chain flow here.
      // e.g. call your /api/checkout, or thirdweb pay/contract:
      // const tx = await contract.write.topUp({ value: parseEther(String(amountUsdInWei)) });
      // await tx.wait();

      // On success, credit the account:
      addCredits(add);
    } catch (e) {
      console.error(e);
      alert("Payment failed or was cancelled.");
    } finally {
      setBusy(false);
      setUsd("");
    }
  }

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow">
      <div className="mb-4">
        <div className="text-sm text-neutral-400">Credits after top up</div>
        <div className="text-2xl font-semibold text-white tabular-nums">
          {(credits + creditsToAdd).toLocaleString()} <span className="text-sm text-neutral-400">credits</span>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Amount input */}
        <div className="space-y-2">
          <label className="text-sm text-neutral-300">Amount (USD)</label>
          <div className="flex">
            <span className="inline-flex items-center px-3 rounded-l-lg border border-zinc-700 bg-zinc-800 text-neutral-300">$</span>
            <input
              inputMode="decimal"
              value={usd}
              onChange={(e) => {
                const v = e.target.value.replace(/[^0-9.]/g, "");
                setUsd(v);
              }}
              placeholder="10"
              className="w-full rounded-r-lg bg-zinc-800 border border-l-0 border-zinc-700 px-3 py-2 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none"
            />
          </div>
          <p className="text-xs text-neutral-400">
            {creditsToAdd > 0 ? `${creditsToAdd.toLocaleString()} credits` : "1 USD = 100 credits"}
          </p>
        </div>

        {/* Quick picks */}
        <div className="space-y-2">
          <label className="text-sm text-neutral-300">Quick add</label>
          <div className="grid grid-cols-4 gap-2">
            {quick.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => confirmTopUp(q)}
                disabled={busy}
                className="rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-750 text-neutral-100 text-sm py-2 disabled:opacity-50"
              >
                ${q}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => confirmTopUp(Number(usd || 0))}
            disabled={busy || creditsToAdd <= 0}
            className="w-full rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm py-2 disabled:opacity-50"
          >
            {busy ? "Processing…" : `Top up ${creditsToAdd > 0 ? `(+${creditsToAdd} credits)` : ""}`}
          </button>
          <div className="text-xs text-neutral-500">
            * Demo credits are stored locally. Replace with your contract or API to persist across devices.
          </div>
        </div>
      </div>
    </section>
  );
}
