import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";        // Anthropic SDK needs Node runtime
export const maxDuration = 60;          // avoids short edge timeouts

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

type InMsg = { role: "user" | "assistant"; content: string };

// Local types from client (no extra import needed)
type ContentBlock = Anthropic.Messages.ContentBlock;
type TextBlock = Anthropic.Messages.TextBlock;
const isTextBlock = (b: ContentBlock): b is TextBlock =>
  b?.type === "text" && typeof (b as any).text === "string";

export async function POST(req: Request) {
  try {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) {
      return NextResponse.json({ error: "Missing ANTHROPIC_API_KEY" }, { status: 500 });
    }

    const body = (await req.json()) as { messages?: InMsg[] };
    const messages: InMsg[] = Array.isArray(body.messages) ? body.messages : [];
    if (!messages.length) {
      return NextResponse.json({ reply: "Say hi to Aiko ✨" });
    }

    // Try multiple models in case your account lacks access to Sonnet 3.5
    const models = [
      "claude-3-5-sonnet-20240620",
      "claude-3-sonnet-20240229",
      "claude-3-haiku-20240307",
    ] as const;

    let reply = "";
    let lastErr: unknown = null;

    for (const model of models) {
      try {
        const resp = await anthropic.messages.create({
          model,
          max_tokens: 512,
          messages: messages.map((m) => ({
            role: m.role,
            content: m.content, // strings OK
          })),
        });

        reply = resp.content.filter(isTextBlock).map((b) => b.text).join("\n").trim();
        if (reply) break;
      } catch (e) {
        lastErr = e;
      }
    }

    if (!reply) {
      const detail =
        (lastErr as any)?.message ??
        (typeof lastErr === "string" ? lastErr : "Unknown error");
      return NextResponse.json({ error: `No text reply from Anthropic. ${detail}` }, { status: 500 });
    }

    return NextResponse.json({ reply });
  } catch (err: any) {
    console.error("Anthropic /api/chat error:", err);
    return NextResponse.json({ error: err?.message || "Anthropic request failed" }, { status: 500 });
  }
}
