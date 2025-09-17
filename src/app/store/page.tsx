// src/app/store/page.tsx
"use client";
import Link from "next/link"; 

import { useMemo, useState } from "react";
import {
  useActiveAccount,
  useReadContract,
  useWalletBalance,
} from "thirdweb/react";
import { getContract } from "thirdweb";
import { balanceOf } from "thirdweb/extensions/erc20";

import { client } from "../client";
import { KAIA } from "../lib/kaia";
import { ADDRESSES } from "../lib/constants";
import StoreCard, { StoreItem } from "../components/StoreCard";

type Tab = "personalities" | "models" | "clothes";

const USDT_DECIMALS = 6;

const ITEMS: StoreItem[] = [
  // Personalities
  { id: "p1", kind: "personality", name: "Tsundere", desc: "Spiky at first, secretly sweet.", price: 600, img: "/store/personalities/tsundere.png", badge: "NEW" },
  { id: "p2", kind: "personality", name: "Yandere", desc: "Protective… a little too protective.", price: 700, img: "/store/personalities/yandere.png" },
  { id: "p3", kind: "personality", name: "Onee-san", desc: "Calm, kind, and teasing.", price: 650 },


  // Clothes
  { id: "c1", kind: "clothes", name: "Casual Hoodie", desc: "Comfy street style.", price: 400, img: "/store/clothes/hoodie.png" },
  { id: "c2", kind: "clothes", name: "Maid Dress", desc: "Classic black & white.", price: 800, img: "/store/clothes/maid.png" },
  { id: "c3", kind: "clothes", name: "Cyber Bodysuit", desc: "Sleek future fit.", price: 900, img: "/store/clothes/cyber.png" },


  // Models
  { id: "m1", kind: "model", name: "Aiko (VRM)", desc: "Anime VRM base model.", price: 1500, img: "/store/models/aiko.png" },
  { id: "m2", kind: "model", name: "Neko Girl (VRM)", desc: "Cat-ears, tail, rigged.", price: 1800, img: "/store/models/neko.png" },
  { id: "m3", kind: "model", name: "Idol (VRM)", desc: "Stage-ready idol rig.", price: 2200 },

];

export default function StorePage() {
  const [tab, setTab] = useState<Tab>("personalities");
  const account = useActiveAccount();

  // Contracts
  const usdt = useMemo(
    () => getContract({ client, chain: KAIA, address: ADDRESSES.USDT }),
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

  const filtered = useMemo(() => {
    if (tab === "personalities") return ITEMS.filter(i => i.kind === "personality");
    if (tab === "models") return ITEMS.filter(i => i.kind === "model");
    return ITEMS.filter(i => i.kind === "clothes");
  }, [tab]);

  const onBuy = (item: StoreItem) => {
    alert(`Purchased: ${item.name}`);
  };

  const kaiaPretty = kaiaBal
    ? `${(Number(kaiaBal.value) / 10 ** kaiaBal.decimals).toFixed(4)} ${kaiaBal.symbol}`
    : "—";

  const usdtPretty = `${(Number(usdtBal) / 10 ** USDT_DECIMALS).toFixed(2)} USDT`;

  return (
    <main className="min-h-screen bg-zinc-950 text-neutral-200 pt-20">
      <div className="max-w-6xl mx-auto px-4">
        {/* Row 1: Title + Balances */}
        <div className="flex items-end justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Store</h1>
            <p className="text-sm text-neutral-400">
              Buy personalities, models, and clothes for your waifu.
            </p>
          </div>
          <div className="text-right text-sm text-neutral-400 space-y-1">
            <div>Wallet KAIA: <span className="text-white">{kaiaPretty}</span></div>
            <div>Wallet USDT: <span className="text-white">{usdtPretty}</span></div>
          </div>
        </div>

        {/* Row 2: Tabs + Create/Owned */}
        <div className="flex items-center justify-between mb-6">
          <div className="inline-flex rounded-xl border border-zinc-800 overflow-hidden">
                        <button
              onClick={() => setTab("models")}
              className={`px-4 py-2 text-sm border-l border-zinc-800 ${
                tab === "models"
                  ? "bg-zinc-800 text-white"
                  : "bg-zinc-900 text-neutral-300 hover:text-white"
              }`}
            >
              Models
            </button>
            <button
              onClick={() => setTab("personalities")}
              className={`px-4 py-2 text-sm ${
                tab === "personalities"
                  ? "bg-zinc-800 text-white"
                  : "bg-zinc-900 text-neutral-300 hover:text-white"
              }`}
            >
              Personalities
            </button>

            <button
              onClick={() => setTab("clothes")}
              className={`px-4 py-2 text-sm border-l border-zinc-800 ${
                tab === "clothes"
                  ? "bg-zinc-800 text-white"
                  : "bg-zinc-900 text-neutral-300 hover:text-white"
              }`}
            >
              Clothes
            </button>
          </div>

          <div className="flex gap-2">
            <button className="px-3 py-1 text-xs rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white">
              Owned
            </button>
            <Link
              href="/store/create"
              className="px-3 py-1 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Create
            </Link>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(item => (
            <StoreCard
              key={item.id}
              item={item}
              canAfford={true} // ⚠️ canAfford logic disabled for now
              onBuy={onBuy}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
