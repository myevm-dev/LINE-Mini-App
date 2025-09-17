// src/app/components/useCredits.ts
import { useState, useEffect } from "react";
import { readContract } from "thirdweb";
import { client } from "../client";
import { KAIA } from "../lib/kaia";
import { ADDRESSES } from "../lib/constants";

export function useCredits() {
  const [credits, setCredits] = useState<number>(0);

  async function fetchCredits(address?: string) {
    if (!address) return;

    console.log("Refetching credits...");

    try {
      const result = await readContract({
        contract: {
          client,
          chain: KAIA,
          address: ADDRESSES.WAIFU_TOP_UP,
        },
        method: "function balanceOf(address) view returns (uint256)",
        params: [address],
      });

      const newBalance = Number(result);
      console.log("New balance", newBalance);
      setCredits(newBalance);
    } catch (err) {
      console.error("Failed to fetch credits:", err);
    }
  }

  useEffect(() => {
    // grab connected wallet automatically if you want
    // or leave fetchCredits(address) for manual refresh
  }, []);

  return { credits, fetchCredits };
}
