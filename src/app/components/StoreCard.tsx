"use client";

import Image from "next/image";

export type StoreItem = {
  id: string;
  kind: "personality" | "clothes" | "model";
  name: string;
  desc?: string;
  price: number;          // in credits
  img?: string;           // /public path (optional)
  badge?: string;         // small tag, e.g. "NEW"
};

export default function StoreCard({
  item,
  canAfford,
  onBuy,
}: {
  item: StoreItem;
  canAfford: boolean;
  onBuy: (item: StoreItem) => void;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 overflow-hidden flex flex-col">
      {/* image / placeholder */}
      <div className="relative aspect-square">
        {item.img ? (
          <Image
            src={item.img}
            alt={item.name}
            fill
            className="object-cover"
            sizes="(min-width: 768px) 33vw, 100vw"
            priority={false}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-700 grid place-items-center">
            <span className="text-3xl">
              {item.kind === "personality" ? "🧠" : item.kind === "clothes" ? "👗" : "🧍‍♀️"}
            </span>
          </div>
        )}

        {item.badge && (
          <div className="absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded-full bg-emerald-600 text-white">
            {item.badge}
          </div>
        )}
      </div>

      {/* body */}
      <div className="p-3 flex-1 flex flex-col">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white">{item.name}</h3>
          <span className="text-sm text-neutral-300 tabular-nums">
            {item.price.toLocaleString()} <span className="text-neutral-500">cr</span>
          </span>
        </div>
        {item.desc && (
          <p className="text-xs text-neutral-400 mt-1 line-clamp-2">{item.desc}</p>
        )}

        <button
          onClick={() => onBuy(item)}
          disabled={!canAfford}
          className="mt-3 w-full rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm py-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {canAfford ? "Buy" : "Not enough credits"}
        </button>
      </div>
    </div>
  );
}
