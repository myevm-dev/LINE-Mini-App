// src/app/store/create/page.tsx
"use client";

import { useState } from "react";
import CreatePreview from "./CreatePreview";
import CreateForm from "./CreateForm";
import { defaultSpec, type PersonalitySpec } from "./PersonalityTypes";

/* ----------------- helpers ----------------- */
function publicFromSpec(spec: PersonalitySpec) {
  return {
    version: spec.version,
    tier: spec.tier,
    coreTraits: (spec.coreTraits || []).map((t) => t.trim()).filter(Boolean),
    warmth: spec.warmth,
    empathy: spec.empathy,
    humor: spec.humor,
    energy: spec.energy,
    convoLength: spec.convoLength,
    emojiUse: spec.emojiUse,
    boundaries: spec.boundaries,
  };
}
function buildAttributes(pub: ReturnType<typeof publicFromSpec>) {
  return [
    { trait_type: "Tier", value: pub.tier },
    { trait_type: "Warmth", value: pub.warmth },
    { trait_type: "Empathy", value: pub.empathy },
    { trait_type: "Humor", value: pub.humor },
    { trait_type: "Energy", value: pub.energy },
    { trait_type: "Conversation Length", value: pub.convoLength },
    { trait_type: "Emoji Use", value: pub.emojiUse },
    { trait_type: "Boundaries", value: pub.boundaries },
    { trait_type: "Core Traits", value: pub.coreTraits.join(", ") },
  ];
}
const ipfsUri = (cid: string) => `ipfs://${cid}`;
const gw = (cid: string) => `https://ipfs.io/ipfs/${cid}`; // swap to your preferred gateway

// AES helpers
async function aesGenKey() {
  return crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
}
function encStr(s: string) {
  return new TextEncoder().encode(s);
}
function b64(u8: Uint8Array) {
  let s = "";
  for (let i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]);
  return btoa(s);
}
function randIV(n = 12) {
  const iv = new Uint8Array(n);
  crypto.getRandomValues(iv);
  return iv;
}
async function aesEncryptText(plain: string, key: CryptoKey) {
  const iv = randIV();
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encStr(plain || "")));
  return { ivB64: b64(iv), cipherB64: b64(ct) };
}

// IPFS routes (your Next.js API)
async function pinJSON(obj: any) {
  const r = await fetch("/api/ipfs/pin-json", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(obj),
  });
  if (!r.ok) throw new Error("pin json failed");
  const j = await r.json();
  return j.cid as string;
}
async function pinFile(blob: Blob, name: string) {
  const fd = new FormData();
  fd.append("file", blob, name);
  fd.append("name", name);
  const r = await fetch("/api/ipfs/upload", { method: "POST", body: fd });
  if (!r.ok) throw new Error("pin file failed");
  const j = await r.json();
  return j.cid as string;
}

async function exportAesRawB64(key: CryptoKey) {
  const raw = new Uint8Array(await crypto.subtle.exportKey("raw", key));
  let s = "";
  for (let i = 0; i < raw.length; i++) s += String.fromCharCode(raw[i]);
  return btoa(s);
}

/* ----------------- page ----------------- */
type Tab = "personalities" | "models";

export default function StoreCreatePage() {
  const [tab, setTab] = useState<Tab>("personalities");
  const [spec, setSpec] = useState<PersonalitySpec>(defaultSpec);
  const [busy, setBusy] = useState(false);

  const onPublish = async () => {
    try {
      setBusy(true);

      // 1) encrypt private fields
      const key = await aesGenKey();
      const encOpener = await aesEncryptText(spec.opener ?? "", key);
      const encNotes = await aesEncryptText(spec.notes ?? "", key);
      const encPayload = {
        version: "1.0",
        algo: "AES-GCM-256",
        fields: {
          opener: { iv: encOpener.ivB64, cipher: encOpener.cipherB64 },
          notes: { iv: encNotes.ivB64, cipher: encNotes.cipherB64 },
        },
      };
      const encCid = await pinJSON(encPayload);

      // 1b) export raw AES key and wrap with server master
      const keyB64 = await exportAesRawB64(key);
      const wrapRes = await fetch("/api/keys/wrap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyB64 }),
      });
      if (!wrapRes.ok) throw new Error("wrap failed");
      const { wrappedKeyB64, wrapAlgo, keyVersion } = await wrapRes.json();

      // 2) generate blockies image from PUBLIC traits
      const pub = publicFromSpec(spec);
      const seed = JSON.stringify(pub, Object.keys(pub).sort());
      const mod = (await import("ethereum-blockies")) as any;
      const blockies = mod.default ?? mod;
      const icon: HTMLCanvasElement = blockies.create({ seed, size: 16, scale: 16 });
      const imageBlob: Blob = await new Promise((res) =>
        icon.toBlob((b) => res(b as Blob), "image/png"),
      );
      const imageCid = await pinFile(imageBlob, "personality.png");

      // 3) build metadata (includes wrappedKey)
      const metadata = {
        description: "Premium Personality: public traits. Opener & notes encrypted.",
        image: ipfsUri(imageCid),
        attributes: buildAttributes(pub),
        encrypted: {
          cid: encCid, // ciphertext JSON on IPFS
          algo: "AES-GCM-256",
          wrappedKey: wrappedKeyB64, // safe to publish
          wrapAlgo,
          keyVersion,
        },
      };
      const metadataCid = await pinJSON(metadata);

      // 4) confirm URLs
      const msg =
        `✅ Published!\n\n` +
        `Metadata (ipfs): ${ipfsUri(metadataCid)}\n` +
        `Metadata (https): ${gw(metadataCid)}\n\n` +
        `Image (ipfs): ${ipfsUri(imageCid)}\n` +
        `Image (https): ${gw(imageCid)}\n\n` +
        `Encrypted JSON (ipfs): ${ipfsUri(encCid)}\n` +
        `Encrypted JSON (https): ${gw(encCid)}`;
      alert(msg);

      console.log({ metadataCid, imageCid, encCid });
    } catch (e) {
      console.error(e);
      alert("Encrypt & Publish failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-neutral-200 pt-20">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header + Tabs */}
        <div className="flex items-end justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {tab === "personalities" ? "Create Personality" : "Create Model"}
            </h1>
            <p className="text-sm text-neutral-400">
              Create standardized personality traits for public NFT attributes; encrypt opener &
              notes.
            </p>
          </div>

          <div className="inline-flex rounded-xl border border-zinc-800 overflow-hidden">
            <button
              onClick={() => setTab("personalities")}
              className={`px-4 py-2 text-sm ${
                tab === "personalities"
                  ? "bg-zinc-800 text-white"
                  : "bg-zinc-900 text-neutral-300 hover:text-white"
              }`}
            >
              Personalities
            </button>
            <button
              aria-disabled
              title="Coming soon"
              className={`px-4 py-2 text-sm border-l border-zinc-800 cursor-not-allowed ${
                tab === "models"
                  ? "bg-zinc-800 text-white"
                  : "bg-zinc-900 text-neutral-500"
              }`}
            >
              Models (soon)
            </button>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CreatePreview spec={spec} />
          {tab === "personalities" ? (
            <CreateForm
              spec={spec}
              onChange={setSpec}
              onSaveDraft={() => console.log("Save draft:", spec)}
              onPublish={onPublish}
              busy={busy}
            />
          ) : (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 text-sm text-neutral-400">
              Models creation is not available yet.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
