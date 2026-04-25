"use client";

import { useState } from "react";
import { format } from "date-fns";
import { FileText, Copy, Download, Eye, Clock } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface Transcript {
  id: string;
  fileName: string;
  transcript: string;
  duration: string | null;
  createdAt: string;
}

interface TranscriptsTableProps {
  transcripts: Transcript[];
  isLoading: boolean;
}

export function TranscriptsTable({ transcripts, isLoading }: TranscriptsTableProps) {
  const [selectedTranscript, setSelectedTranscript] = useState<Transcript | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Transcript copied to clipboard");
  };

  const handleDownload = (transcript: Transcript) => {
    const element = document.createElement("a");
    const file = new Blob([transcript.transcript], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${transcript.fileName}-transcript.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Download started");
  };

  const handleView = (transcript: Transcript) => {
    setSelectedTranscript(transcript);
    setIsDialogOpen(true);
  };

  const getWordCount = (text: string) => text.split(/\s+/).filter(w => w.length > 0).length;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (transcripts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg border border-slate-200 border-dashed text-center">
        <FileText className="w-12 h-12 text-slate-300 mb-4" />
        <h3 className="text-lg font-medium text-slate-900">No transcripts yet</h3>
        <p className="text-sm text-slate-500 mt-1">Upload an audio file above to get started.</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead className="w-[50px]">#</TableHead>
              <TableHead>File Name</TableHead>
              <TableHead className="hidden md:table-cell w-[40%]">Transcript Preview</TableHead>
              <TableHead className="w-[150px]">Date</TableHead>
              <TableHead className="text-right w-[200px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transcripts.map((t, index) => (
              <TableRow key={t.id} className="group hover:bg-slate-50/50 transition-colors">
                <TableCell className="font-medium text-slate-500">{index + 1}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-blue-500" />
                    <span className="font-medium truncate max-w-[150px] md:max-w-[200px]" title={t.fileName}>
                      {t.fileName}
                    </span>
                  </div>
                  {t.duration && (
                    <div className="flex items-center mt-1 text-xs text-slate-500">
                      <Clock className="w-3 h-3 mr-1" />
                      {t.duration}s
                    </div>
                  )}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <p className="text-sm text-slate-600 truncate max-w-[300px] lg:max-w-[400px]">
                    {t.transcript}
                  </p>
                </TableCell>
                <TableCell className="text-sm text-slate-600">
                  {format(new Date(t.createdAt), "MMM d, yyyy")}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleView(t)} title="View Full">
                      <Eye className="w-4 h-4 text-slate-600" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleCopy(t.transcript)} title="Copy Text">
                      <Copy className="w-4 h-4 text-slate-600" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDownload(t)} title="Download .txt">
                      <Download className="w-4 h-4 text-slate-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 border-b pb-4">
              <FileText className="w-5 h-5 text-blue-500" />
              <span className="truncate pr-8">{selectedTranscript?.fileName}</span>
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="flex-1 mt-4 p-4 bg-slate-50 rounded-md border text-sm leading-relaxed text-slate-800 h-[50vh]">
            {selectedTranscript?.transcript.split('\n').map((paragraph, i) => (
              <p key={i} className="mb-4 last:mb-0">{paragraph}</p>
            ))}
          </ScrollArea>
          
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="flex items-center space-x-4 text-sm text-slate-500">
              <span className="flex items-center">
                <strong className="mr-1">Words:</strong> {selectedTranscript ? getWordCount(selectedTranscript.transcript) : 0}
              </span>
              <span className="flex items-center">
                <strong className="mr-1">Characters:</strong> {selectedTranscript?.transcript.length || 0}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={() => {
                if (selectedTranscript) handleCopy(selectedTranscript.transcript);
              }}>
                <Copy className="w-4 h-4 mr-2" /> Copy
              </Button>
              <Button onClick={() => {
                if (selectedTranscript) handleDownload(selectedTranscript);
              }}>
                <Download className="w-4 h-4 mr-2" /> Download
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
