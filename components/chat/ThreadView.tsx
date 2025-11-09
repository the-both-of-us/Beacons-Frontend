'use client';

import { Message } from '@/types';
import { formatRelativeTime } from '@/lib/utils';

interface ThreadViewProps {
  messages: Message[];
  isLoading?: boolean;
  onVote?: (messageId: string, voteType: 'up' | 'down') => void;
}

export const ThreadView: React.FC<ThreadViewProps> = ({ messages, isLoading, onVote }) => {
  const handleVote = (messageId: string, voteType: 'up' | 'down') => {
    if (onVote) {
      onVote(messageId, voteType);
    }
  };

  if (isLoading) {
    return (
      <div className="ml-8 mt-3 space-y-2 border-l-2 border-blue-200 pl-4">
        <div className="h-16 animate-pulse rounded-lg bg-gray-100" />
      </div>
    );
  }

  if (!messages.length) {
    return null;
  }

  // Sort messages: AI responses first, then by timestamp
  const sortedMessages = [...messages].sort((a, b) => {
    // AI messages come first
    if (a.aiGenerated && !b.aiGenerated) return -1;
    if (!a.aiGenerated && b.aiGenerated) return 1;
    // Otherwise sort by timestamp
    return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
  });

  return (
    <div className="ml-8 mt-3 space-y-3 border-l-2 border-blue-200 pl-4">
      {sortedMessages.map((message) => (
        <div key={message.id} className="rounded-lg border border-gray-100 bg-gray-50/50 p-3">
          {/* Header */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-700">{message.username}</span>
              {message.aiGenerated && (
                <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                  AI
                </span>
              )}
            </div>
            <span className="text-gray-500">{formatRelativeTime(message.timestamp)}</span>
          </div>

          {/* Message Content */}
          <p className="mt-2 text-sm text-gray-800">{message.message}</p>

          {/* Voting */}
          {onVote && (
            <div className="mt-2 flex items-center gap-1">
              <button
                onClick={() => handleVote(message.id, 'up')}
                className="rounded p-1 text-gray-500 hover:bg-green-50 hover:text-green-600 transition-colors"
                aria-label="Upvote"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
              <span className={`min-w-[1.5rem] text-center text-xs font-medium ${
                (message.voteCount || 0) > 0 ? 'text-green-600' : (message.voteCount || 0) < 0 ? 'text-red-600' : 'text-gray-600'
              }`}>
                {message.voteCount || 0}
              </span>
              <button
                onClick={() => handleVote(message.id, 'down')}
                className="rounded p-1 text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                aria-label="Downvote"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
