import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error:"GEMINI_API_KEY missing" }, { status:400 });

    const { title, prompt } = await req.json();
    const finalPrompt = prompt || `Write a detailed auction description for "${title}". Mention condition, features, and what's included. Keep under 100 words.`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-1.5-flash" });
    const result = await model.generateContent(finalPrompt);
    const text = result.response.text()?.trim();
    if (!text) return NextResponse.json({ error:"Empty AI response" }, { status:502 });

    return NextResponse.json({ description: text });
  } catch (e:any) {
    console.error("[/api/gemini] error:", e);
    return NextResponse.json({ error: e.message || "AI failed" }, { status: 500 });
  }
}
