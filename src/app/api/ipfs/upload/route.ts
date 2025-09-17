// src/app/api/ipfs/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";

function pinataHeaders() {
  const jwt = process.env.PINATA_JWT;
  if (jwt) return { Authorization: `Bearer ${jwt}` };

  const key = process.env.PINATA_API_KEY;
  const secret = process.env.PINATA_API_SECRET;
  if (key && secret) return { "pinata_api_key": key, "pinata_secret_api_key": secret };

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const auth = pinataHeaders();
    if (!auth) return NextResponse.json({ error: "Pinata credentials missing" }, { status: 500 });

    const form = await req.formData();
    const file = form.get("file") as File | null; // ciphertext or PNG
    const name = (form.get("name") as string) || "upload.bin";
    if (!file) return NextResponse.json({ error: "file required" }, { status: 400 });

    // Forward ONLY the 'file' part. (Avoid pinataMetadata/pinataOptions to dodge "Unexpected field")
    const fd = new FormData();
    fd.append("file", file, name);

    const r = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: auth as any, // don't set Content-Type; fetch will set boundary
      body: fd,
    });

    const j = await r.json();
    if (!r.ok) {
      console.error("pinFile Pinata error:", j);
      return NextResponse.json({ error: j?.error || j?.message || "pinFile failed" }, { status: r.status });
    }

    // j: { IpfsHash, PinSize, Timestamp }
    return NextResponse.json({ cid: j.IpfsHash });
  } catch (e: any) {
    console.error("upload route error:", e);
    return NextResponse.json({ error: e?.message || "upload failed" }, { status: 500 });
  }
}
