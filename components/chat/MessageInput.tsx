'use client';

import { FormEvent, KeyboardEvent, RefObject, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { RoomTag } from '@/types';

const SparkleIcon = () => (
  <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path d="M10 2l1.2 3.5L15 6.8l-3.1 2.2.9 3.6L10 10.9 7.2 12.6l.9-3.6L5 6.8l3.8-.3L10 2zM4 12l.8 2.2L7 14.6l-1.7 1.2.5 2.2L4 16.8l-1.9 1.2.5-2.2L1 14.6l2.2-.4L4 12zm12 0l.8 2.2 2.2.4-1.7 1.2.5 2.2L16 16.8l-1.9 1.2.5-2.2L13 14.6l2.2-.4L16 12z" />
  </svg>
);

const ThreadIcon = () => (
  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 5v6a4 4 0 004 4h2a4 4 0 014 4M7 5h2M7 5H5m12 14h2" />
    <circle cx="5" cy="5" r="2" />
    <circle cx="17" cy="19" r="2" />
  </svg>
);

const buildIndicatorClass = (isSelected: boolean) =>
  `inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
    isSelected ? 'bg-white/30 text-white/90' : 'bg-white text-gray-600'
  }`;

interface MessageInputProps {
  onSend: (content: string, tags?: string[], parentMessageId?: string) => Promise<void> | void;
  disabled?: boolean;
  isSubmitting?: boolean;
  availableTags?: RoomTag[];
  replyingTo?: { id: string; username: string } | null;
  onCancelReply?: () => void;
  textAreaRef?: RefObject<HTMLTextAreaElement>;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSend,
  disabled = false,
  isSubmitting = false,
  availableTags = [],
  replyingTo = null,
  onCancelReply,
  textAreaRef,
}) => {
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const toggleTag = (tagName: string) => {
    setSelectedTags(prev =>
      prev.includes(tagName)
        ? prev.filter(t => t !== tagName)
        : [...prev, tagName]
    );
  };

  const sendMessage = async () => {
    if (!content.trim()) {
      setError('Message cannot be empty');
      return;
    }

    setError(null);
    try {
      await onSend(content.trim(), selectedTags, replyingTo?.id);
      setContent('');
      setSelectedTags([]);
      onCancelReply?.();
      textAreaRef?.current?.focus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await sendMessage();
  };

  const handleKeyDown = async (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      await sendMessage();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Reply Indicator */}
      {replyingTo && (
        <div className="flex items-center justify-between rounded-lg bg-blue-50 px-4 py-2 text-sm">
          <span className="text-blue-700">
            Replying to <strong>{replyingTo.username}</strong>
          </span>
          <button
            type="button"
            onClick={onCancelReply}
            className="text-blue-600 hover:text-blue-800"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Tag Selector */}
      {availableTags.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Tags (optional):</label>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => {
              const isSelected = selectedTags.includes(tag.name);
              return (
                <button
                  key={tag.name}
                  type="button"
                  onClick={() => toggleTag(tag.name)}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors`}
                  style={
                    isSelected
                      ? {
                          backgroundColor: tag.color || '#2563eb',
                          color: '#fff',
                          borderColor: tag.color || '#2563eb',
                        }
                      : {
                          backgroundColor: '#f3f4f6',
                          color: '#1f2937',
                          borderColor: tag.color || '#e5e7eb',
                        }
                  }
                >
                  <span>{tag.displayName}</span>
                  <span className="flex items-center gap-1">
                    {tag.enableAiResponse && (
                      <span className={buildIndicatorClass(isSelected)}>
                        <SparkleIcon />
                        AI
                      </span>
                    )}
                    {tag.enableThreading && (
                      <span className={buildIndicatorClass(isSelected)}>
                        <ThreadIcon />
                        Threads
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <textarea
        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100"
        rows={3}
        placeholder="Share an update or ask a question…"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled || isSubmitting}
        ref={textAreaRef}
      />

      <div className="flex justify-end">
        <Button type="submit" disabled={disabled || isSubmitting} className="min-w-[140px]">
          {isSubmitting ? 'Sending…' : 'Send Message'}
        </Button>
      </div>
    </form>
  );
};
