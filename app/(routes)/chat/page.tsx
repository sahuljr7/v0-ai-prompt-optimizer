'use client';

import { useState } from 'react';
import { ChatWindow } from '@/components/chat/chat-window';
import { ChatHistorySidebar } from '@/components/chat/chat-history-sidebar';
import { useConversations } from '@/hooks/use-conversations';

export default function ChatPage() {
  const {
    conversations,
    activeConversationId,
    isLoaded,
    createConversation,
    getActiveConversation,
    updateConversationMessages,
    updateConversationTitle,
    deleteConversation,
    switchConversation,
  } = useConversations();

  const activeConversation = getActiveConversation();

  const handleNewChat = () => {
    createConversation();
  };

  const shouldShowChat = isLoaded && (conversations.length > 0 || activeConversationId);

  return (
    <div className="flex h-screen w-full flex-col bg-background overflow-hidden">
      {/* Chat Interface */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chat History Sidebar */}
        <ChatHistorySidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
          onNewChat={handleNewChat}
          onSelectConversation={switchConversation}
          onRenameConversation={updateConversationTitle}
          onDeleteConversation={deleteConversation}
        />

        {/* Chat Window */}
        {shouldShowChat ? (
          <ChatWindow
            conversation={activeConversation}
            onSaveMessages={updateConversationMessages}
            onUpdateTitle={updateConversationTitle}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold">Welcome to AI Chat</h2>
              <p className="text-muted-foreground">Start a new conversation to begin chatting</p>
              <button
                onClick={handleNewChat}
                className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
              >
                Start New Chat
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
