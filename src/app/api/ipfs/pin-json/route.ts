import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs"; // important: use Node runtime

export async function POST(req: NextRequest) {
  try {
    const jwt = process.env.PINATA_JWT;
    if (!jwt) return NextResponse.json({ error: "PINATA_JWT missing" }, { status: 500 });

    const body = await req.json();

    const r = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const j = await r.json();
    if (!r.ok) {
      console.error("pinJSON Pinata error:", j);
      return NextResponse.json({ error: j?.error || j?.message || "pinJSON failed" }, { status: r.status });
    }

    // { IpfsHash, PinSize, Timestamp }
    return NextResponse.json({ cid: j.IpfsHash });
  } catch (e: any) {
    console.error("pin-json route error:", e);
    return NextResponse.json({ error: e?.message || "pin json failed" }, { status: 500 });
  }
}
