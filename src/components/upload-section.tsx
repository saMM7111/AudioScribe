"use client";

import { useState, useRef } from "react";
import { UploadCloud } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface UploadSectionProps {
  onUploadSuccess: () => void;
}

export function UploadSection({ onUploadSuccess }: UploadSectionProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const validateAndUpload = async (file: File) => {
    const validTypes = ["audio/mpeg", "audio/wav", "audio/x-m4a", "audio/ogg", "audio/webm", "audio/mp4"];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|m4a|ogg|webm)$/i)) {
      toast.error("Invalid file type. Please upload a supported audio file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setIsUploading(true);

    try {
      // Validate duration (client-side)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      if (audioBuffer.duration > 60) {
        toast.error("Audio must be under 1 minute long.");
        setIsUploading(false);
        return;
      }

      // Convert to base64 for API
      // Convert to base64 for API
      const base64Audio = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = () => reject(new Error("Failed to read file"));
      });

      const response = await fetch("/api/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          mimeType: file.type || "audio/mpeg",
          data: base64Audio,
          duration: Math.round(audioBuffer.duration).toString()
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to transcribe audio");
      }

      toast.success("Audio transcribed successfully!");
      onUploadSuccess();

    } catch (error: unknown) {
      console.error(error);
      toast.error((error as Error).message || "An error occurred during upload.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndUpload(e.target.files[0]);
    }
  };

  return (
    <Card className="overflow-hidden border-dashed border-2 border-slate-300 bg-slate-50">
      <CardContent className="p-0">
        <label
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "flex flex-col items-center justify-center w-full h-64 cursor-pointer transition-colors",
            isDragging ? "bg-blue-50 border-blue-400" : "hover:bg-slate-100",
            isUploading ? "pointer-events-none opacity-80" : ""
          )}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {isUploading ? (
              <div className="flex flex-col items-center space-y-4">
                <div className="relative flex items-center justify-center h-16 w-16">
                  <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-spin"></div>
                  {/* Bonus: Waveform-like animation */}
                  <div className="flex items-center space-x-1">
                    <div className="w-1 h-3 bg-blue-500 animate-pulse rounded-full"></div>
                    <div className="w-1 h-6 bg-blue-500 animate-pulse delay-75 rounded-full"></div>
                    <div className="w-1 h-4 bg-blue-500 animate-pulse delay-150 rounded-full"></div>
                    <div className="w-1 h-8 bg-blue-500 animate-pulse delay-200 rounded-full"></div>
                    <div className="w-1 h-3 bg-blue-500 animate-pulse delay-300 rounded-full"></div>
                  </div>
                </div>
                <p className="text-sm font-semibold text-blue-600">Transcribing with Gemini...</p>
              </div>
            ) : (
              <>
                <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                  <UploadCloud className="w-8 h-8 text-slate-500" />
                </div>
                <p className="mb-2 text-sm text-slate-700">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-slate-500">
                  MP3, WAV, M4A, OGG, WEBM (Max 1 minute)
                </p>
              </>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".mp3,.wav,.m4a,.ogg,.webm,audio/*"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </label>
      </CardContent>
    </Card>
  );
}
