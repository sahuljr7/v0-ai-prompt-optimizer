'use client';

import { ReactNode } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { usePathname, useRouter } from 'next/navigation';

export default function RoutesLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  
  // Extract the current app from pathname
  const appMatch = pathname.match(/^\/(chat|optimizer|transcript)/);
  const currentApp = (appMatch?.[1] || 'chat') as 'chat' | 'optimizer' | 'transcript';

  const handleTabChange = (tab: 'chat' | 'optimizer' | 'transcript') => {
    router.push(`/${tab}`);
  };

  return (
    <AppShell activeTab={currentApp} onTabChange={handleTabChange}>
      {children}
    </AppShell>
  );
}
