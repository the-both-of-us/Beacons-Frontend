'use client';

import { useEffect, useRef } from 'react';
import { Message } from '@/types';
import { MessageItem } from './MessageItem';

interface MessageListProps {
  messages: Message[];
  onVote?: (messageId: string, voteType: 'up' | 'down') => void;
  onReply?: (messageId: string) => void;
  threadMessages?: Record<string, Message[]>;
  loadingThreads?: Set<string>;
  expandedThreads?: Set<string>;
  onToggleThread?: (messageId: string) => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  onVote,
  onReply,
  threadMessages,
  loadingThreads,
  expandedThreads,
  onToggleThread
}) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!messages.length) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white/60 p-10 text-center">
        <p className="text-base font-semibold text-gray-700">No messages yet</p>
        <p className="mt-1 text-sm text-gray-500">Be the first to say hello.</p>
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
      {messages.map((message) => (
        <MessageItem
          key={message.id}
          message={message}
          onVote={onVote}
          onReply={onReply}
          threadMessages={threadMessages?.[message.id]}
          isLoadingThread={loadingThreads?.has(message.id)}
          isThreadExpanded={expandedThreads?.has(message.id)}
          onToggleThread={onToggleThread}
        />
      ))}
    </div>
  );
};
