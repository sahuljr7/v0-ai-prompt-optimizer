'use client';

import { useState } from 'react';
import { Copy, Check, Edit2, Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MessageActionsProps {
  content: string;
  messageId: string;
  isUser: boolean;
  onEdit?: () => void;
  onExport?: () => void;
  onShare?: () => void;
}

export function MessageActions({
  content,
  messageId,
  isUser,
  onEdit,
  onExport,
  onShare,
}: MessageActionsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopy}
        className="h-auto p-1 text-muted-foreground hover:text-foreground"
        title="Copy message"
      >
        {copied ? (
          <Check className="w-4 h-4" />
        ) : (
          <Copy className="w-4 h-4" />
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
          <Edit2 className="w-4 h-4" />
        </Button>
      )}

      {onExport && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onExport}
          className="h-auto p-1 text-muted-foreground hover:text-foreground"
          title="Download as markdown"
        >
          <Download className="w-4 h-4" />
        </Button>
      )}

      {onShare && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onShare}
          className="h-auto p-1 text-muted-foreground hover:text-foreground"
          title="Share conversation"
        >
          <Share2 className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
