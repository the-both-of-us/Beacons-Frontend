'use client';

import { Message } from '@/types';
import { formatRelativeTime } from '@/lib/utils';

interface MessageItemProps {
  message: Message;
  onVote?: (messageId: string, voteType: 'up' | 'down') => void;
  onReply?: (messageId: string) => void;
  onViewThread?: (threadId: string) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message, onVote, onReply, onViewThread }) => {
  const handleVote = (voteType: 'up' | 'down') => {
    if (onVote) {
      onVote(message.id, voteType);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white/90 p-4 shadow-sm">
      {/* Header: Username, Timestamp, AI Badge */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900">{message.username}</span>
          {message.aiGenerated && (
            <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
              AI
            </span>
          )}
        </div>
        <span className="text-gray-500">{formatRelativeTime(message.timestamp)}</span>
      </div>

      {/* Tags */}
      {message.tags && message.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {message.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Message Content */}
      <p className="mt-3 text-gray-800">{message.message}</p>

      {/* Actions: Voting, Reply, View Thread */}
      <div className="mt-3 flex items-center gap-4 text-sm">
        {/* Voting */}
        {onVote && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleVote('up')}
              className="rounded-lg p-1.5 text-gray-500 hover:bg-green-50 hover:text-green-600 transition-colors"
              aria-label="Upvote"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <span className={`min-w-[2rem] text-center font-medium ${
              (message.voteCount || 0) > 0 ? 'text-green-600' : (message.voteCount || 0) < 0 ? 'text-red-600' : 'text-gray-600'
            }`}>
              {message.voteCount || 0}
            </span>
            <button
              onClick={() => handleVote('down')}
              className="rounded-lg p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
              aria-label="Downvote"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        )}

        {/* Reply Button */}
        {onReply && (
          <button
            onClick={() => onReply(message.id)}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
            Reply
          </button>
        )}

        {/* View Thread Button */}
        {message.isThreadStarter && (message.replyCount || 0) > 0 && onViewThread && (
          <button
            onClick={() => onViewThread(message.threadId || message.id)}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-blue-600 hover:bg-blue-50 transition-colors font-medium"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {message.replyCount || 0} {(message.replyCount || 0) === 1 ? 'reply' : 'replies'}
          </button>
        )}
      </div>
    </div>
  );
};
