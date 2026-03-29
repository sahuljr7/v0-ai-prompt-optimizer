'use client';

import { PromptOptimizerPanel } from '@/components/optimizer/prompt-optimizer-panel';

export default function OptimizerPage() {
  return (
    <div className="h-screen w-full flex flex-col bg-background overflow-hidden">
      <PromptOptimizerPanel />
    </div>
  );
}
