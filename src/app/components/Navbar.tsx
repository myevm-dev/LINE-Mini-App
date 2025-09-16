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
      <div className="mx-auto w-full max-w-6xl px-4 py-4 flex flex-col items-center gap-3 md:flex-row md:justify-between">
        {/* Brand + Menu */}
        <div className="flex flex-col items-center gap-3 md:flex-row md:gap-6">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <span className="text-pink-400 text-xl">💖</span>
            <span className="font-bold text-lg text-white">Pocket Waifu</span>
          </div>

          {/* Menu */}
          <div className="flex items-center gap-4 text-sm">
            <a href="#" className="text-neutral-300 hover:text-white">
              Chat
            </a>
            <a href="#" className="text-neutral-300 hover:text-white">
              Store
            </a>
            <a href="#" className="text-neutral-300 hover:text-white">
              Top Up
            </a>
          </div>
        </div>

        {/* Wallet */}
        <div className="w-full md:w-auto flex justify-center">
          {!account ? (
            <ConnectButton
              client={client}
              wallets={wallets}
              connectModal={{ showThirdwebBranding: false }}
            />
          ) : (
            <div className="flex items-center justify-between gap-3 w-full md:w-auto rounded border border-zinc-700 bg-zinc-800/60 px-3 py-1.5">
              <p className="text-sm">
                AA: <span className="font-mono">{shortenAddress(account.address)}</span>
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
