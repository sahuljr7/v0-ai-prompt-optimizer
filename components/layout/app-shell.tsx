'use client';

import { ReactNode, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from './sidebar';
import { Footer } from './footer';
import { Menu, X, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

type TabType = 'chat' | 'optimizer' | 'transcript';

interface AppShellProps {
  children: ReactNode;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function AppShell({ children, activeTab, onTabChange }: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  
  // Only show full shell for route-based pages (not homepage)
  const isRoutePage = pathname !== '/';

  const handleTabChange = (tab: TabType) => {
    onTabChange(tab);
    setMobileMenuOpen(false);
  };

  if (!isRoutePage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-background flex-col">
      {/* Mobile Header */}
      <div className="md:hidden border-b border-border bg-card p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/')}
            className="gap-2 p-2"
          >
            <Home className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold text-foreground">AI Assistant</h1>
        </div>
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
          <Sidebar activeTab={activeTab} onTabChange={onTabChange} homeButtonVisible={true} />
        </div>

        <main className="flex-1 flex flex-col overflow-hidden w-full">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}
