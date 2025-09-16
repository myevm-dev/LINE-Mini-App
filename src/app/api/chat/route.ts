import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const dynamic = "force-dynamic";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

type InMsg = { role: "user" | "assistant"; content: string };

// Use the client’s built-in types
type ContentBlock = Anthropic.Messages.ContentBlock;
type TextBlock = Anthropic.Messages.TextBlock;

function isTextBlock(b: ContentBlock): b is TextBlock {
  return b.type === "text" && typeof (b as any).text === "string";
}

export async function POST(req: Request) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "Missing ANTHROPIC_API_KEY" },
        { status: 500 }
      );
    }

    const body = (await req.json()) as { messages: InMsg[] };
    const messages: InMsg[] = Array.isArray(body.messages) ? body.messages : [];

    const resp = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 512,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const text = resp.content
      .filter(isTextBlock)
      .map((b) => b.text)
      .join("\n")
      .trim();

    return NextResponse.json({ reply: text });
  } catch (err) {
    console.error("Anthropic /api/chat error:", err);
    return NextResponse.json(
      { error: "Anthropic request failed" },
      { status: 500 }
    );
  }
}