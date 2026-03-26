'use client';

import { ReactNode, useState } from 'react';
import { Sidebar } from './sidebar';
import { Footer } from './footer';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

type TabType = 'chat' | 'optimizer' | 'transcript';

interface AppShellProps {
  children: ReactNode;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function AppShell({ children, activeTab, onTabChange }: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleTabChange = (tab: TabType) => {
    onTabChange(tab);
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-background flex-col">
      {/* Mobile Header */}
      <div className="md:hidden border-b border-border bg-card p-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-foreground">AI Assistant</h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2"
        >
          {mobileMenuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </Button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-card">
          <Sidebar 
            activeTab={activeTab} 
            onTabChange={handleTabChange}
            isMobile={true}
          />
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar activeTab={activeTab} onTabChange={onTabChange} />
        </div>

        <main className="flex-1 flex flex-col overflow-hidden w-full">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}
