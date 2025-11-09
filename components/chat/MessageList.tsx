'use client';

import { useEffect, useRef } from 'react';
import { Message } from '@/types';
import { MessageItem } from './MessageItem';

interface MessageListProps {
  messages: Message[];
  threadReplies: Record<string, Message[]>;
  aiLoadingForMessages: Set<string>;
  onVote?: (messageId: string, voteType: 'up' | 'down') => void;
  onReply?: (messageId: string) => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  threadReplies,
  aiLoadingForMessages,
  onVote,
  onReply,
}) => {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  if (!messages.length) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-6">
          <p className="text-base font-semibold text-gray-700">No messages yet</p>
          <p className="mt-1 text-sm text-gray-500">Be the first to say hello.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {messages.map((message) => (
        <MessageItem
          key={message.id}
          message={message}
          threadReplies={threadReplies[message.id] || []}
          isAiLoading={aiLoadingForMessages.has(message.id)}
          onVote={onVote}
          onReply={onReply}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
};
