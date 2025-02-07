
import Image from "next/image";
import { ConnectButton } from "thirdweb/react";
import thirdwebIcon from "@public/thirdweb.svg";
import { client } from "./client";
import { useEffect, useState } from "react";
import liff from "@line/liff";
import { inAppWallet } from "thirdweb/wallets";
import RockPaperScissors from "./components/RockPaperScissors";

export default function Home() {

  return (
    <main className="p-4 pb-10 min-h-[100vh] flex items-center justify-center container max-w-screen-lg mx-auto">
      <div className="py-20">
        <RockPaperScissors />
      </div>
    </main>
  );
}
