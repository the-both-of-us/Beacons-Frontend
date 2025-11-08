'use client';

import { useEffect, useRef } from 'react';
import { Message, AiResponse } from '@/types';
import { MessageItem } from './MessageItem';

interface MessageListProps {
  messages: Message[];
  aiResponses: Map<string, AiResponse>;
  userVotes: Record<string, 'up' | 'down'>;
  onVote: (messageId: string, voteType: 'up' | 'down') => void;
  onViewThread?: (threadId: string) => void;
  threadLookup?: Record<string, string>;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  aiResponses,
  userVotes,
  onVote,
  onViewThread,
  threadLookup = {},
}) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white/60 p-10 text-center">
        <p className="text-base font-semibold text-gray-700">No messages yet</p>
        <p className="mt-1 text-sm text-gray-500">Be the first to start the conversation.</p>
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
      {messages.map((message) => (
        <MessageItem
          key={message.id}
          message={message}
          aiResponse={aiResponses.get(message.id)}
          threadId={threadLookup[message.id]}
          userVote={userVotes[message.id]}
          onVote={onVote}
          onViewThread={onViewThread}
        />
      ))}
    </div>
  );
};
