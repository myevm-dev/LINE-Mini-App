"use client";

import {
  ConnectButton,
  useActiveAccount,
  useActiveWallet,
  useDisconnect,
} from "thirdweb/react";
import { client } from "../client";
import { inAppWallet, smartWallet } from "thirdweb/wallets";
import { shortenAddress } from "thirdweb/utils";
import { KAIA } from "../lib/kaia";
import Link from "next/link";

// --- AA config ---------------------------------------------------------------
const FACTORY = "0x907617627547f5de2a403d68068261756f362338";

const wallets = [
  smartWallet({
    chain: KAIA,
    factoryAddress: FACTORY,
    sponsorGas: false,
  }),
  inAppWallet({
    auth: { options: ["email"] },
  }),
];

export default function Navbar() {
  const account = useActiveAccount();
  const wallet = useActiveWallet();
  const { disconnect } = useDisconnect();

  return (
    <nav className="sticky top-0 z-50 w-full bg-zinc-900/95 border-b border-zinc-800 backdrop-blur">
      <div className="mx-auto w-full max-w-6xl px-4 py-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Left: brand + menu */}
        <div className="flex items-center gap-8">
          {/* Brand title */}
          <div className="flex items-center gap-2">
            <span className="text-pink-400 text-xl">💖</span>
            <span className="font-bold text-lg text-white">Pocket Waifu</span>
          </div>

          {/* Menu */}
          <div className="flex items-center gap-4">
            <a href="#" className="text-sm text-neutral-300 hover:text-white">
              Chat
            </a>
            <a href="#" className="text-sm text-neutral-300 hover:text-white">
              Store
            </a>
            <Link href="/topup" className="text-sm text-neutral-300 hover:text-white">
              Top Up
            </Link>
          </div>
        </div>

        {/* Right: wallet connect / account */}
        <div className="w-full md:w-auto">
          {!account ? (
            <div className="flex justify-end">
              <ConnectButton
                client={client}
                wallets={wallets}
                connectModal={{ showThirdwebBranding: false }}
              />
            </div>
          ) : (
            <div className="flex items-center justify-between md:justify-end gap-3 w-full rounded border border-zinc-700 bg-zinc-800/60 px-3 py-1.5">
              <p className="text-sm">
                AA:{" "}
                <span className="font-mono">
                  {shortenAddress(account.address)}
                </span>
              </p>
              <button
                onClick={() => disconnect(wallet!)}
                className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
