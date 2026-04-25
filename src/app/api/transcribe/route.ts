import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { transcripts } from "@/lib/schema";
import { headers } from "next/headers";

// Gemini only accepts these specific audio MIME types
const MIME_TYPE_MAP: Record<string, string> = {
  "audio/mpeg":   "audio/mpeg",
  "audio/mp3":    "audio/mpeg",
  "audio/wav":    "audio/wav",
  "audio/x-wav":  "audio/wav",
  "audio/ogg":    "audio/ogg",
  "audio/webm":   "audio/webm",
  "audio/mp4":    "audio/mp4",
  "audio/x-m4a":  "audio/mp4",   // ← most common culprit
  "audio/m4a":    "audio/mp4",
};



export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { fileName, mimeType, data, duration } = body;

    if (!fileName || !mimeType || !data) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API key is not configured" }, { status: 500 });
    }

    // Normalize to a MIME type Gemini actually accepts
    const safeMimeType = MIME_TYPE_MAP[mimeType] ?? "audio/mpeg";
    console.log(`Transcribing: mimeType=${mimeType} → safeMimeType=${safeMimeType}`);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: "Transcribe this audio accurately. Return only the transcript text, nothing else. Do not add conversational text." },
              { inline_data: { mime_type: safeMimeType, data } }
            ]
          }]
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      return NextResponse.json(
        { error: `Gemini rejected the request: ${response.status}` },
        { status: 500 }
      );
    }

    const resultData = await response.json();

    const transcriptText = resultData?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!transcriptText) {
      console.error("Unexpected Gemini response shape:", JSON.stringify(resultData));
      return NextResponse.json({ error: "Invalid response from Gemini API" }, { status: 500 });
    }

    const savedTranscript = await db.insert(transcripts).values({
      userId: session.user.id,
      fileName,
      transcript: transcriptText.trim(),
      duration: duration ? String(duration) : null,
    }).returning();

    return NextResponse.json({ transcript: savedTranscript[0] });

  } catch (error) {
    console.error("Error in transcription route:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}