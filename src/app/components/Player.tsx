"use client";

import { useRef, useState } from "react";

export default function Player() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [useVideo, setUseVideo] = useState(false);

  return (
    <section className="h-full w-full flex flex-col rounded-xl border border-zinc-800 bg-zinc-900 shadow overflow-hidden">
      <div className="flex-1 flex items-center justify-center bg-zinc-950">
        {useVideo ? (
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            {/* Replace with your own video asset */}
            <source src="/avatar-loop.mp4" type="video/mp4" />
          </video>
        ) : (
          <img
            src="/aiko.png"
            alt="Avatar"
            className="w-full h-full object-contain p-4"
          />
        )}
      </div>
    </section>
  );
}
