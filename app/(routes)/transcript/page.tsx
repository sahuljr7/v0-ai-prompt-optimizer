'use client';

import { TranscriptAnalyzerPanel } from '@/components/transcript/transcript-analyzer-panel';

export default function TranscriptPage() {
  return (
    <div className="h-screen w-full flex flex-col bg-background overflow-hidden">
      <TranscriptAnalyzerPanel />
    </div>
  );
}
