import { defineChain } from "thirdweb";

export const KAIA = defineChain({
  id: 8217,
  name: "Kaia",
  nativeCurrency: { name: "KAI", symbol: "KAI", decimals: 18 },
  rpc: "https://8217.rpc.thirdweb.com/d6a7ed7c004eb6b2c724cefc7eb876a2",
  blockExplorers: [
    { name: "KaiaScan", url: "https://kaiascan.io" },
  ],
});
