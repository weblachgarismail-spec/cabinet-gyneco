import { NextRequest, NextResponse } from "next/server";
import { getResponse } from "@/lib/chatbot";
import type { ChatContext } from "@/lib/chatbot";

export async function POST(request: NextRequest) {
  try {
    const { message, locale, context } = await request.json();
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    const result = getResponse(
      message.slice(0, 500),
      locale === "ar" ? "ar" : "fr",
      context as ChatContext | undefined,
    );
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
