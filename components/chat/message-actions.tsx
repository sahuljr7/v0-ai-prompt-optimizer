'use client';

import { useState } from 'react';
import { Copy, Check, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MessageActionsProps {
  content: string;
  messageId: string;
  isUser: boolean;
  onEdit?: () => void;
}

export function MessageActions({
  content,
  messageId,
  isUser,
  onEdit,
}: MessageActionsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopy}
        className="h-auto p-1 text-muted-foreground hover:text-foreground"
        title="Copy message"
      >
        {copied ? (
          <Check className="w-3 h-3" />
        ) : (
          <Copy className="w-3 h-3" />
        )}
      </Button>

      {isUser && onEdit && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="h-auto p-1 text-muted-foreground hover:text-foreground"
          title="Edit message"
        >
          <Edit2 className="w-3 h-3" />
        </Button>
      )}
    </div>
  );
}
