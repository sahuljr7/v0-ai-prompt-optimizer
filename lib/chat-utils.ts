import { Message } from '@/hooks/use-chat';

/**
 * Converts messages to markdown format
 */
export function exportToMarkdown(messages: Message[]): string {
  const timestamp = new Date().toLocaleString();
  const header = `# Chat Conversation\n\n*Exported on ${timestamp}*\n\n---\n\n`;

  const content = messages
    .map((msg) => {
      const editedLabel = msg.isEdited ? ' *(Edited)*' : '';
      if (msg.role === 'user') {
        return `## You${editedLabel}\n\n${msg.content}\n\n`;
      } else {
        return `## Assistant\n\n${msg.content}\n\n`;
      }
    })
    .join('---\n\n');

  return header + content;
}

/**
 * Downloads markdown as a file
 */
export function downloadMarkdown(markdown: string, filename: string = 'chat.md'): void {
  const blob = new Blob([markdown], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generates a unique shareable ID for a conversation
 */
export function generateShareId(): string {
  return `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Creates a shareable URL for the conversation
 */
export function createShareUrl(shareId: string): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  return `${baseUrl}/share/${shareId}`;
}

/**
 * Serializes messages for storage/sharing
 */
export function serializeMessages(messages: Message[]): string {
  return JSON.stringify(messages);
}

/**
 * Deserializes messages from storage/sharing
 */
export function deserializeMessages(data: string): Message[] {
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}
