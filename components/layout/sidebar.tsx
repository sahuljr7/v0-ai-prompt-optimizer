'use client';

import { MessageCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

type TabType = 'chat' | 'optimizer';

interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  isMobile?: boolean;
}

export function Sidebar({ activeTab, onTabChange, isMobile = false }: SidebarProps) {
  const navItems = [
    { id: 'chat' as TabType, label: 'Chat', icon: MessageCircle },
    { id: 'optimizer' as TabType, label: 'Optimizer', icon: Sparkles },
  ];

  return (
    <aside className={`${
      isMobile 
        ? 'w-full bg-card' 
        : 'w-64 bg-sidebar border-r border-sidebar-border'
    } flex flex-col`}>
      {!isMobile && (
        <div className="p-6 border-b border-sidebar-border">
          <h1 className="text-2xl font-bold text-sidebar-foreground tracking-tight">
            AI Assistant
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Powered by Ollama</p>
        </div>
      )}

      <nav className={`${
        isMobile 
          ? 'flex gap-2 p-4' 
          : 'flex-1 p-6 space-y-2'
      }`}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={activeTab === item.id ? 'default' : 'ghost'}
              className={`${
                isMobile
                  ? 'flex-1 gap-2 text-sm'
                  : 'w-full justify-start gap-3'
              }`}
              onClick={() => onTabChange(item.id)}
            >
              <Icon className="w-4 h-4" />
              <span className={isMobile ? 'text-xs' : ''}>{item.label}</span>
            </Button>
          );
        })}
      </nav>

      {!isMobile && (
        <div className="p-6 border-t border-sidebar-border">
          <p className="text-xs text-muted-foreground text-center">
            AI Chat Assistant v1.0
          </p>
        </div>
      )}
    </aside>
  );
}
