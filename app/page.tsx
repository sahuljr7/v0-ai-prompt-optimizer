'use client';

import { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { ChatWindow } from '@/components/chat/chat-window';
import { PromptOptimizerPanel } from '@/components/optimizer/prompt-optimizer-panel';
import { SettingsPanel } from '@/components/settings/settings-panel';
import { useAIConfig } from '@/lib/ai-config-context';

type TabType = 'chat' | 'optimizer' | 'settings';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('chat');
  const { config, updateConfig } = useAIConfig();

  return (
    <AppShell activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'chat' && (
        <ChatWindow
          apiKey={config.apiKey}
          temperature={config.temperature}
          maxTokens={config.maxTokens}
          modelName={config.modelName}
        />
      )}
      {activeTab === 'optimizer' && <PromptOptimizerPanel />}
      {activeTab === 'settings' && (
        <SettingsPanel
          apiKey={config.apiKey}
          temperature={config.temperature}
          maxTokens={config.maxTokens}
          modelName={config.modelName}
          onSave={(key, temp, tokens, model) =>
            updateConfig({ apiKey: key, temperature: temp, maxTokens: tokens, modelName: model })
          }
        />
      )}
    </AppShell>
  );
}
