'use client';

import { MessageCircle, Sparkles, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

type TabType = 'chat' | 'optimizer' | 'settings';

interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const navItems = [
    { id: 'chat' as TabType, label: 'Chat', icon: MessageCircle },
    { id: 'optimizer' as TabType, label: 'Optimizer', icon: Sparkles },
    { id: 'settings' as TabType, label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-2xl font-bold text-sidebar-foreground tracking-tight">
          AI Assistant
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Powered by Ollama</p>
      </div>

      <nav className="flex-1 p-6 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={activeTab === item.id ? 'default' : 'ghost'}
              className="w-full justify-start gap-3"
              onClick={() => onTabChange(item.id)}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Button>
          );
        })}
      </nav>

      <div className="p-6 border-t border-sidebar-border">
        <p className="text-xs text-muted-foreground text-center">
          AI Chat Assistant v1.0
        </p>
      </div>
    </aside>
  );
}
