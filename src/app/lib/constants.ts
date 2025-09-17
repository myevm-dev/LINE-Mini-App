// src/app/lib/constants.ts

/** Kaia mainnet */
export const KAIA_CHAIN_ID = 8217 as const;

/** Explorers / Repos */
export const EXPLORERS = {
  /** Token pages (ERC-20) => EXPLORERS.token(<addr>) */
  tokenBase: "https://kaiascan.io/token/",
  /** Sourcify repo (chain 8217) */
  sourcifyBase: "https://repo.sourcify.dev/8217/0xf9df94efe72a44810c6c9a4921d27eb607ac38c0",
} as const;

/** Deployed contracts (Kaia mainnet 8217) */
export const ADDRESSES = {
  WAIFU_TOP_UP: "0xf9df94efe72a44810c6c9a4921d27eb607ac38c0",
  USDT: "0x9025095263d1e548dc890a7589a4c78038ac40ab",
} as const;

/** Token metadata */
export const TOKEN = {
  USDT: {
    symbol: "USDT",
    decimals: 6,
    address: ADDRESSES.USDT,
  },
} as const;

/** URL helpers */
export const urls = {
  /** KaiaScan token page (ERC-20) */
  token: (addr: string) => `${EXPLORERS.tokenBase}${addr}`,

  sourcifyChainBase: () => EXPLORERS.sourcifyBase,
} as const;

/** Pricing helpers (USDT 6-dec) */
export const PRICE = {
  /** 1 cent in 6-dec tokens = 10,000 */
  ONE_CENT_6DEC: 10_000,
  /**
   * Convert USD cents -> 6-dec token units (e.g., USDT).
   * Example: centsTo6dec(1) = 10_000; centsTo6dec(12) = 120_000
   */
  centsTo6dec: (cents: number) => Math.trunc(cents) * 10_000,
} as const;

export const MAX_UINT256 = BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
