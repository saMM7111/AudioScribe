import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { transcripts } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userTranscripts = await db
      .select()
      .from(transcripts)
      .where(eq(transcripts.userId, session.user.id))
      .orderBy(desc(transcripts.createdAt));

    return NextResponse.json({ transcripts: userTranscripts });
  } catch (error) {
    console.error("Error fetching transcripts:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
