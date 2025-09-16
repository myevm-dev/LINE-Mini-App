"use client";

import { useEffect, useState, useCallback } from "react";

const KEY = "pw_credits_v1";

export function useCredits() {
  const [credits, setCredits] = useState<number>(0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      setCredits(raw ? Math.max(0, parseInt(raw, 10) || 0) : 0);
    } catch {}
  }, []);

  const set = useCallback((val: number) => {
    setCredits(val);
    try { localStorage.setItem(KEY, String(Math.max(0, Math.floor(val)))); } catch {}
  }, []);

  const add = useCallback((delta: number) => set(credits + delta), [credits, set]);

  return { credits, setCredits: set, addCredits: add };
}
