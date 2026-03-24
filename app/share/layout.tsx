import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shared Conversation',
  description: 'View a shared chat conversation',
};

export default function ShareLayout({ children }: { children: React.ReactNode }) {
  return children;
}
