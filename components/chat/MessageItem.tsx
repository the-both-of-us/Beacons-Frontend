'use client';

import { Message } from '@/types';
import { formatRelativeTime } from '@/lib/utils';

interface MessageItemProps {
  message: Message;
  threadReplies: Message[];
  isAiLoading: boolean;
  onVote?: (messageId: string, voteType: 'up' | 'down') => void;
  onReply?: (messageId: string) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  threadReplies,
  isAiLoading,
  onVote,
  onReply,
}) => {
  const hasLocationTag = message.tags?.includes('location-specific-question');
  const hasReplies = threadReplies.length > 0;
  const showThread = hasLocationTag || hasReplies;

  const handleVote = (voteType: 'up' | 'down') => {
    if (onVote) {
      onVote(message.id, voteType);
    }
  };

  return (
    <div className="rounded-xl sm:rounded-2xl border border-gray-100 bg-white p-3 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <span className="font-semibold text-sm sm:text-base text-gray-900 break-all">{message.username}</span>
          {message.aiGenerated && (
            <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-700">
              AI
            </span>
          )}
        </div>
        <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">{formatRelativeTime(message.timestamp)}</span>
      </div>

      {/* Tags */}
      {message.tags && message.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1 sm:gap-1.5">
          {message.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-blue-50 px-2 sm:px-2.5 py-0.5 sm:py-1 text-xs font-medium text-blue-700 border border-blue-100"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Message Content */}
      <p className="mt-2 sm:mt-3 text-sm sm:text-base text-gray-800 leading-relaxed break-words">{message.message}</p>

      {/* Actions */}
      <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-2 sm:gap-3">
        {/* Voting */}
        {onVote && (
          <div className="flex items-center gap-0.5 sm:gap-1 rounded-lg border border-gray-200 bg-gray-50 px-0.5 sm:px-1">
            <button
              onClick={() => handleVote('up')}
              className="rounded p-1 sm:p-1.5 text-gray-500 hover:bg-green-50 hover:text-green-600 transition-colors"
              aria-label="Upvote"
            >
              <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <span
              className={`min-w-[1.5rem] sm:min-w-[2rem] text-center text-xs sm:text-sm font-semibold ${
                (message.voteCount || 0) > 0
                  ? 'text-green-600'
                  : (message.voteCount || 0) < 0
                    ? 'text-red-600'
                    : 'text-gray-600'
              }`}
            >
              {message.voteCount || 0}
            </span>
            <button
              onClick={() => handleVote('down')}
              className="rounded p-1 sm:p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
              aria-label="Downvote"
            >
              <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        )}

        {/* Reply Button */}
        {onReply && (
          <button
            onClick={() => onReply(message.id)}
            className="flex items-center gap-1 sm:gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
              />
            </svg>
            <span className="hidden xs:inline">Reply</span>
          </button>
        )}

        {/* Reply count indicator */}
        {hasReplies && (
          <span className="text-xs text-gray-500">
            {threadReplies.length} {threadReplies.length === 1 ? 'reply' : 'replies'}
          </span>
        )}
      </div>

      {/* Thread Replies */}
      {showThread && (
        <div className="mt-3 sm:mt-4 ml-2 sm:ml-4 space-y-2 sm:space-y-3 border-l-2 sm:border-l-4 border-blue-100 pl-2 sm:pl-4">
          {/* Loading State */}
          {isAiLoading && threadReplies.length === 0 && (
            <div className="rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100 p-3 sm:p-4">
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="flex-shrink-0">
                  <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <svg
                      className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <span className="font-semibold text-sm sm:text-base text-gray-900">AI Assistant</span>
                    <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-700">
                      AI
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-xs sm:text-sm text-gray-600">Generating response</span>
                    <div className="inline-flex gap-1">
                      <span
                        className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-purple-400 animate-bounce"
                        style={{ animationDelay: '0ms' }}
                      />
                      <span
                        className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-purple-400 animate-bounce"
                        style={{ animationDelay: '150ms' }}
                      />
                      <span
                        className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-purple-400 animate-bounce"
                        style={{ animationDelay: '300ms' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actual Replies */}
          {threadReplies.map((reply) => (
            <div
              key={reply.id}
              className={`rounded-lg border p-3 sm:p-4 ${
                reply.aiGenerated
                  ? 'bg-gradient-to-r from-purple-50 to-blue-50 border-purple-100'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap min-w-0">
                  <span className="text-xs sm:text-sm font-semibold text-gray-900 break-all">{reply.username}</span>
                  {reply.aiGenerated && (
                    <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-700 flex-shrink-0">
                      AI
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">{formatRelativeTime(reply.timestamp)}</span>
              </div>

              <p className="mt-2 text-xs sm:text-sm text-gray-800 leading-relaxed break-words">{reply.message}</p>

              {/* Reply voting */}
              {onVote && (
                <div className="mt-2 sm:mt-3 flex items-center gap-0.5 sm:gap-1 rounded-lg border border-gray-200 bg-white px-0.5 sm:px-1 w-fit">
                  <button
                    onClick={() => onVote(reply.id, 'up')}
                    className="rounded p-0.5 sm:p-1 text-gray-500 hover:bg-green-50 hover:text-green-600 transition-colors"
                    aria-label="Upvote"
                  >
                    <svg className="h-3 w-3 sm:h-3.5 sm:w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <span
                    className={`min-w-[1.25rem] sm:min-w-[1.5rem] text-center text-xs font-semibold ${
                      (reply.voteCount || 0) > 0
                        ? 'text-green-600'
                        : (reply.voteCount || 0) < 0
                          ? 'text-red-600'
                          : 'text-gray-600'
                    }`}
                  >
                    {reply.voteCount || 0}
                  </span>
                  <button
                    onClick={() => onVote(reply.id, 'down')}
                    className="rounded p-0.5 sm:p-1 text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                    aria-label="Downvote"
                  >
                    <svg className="h-3 w-3 sm:h-3.5 sm:w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
