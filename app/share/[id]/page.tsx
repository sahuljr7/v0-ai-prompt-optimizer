'use client';

import { useState, useEffect } from 'react';
import { MessageBubble } from '@/components/chat/message-bubble';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function SharePage() {
  const params = useParams();
  const shareId = params?.id as string;
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // In a real app, you'd fetch the conversation from a database
    // For now, we'll show a placeholder
    setIsLoading(false);
    setError('Shared conversation not found. Share IDs are generated locally in this demo.');
  }, [shareId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Share Not Found</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
        <Link href="/">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Chat
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="border-b border-border p-4">
        <Link href="/">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Chat
          </Button>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2">No messages to display</h2>
              <p className="text-muted-foreground">This conversation is empty or no longer available.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 max-w-4xl mx-auto">
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                id={msg.id}
                role={msg.role}
                content={msg.content}
                isEdited={msg.isEdited}
              />
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-border p-4 text-center text-sm text-muted-foreground">
        <p>This is a read-only view of a shared conversation</p>
      </div>
    </div>
  );
}
