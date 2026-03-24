export function TypingIndicator() {
  return (
    <div className="flex items-center gap-2">
      <div className="bg-secondary text-secondary-foreground px-4 py-3 rounded-lg flex items-center gap-2">
        <span className="text-sm">AI is typing</span>
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-secondary-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-secondary-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-secondary-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
