import { ReactNode } from 'react';
import { Sidebar } from './sidebar';
import { Footer } from './footer';

type TabType = 'chat' | 'optimizer';

interface AppShellProps {
  children: ReactNode;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function AppShell({ children, activeTab, onTabChange }: AppShellProps) {
  return (
    <div className="flex h-screen bg-background flex-col">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeTab={activeTab} onTabChange={onTabChange} />
        <main className="flex-1 flex flex-col overflow-hidden">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}
