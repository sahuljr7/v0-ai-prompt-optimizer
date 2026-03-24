'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MessageEditor } from './message-editor';
import { MessageActions } from './message-actions';

interface MessageBubbleProps {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isEdited?: boolean;
  attachments?: Array<{ name: string; size: number; type: string }>;
  onEdit?: (messageId: string, newContent: string) => void;
}

export function MessageBubble({
  id,
  role,
  content,
  isEdited,
  attachments,
  onEdit,
}: MessageBubbleProps) {
  const isUser = role === 'user';
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEditSave = (newContent: string) => {
    if (onEdit) {
      onEdit(id, newContent);
      setIsEditing(false);
    }
  };

  if (isEditing && isUser) {
    return (
      <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
        <div className="max-w-2xl w-full">
          <MessageEditor
            initialContent={content}
            onSave={handleEditSave}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} gap-1 sm:gap-2 px-3 sm:px-6`}>
      {!isUser && (
        <MessageActions
          content={content}
          messageId={id}
          isUser={false}
        />
      )}
      <div className="flex-1 sm:flex-none">
        <div
          className={`max-w-xs sm:max-w-md md:max-w-2xl px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base break-words ${
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground'
          }`}
        >
          {isUser ? (
            <div className="whitespace-pre-wrap">
              {content}
              {isEdited && <span className="text-xs ml-2 italic opacity-70">(edited)</span>}
            </div>
          ) : (
            <div className="prose prose-invert prose-sm sm:prose-base max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  const codeString = String(children).replace(/\n$/, '');
                  const language = match ? match[1] : 'text';
                  
                  if (!inline && match) {
                    return (
                      <div className="relative group">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(codeString);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                          }}
                          className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity h-auto p-1 text-xs"
                        >
                          {copied ? (
                            <>
                              <Check className="w-3 h-3 mr-1" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 mr-1" />
                              Copy
                            </>
                          )}
                        </Button>
                        <div className="text-xs text-muted-foreground mb-2 font-mono">{language}</div>
                        <SyntaxHighlighter
                          style={atomDark}
                          language={language}
                          PreTag="div"
                          {...props}
                        >
                          {codeString}
                        </SyntaxHighlighter>
                      </div>
                    );
                  }
                  
                  return (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
                a: ({ node, ...props }) => (
                  <a
                    {...props}
                    className="text-accent hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                ),
              }}
            >
              {content}
            </ReactMarkdown>
            </div>
          )}
          {attachments && attachments.length > 0 && (
            <div className="mt-3 space-y-2">
              {attachments.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2 rounded bg-black/20 text-xs"
                >
                  <span>📎</span>
                  <span>{file.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {isUser && (
        <MessageActions
          content={content}
          messageId={id}
          isUser={true}
          onEdit={() => setIsEditing(true)}
        />
      )}
    </div>
  );
}
