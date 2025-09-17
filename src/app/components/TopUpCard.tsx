// src/app/components/TopUpCard.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  useActiveAccount,
  useReadContract,
  useSendTransaction,
  useWalletBalance,
} from "thirdweb/react";
import { getContract, prepareContractCall } from "thirdweb";
import { allowance, approve, balanceOf } from "thirdweb/extensions/erc20";

import { client } from "../client";
import { KAIA } from "../lib/kaia";
import { ADDRESSES } from "../lib/constants";

const USDT_DECIMALS = 6;
const RATE = 100; // 1 USDT = 100 credits

export default function TopUpCard() {
  const account = useActiveAccount();

  const [usd, setUsd] = useState<string>("");

  // Contracts
  const usdt = useMemo(
    () => getContract({ client, chain: KAIA, address: ADDRESSES.USDT }),
    []
  );
  const waifu = useMemo(
    () => getContract({ client, chain: KAIA, address: ADDRESSES.WAIFU_TOP_UP }),
    []
  );

  // Wallet balances
  const { data: kaiaBal } = useWalletBalance({
    client,
    chain: KAIA,
    address: account?.address,
  });

  const { data: usdtBal = 0n } = useReadContract(balanceOf, {
    contract: usdt,
    address: account?.address ?? "0x0000000000000000000000000000000000000000",
  });

  // Allowance
  const { data: currentAllowance = 0n } = useReadContract(allowance, {
    contract: usdt,
    owner: account?.address ?? "0x0000000000000000000000000000000000000000",
    spender: ADDRESSES.WAIFU_TOP_UP,
  });

  // Contract credits balance
  const { data: contractBal = 0n, refetch } = useReadContract({
    contract: waifu,
    method: "function balanceOf(address) view returns (uint256)",
    params: [account?.address ?? "0x0000000000000000000000000000000000000000"],
  });

  const { mutateAsync: sendTx, isPending } = useSendTransaction();

  // --- helpers
  function usdToUsdtUnits(amountUsd: number): bigint {
    return BigInt(Math.round(amountUsd * 10 ** USDT_DECIMALS));
  }

  const creditsBalance = useMemo(() => {
    // ✅ convert token units into credits (1 USDT = 100 credits)
    return Number(contractBal) / 10 ** USDT_DECIMALS * RATE;
  }, [contractBal]);

  const creditsToAdd = useMemo(() => {
    const n = Number(usd);
    return Number.isFinite(n) && n > 0 ? n * RATE : 0;
  }, [usd]);
async function topUpOnChain(amountUsd: number) {
  if (!account?.address) return;
  const units = usdToUsdtUnits(amountUsd);
  if (units <= 0n) return;

  // approve if needed
  if (currentAllowance < units) {
    await sendTx(
      approve({
        contract: usdt,
        spender: ADDRESSES.WAIFU_TOP_UP,
        amount: units.toString(),   // ✅ fix: approve wants string | number
      })
    );
  }

  // topUp call
  await sendTx(
    prepareContractCall({
      contract: waifu,
      method: "function topUp(uint256)",
      params: [units],             // ✅ fix: contract call accepts bigint
    })
  );

  await refetch();
}

  const kaiaPretty = kaiaBal
    ? `${(Number(kaiaBal.value) / 10 ** kaiaBal.decimals).toFixed(4)} ${kaiaBal.symbol}`
    : "—";
  const usdtPretty = `${(Number(usdtBal) / 10 ** USDT_DECIMALS).toFixed(2)} USDT`;

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow">
      {/* Wallet balances */}
      <div className="mb-3 text-xs text-neutral-400 flex gap-4">
        <span>
          Wallet KAIA: <span className="text-neutral-200">{kaiaPretty}</span>
        </span>
        <span>
          Wallet USDT: <span className="text-neutral-200">{usdtPretty}</span>
        </span>
      </div>

      {/* ✅ fixed balance */}
      <div className="mb-4 flex items-center gap-2">
        <div>
          <div className="text-sm text-neutral-400">Current Balance</div>
          <div className="text-2xl font-semibold text-white tabular-nums">
            {creditsBalance.toLocaleString()}{" "}
            <span className="text-sm text-neutral-400">credits</span>
          </div>
        </div>
        <button
          onClick={() => refetch()}
          className="ml-2 px-2 py-1 text-xs border border-neutral-600 rounded hover:bg-neutral-800"
        >
          Refresh
        </button>
      </div>

      <div className="mb-4">
        <div className="text-sm text-neutral-400">Credits after top up</div>
        <div className="text-2xl font-semibold text-white tabular-nums">
          {(creditsBalance + creditsToAdd).toLocaleString()}{" "}
          <span className="text-sm text-neutral-400">credits</span>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm text-neutral-300">Amount (USD)</label>
          <div className="flex">
            <span className="inline-flex items-center px-3 rounded-l-lg border border-zinc-700 bg-zinc-800 text-neutral-300">
              $
            </span>
            <input
              inputMode="decimal"
              value={usd}
              onChange={(e) => setUsd(e.target.value.replace(/[^0-9.]/g, ""))}
              placeholder="10"
              className="w-full rounded-r-lg bg-zinc-800 border border-l-0 border-zinc-700 px-3 py-2 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none"
            />
          </div>
          <p className="text-xs text-neutral-400">
            {creditsToAdd > 0
              ? `${creditsToAdd.toLocaleString()} credits`
              : "1 USD = 100 credits"}
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-neutral-300">Quick add</label>
          <div className="grid grid-cols-4 gap-2">
            {[5, 10, 20, 50].map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => topUpOnChain(q)}
                className="rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-750 text-neutral-100 text-sm py-2 disabled:opacity-50"
              >
                ${q}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => topUpOnChain(Number(usd || 0))}
            className="w-full rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm py-2"
          >
            Top up
          </button>
        </div>
      </div>
    </section>
  );
}
