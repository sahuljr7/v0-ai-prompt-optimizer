import { Message } from '@/hooks/use-chat';
import { jsPDF } from 'jspdf';

/**
 * Converts messages to PDF format and downloads it
 */
export function exportToPDF(messages: Message[]): void {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const timestamp = new Date().toLocaleString();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // Add header
  pdf.setFontSize(16);
  pdf.text('Chat Conversation', margin, yPosition);
  yPosition += 10;

  pdf.setFontSize(10);
  pdf.setTextColor(128, 128, 128);
  pdf.text(`Exported on ${timestamp}`, margin, yPosition);
  yPosition += 15;

  // Add messages
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(11);

  messages.forEach((msg, idx) => {
    const editedLabel = msg.isEdited ? ' (Edited)' : '';
    const sender = msg.role === 'user' ? `You${editedLabel}` : 'Assistant';

    // Check if we need a new page
    if (yPosition > pageHeight - margin - 10) {
      pdf.addPage();
      yPosition = margin;
    }

    // Add sender name
    pdf.setFont(undefined, 'bold');
    pdf.text(sender, margin, yPosition);
    yPosition += 7;

    // Add message content
    pdf.setFont(undefined, 'normal');
    const lines = pdf.splitTextToSize(msg.content, contentWidth);
    pdf.text(lines, margin, yPosition);
    yPosition += lines.length * 5 + 8;

    // Add separator
    pdf.setDrawColor(200, 200, 200);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 5;
  });

  // Save PDF
  const filename = `chat-${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(filename);
}

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
