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
import { KAIA } from "../lib/kaia"; // your defineChain(8217) with keyed RPC

// --- AA config ---------------------------------------------------------------
// Your deployed factory (LightAccount/Kernel/etc.) on Kaia:
const FACTORY = "0x907617627547f5de2a403d68068261756f362338";

// ✅ Use the v5-compatible signatures your project has:
// - `smartWallet({...})` WITHOUT `personalWallets`
// - Provide `inAppWallet(...)` separately in the array so the modal can use it as a personal wallet
const wallets = [
  smartWallet({
    chain: KAIA,
    factoryAddress: FACTORY,
    sponsorGas: false, // set true only if you have a paymaster on Kaia
    // bundlerUrl?: "https://<your-bundler>/rpc",
    // paymaster?: { rpcUrl: "https://<your-paymaster>" },
  }),
  inAppWallet({
    auth: { options: ["email"] },
  }),
  // You can also add metamask(), coinbaseWallet(), etc. here if desired.
];

export default function RockPaperScissors() {
  const account = useActiveAccount(); // AA smart account address
  const wallet = useActiveWallet();   // underlying personal wallet
  const { disconnect } = useDisconnect();

  return (
    <div className="flex justify-center items-center h-screen w-screen bg-zinc-950 text-neutral-200">
      <div className="p-8 mx-2 w-[420px] max-w-[98%] h-[420px] bg-zinc-900 text-neutral-200 rounded-lg shadow-lg flex flex-col items-center justify-between border border-zinc-800">
        <h1 className="text-2xl font-bold text-center text-white">Mini Game</h1>

        {!account ? (
          <div className="flex flex-col items-center gap-4">
            <p className="text-sm text-neutral-400">Connect to get started</p>
            <ConnectButton
              client={client}
              wallets={wallets} // AA via your factory; inApp is available as the personal wallet
              connectModal={{ showThirdwebBranding: false }}
            />
          </div>
        ) : (
          <div className="w-full">
            <div className="flex items-center justify-between border border-zinc-800 bg-zinc-800/50 p-3 rounded">
              <div className="space-y-0.5">
                <p className="font-medium text-white">
                  AA: {shortenAddress(account.address)}
                </p>
                <p className="text-xs text-neutral-400">Connected (AA smart account)</p>
              </div>
              <button
                onClick={() => disconnect(wallet!)}
                className="px-3 py-1.5 bg-red-600 text-white rounded text-xs hover:bg-red-700"
              >
                Logout
              </button>
            </div>

            <div className="mt-8 flex flex-col items-center gap-3">
              <p className="text-center text-neutral-300">
                Rock–Paper–Scissors coming soon.
              </p>
              <div className="flex gap-2">
                <button
                  disabled
                  className="px-4 py-2 rounded bg-zinc-800 text-neutral-500 cursor-not-allowed"
                >
                  🪨
                </button>
                <button
                  disabled
                  className="px-4 py-2 rounded bg-zinc-800 text-neutral-500 cursor-not-allowed"
                >
                  📄
                </button>
                <button
                  disabled
                  className="px-4 py-2 rounded bg-zinc-800 text-neutral-500 cursor-not-allowed"
                >
                  ✂️
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="text-xs text-neutral-500">Placeholder build • AA enabled</div>
      </div>
    </div>
  );
}
