"use client";

import { useEffect, useState, useCallback } from "react";
import { UploadSection } from "@/components/upload-section";
import { TranscriptsTable } from "@/components/transcripts-table";

interface Transcript {
  id: string;
  fileName: string;
  transcript: string;
  duration: string | null;
  createdAt: string;
}

export default function DashboardPage() {
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTranscripts = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/transcripts");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setTranscripts(data.transcripts || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTranscripts();
  }, [fetchTranscripts]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Transcriptions</h1>
        <p className="text-slate-500 mt-2">Upload audio files and transcribe them instantly with Gemini AI.</p>
      </div>

      <UploadSection onUploadSuccess={fetchTranscripts} />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-800">Recent Transcripts</h2>
        </div>
        <TranscriptsTable transcripts={transcripts} isLoading={isLoading} />
      </div>
    </div>
  );
}
