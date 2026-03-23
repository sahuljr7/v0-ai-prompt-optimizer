'use client';

import { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { ChatWindow } from '@/components/chat/chat-window';
import { PromptOptimizerPanel } from '@/components/optimizer/prompt-optimizer-panel';

type TabType = 'chat' | 'optimizer';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('chat');

  return (
    <AppShell activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'chat' && <ChatWindow />}
      {activeTab === 'optimizer' && <PromptOptimizerPanel />}
    </AppShell>
  );
}
