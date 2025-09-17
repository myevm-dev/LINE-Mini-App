// src/app/store/create/CreatePreview.tsx
"use client";

import { useEffect, useMemo, useRef } from "react";
import type { PersonalitySpec } from "./PersonalityTypes";

type Props = { spec: PersonalitySpec };

export default function CreatePreview({ spec }: Props) {
  // PUBLIC-ONLY fields (drive image + public JSON)
  const publicSpec = useMemo(() => {
    const coreTraits = (spec.coreTraits || []).map((t) => t.trim()).filter(Boolean);
    return {
      version: spec.version,
      tier: spec.tier,
      coreTraits,
      warmth: spec.warmth,
      empathy: spec.empathy,
      humor: spec.humor,
      energy: spec.energy,
      convoLength: spec.convoLength,
      emojiUse: spec.emojiUse,
      boundaries: spec.boundaries,
    };
  }, [spec]);

  // Seed from ONLY public fields
  const seed = useMemo(
    () => JSON.stringify(publicSpec, Object.keys(publicSpec).sort()),
    [publicSpec]
  );

  // Encrypted preview box (not used in seed)
  const encryptedPreview = useMemo(
    () => ({
      algo: "AES-GCM-256",
      fields: {
        opener: spec.opener ?? "",
        notes: spec.notes ?? "",
      },
    }),
    [spec.opener, spec.notes]
  );

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let disposed = false;
    (async () => {
      const mod = (await import("ethereum-blockies")) as any;
      const blockies = mod.default ?? mod;
      const icon: HTMLCanvasElement = blockies.create({
        seed,
        size: 16,
        scale: 16, // 256px
      });

      if (!disposed && canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        if (!ctx) return;
        canvasRef.current.width = icon.width;
        canvasRef.current.height = icon.height;
        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, icon.width, icon.height);
        ctx.drawImage(icon, 0, 0);
      }
    })();
    return () => {
      disposed = true;
    };
  }, [seed]);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 lg:p-6 flex flex-col gap-4">
      <canvas
        ref={canvasRef}
        className="w-full aspect-square rounded-xl border border-zinc-800"
      />

      {/* Public JSON */}
      <section className="w-full rounded-lg border border-zinc-800 bg-zinc-950">
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-xs text-neutral-300">Public JSON (NFT attributes)</span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-700/20 text-emerald-300 border border-emerald-700/40">
            Public
          </span>
        </div>
        <div className="border-t border-zinc-800 px-3 py-2">
          <pre className="text-xs text-neutral-300 overflow-auto leading-relaxed whitespace-pre">
{JSON.stringify(publicSpec, null, 2)}
          </pre>
        </div>
      </section>

      {/* Encrypted JSON preview */}
      <section className="w-full rounded-lg border border-zinc-800 bg-zinc-950">
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-xs text-neutral-300">Encrypted JSON (preview)</span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-fuchsia-700/20 text-fuchsia-300 border border-fuchsia-700/40">
            Encrypted on Publish
          </span>
        </div>
        <div className="border-t border-zinc-800 px-3 py-2">
          <pre className="text-xs text-neutral-300 overflow-auto leading-relaxed whitespace-pre">
{JSON.stringify(encryptedPreview, null, 2)}
          </pre>
        </div>
      </section>
    </div>
  );
}
