'use client';

import { ReactNode } from 'react';

export default function RoutesLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Each app (chat, optimizer, transcript) is now standalone
  // No shared shell or sidebar
  return <>{children}</>;
}
