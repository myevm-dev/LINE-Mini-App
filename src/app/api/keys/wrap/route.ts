import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export const runtime = "nodejs"; // ensure Node, not edge

function getMaster(): Buffer {
  const b64 = process.env.MASTER_KEY_B64;
  if (!b64) throw new Error("MASTER_KEY_B64 missing");
  const buf = Buffer.from(b64, "base64");
  if (buf.length !== 32) throw new Error("MASTER_KEY_B64 must be 32 bytes base64");
  return buf;
}

/** AES-256-GCM wrap: iv|tag|ciphertext -> base64 */
function wrapKeyWithMaster(rawKey: Buffer, master: Buffer): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", master, iv);
  const ct = Buffer.concat([cipher.update(rawKey), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ct]).toString("base64");
}

// quick health check: confirms route is mounted and env is OK
export async function GET() {
  try {
    const m = getMaster();
    return NextResponse.json({ ok: true, masterLen: m.length });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "unknown" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { keyB64 } = await req.json();
    if (!keyB64) return NextResponse.json({ error: "keyB64 required" }, { status: 400 });

    const master = getMaster();
    const rawKey = Buffer.from(keyB64, "base64");
    if (rawKey.length !== 32) {
      return NextResponse.json({ error: "keyB64 must be 32 bytes base64" }, { status: 400 });
    }

    const wrappedKeyB64 = wrapKeyWithMaster(rawKey, master);
    return NextResponse.json({ wrappedKeyB64, wrapAlgo: "AES-GCM-256", keyVersion: 1 });
  } catch (e: any) {
    console.error("wrap route error:", e);
    return NextResponse.json({ error: e?.message || "wrap failed" }, { status: 500 });
  }
}
