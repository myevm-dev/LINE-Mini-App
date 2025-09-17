"use client";

import { useEffect, useMemo, useRef } from "react";
import type { PersonalitySpec } from "./PersonalityTypes";

type Props = { spec: PersonalitySpec };

export default function CreatePreview({ spec }: Props) {
  // stable seed from ordered keys
  const seed = useMemo(
    () => JSON.stringify(spec, Object.keys(spec).sort()),
    [spec]
  );

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let disposed = false;
    (async () => {
      const mod = (await import("ethereum-blockies")) as any;
      const blockies = mod.default ?? mod;
      const icon: HTMLCanvasElement = blockies.create({
        seed,
        size: 16,   // dense like GitHub
        scale: 16,  // 256px canvas
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
    return () => { disposed = true; };
  }, [seed]);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 lg:p-6 flex flex-col">
      <canvas
        ref={canvasRef}
        className="w-full aspect-square rounded-xl border border-zinc-800 mb-4"
      />
      <div className="w-full rounded-lg border border-zinc-800 bg-zinc-950 p-3">
        <pre className="text-xs text-neutral-300 overflow-auto leading-relaxed">
          {JSON.stringify(spec, null, 2)}
        </pre>
      </div>
    </div>
  );
}
