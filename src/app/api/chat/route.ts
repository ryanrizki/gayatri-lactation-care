import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import {
  MINBEE_SYSTEM_INSTRUCTION,
  MINBEE_FALLBACK_TEXT,
  MINBEE_ERROR_TEXT,
  MINBEE_MODEL,
} from "@/lib/minbee";

const apiKey = process.env.GEMINI_API_KEY;

const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { "User-Agent": "aistudio-build" } },
    })
  : null;

export async function POST(request: Request) {
  try {
    const { contents } = await request.json();

    if (!contents || !Array.isArray(contents)) {
      return NextResponse.json(
        { error: "Invalid request. 'contents' array is required." },
        { status: 400 },
      );
    }

    if (!ai) {
      return NextResponse.json({ text: MINBEE_FALLBACK_TEXT });
    }

    const response = await ai.models.generateContent({
      model: MINBEE_MODEL,
      contents,
      config: {
        systemInstruction: MINBEE_SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    return NextResponse.json({ text: response.text });
  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      {
        error: MINBEE_ERROR_TEXT,
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
