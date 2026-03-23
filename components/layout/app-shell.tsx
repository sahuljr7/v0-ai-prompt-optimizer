import { ReactNode } from 'react';
import { Sidebar } from './sidebar';

type TabType = 'chat' | 'optimizer' | 'settings';

interface AppShellProps {
  children: ReactNode;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function AppShell({ children, activeTab, onTabChange }: AppShellProps) {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeTab={activeTab} onTabChange={onTabChange} />
      <main className="flex-1 flex flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
}
