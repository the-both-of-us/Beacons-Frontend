'use client';

import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { RoomTag } from '@/types';

interface MessageInputProps {
  onSend: (content: string, tags?: string[], parentMessageId?: string) => Promise<void> | void;
  disabled?: boolean;
  isSubmitting?: boolean;
  availableTags?: RoomTag[];
  replyingTo?: { id: string; username: string } | null;
  onCancelReply?: () => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSend,
  disabled = false,
  isSubmitting = false,
  availableTags = [],
  replyingTo = null,
  onCancelReply,
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

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
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
            {availableTags.map((tag) => (
              <button
                key={tag.name}
                type="button"
                onClick={() => toggleTag(tag.name)}
                className="rounded-full px-3 py-1.5 text-xs font-medium transition-colors border"
                style={
                  selectedTags.includes(tag.name)
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
                {tag.displayName}
                {tag.enableAiResponse && ' 🤖'}
                {tag.enableThreading && ' 💬'}
              </button>
            ))}
          </div>
        </div>
      )}

      <textarea
        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100"
        rows={3}
        placeholder="Share an update or ask a question…"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        disabled={disabled || isSubmitting}
      />

      <div className="flex justify-end">
        <Button type="submit" disabled={disabled || isSubmitting} className="min-w-[140px]">
          {isSubmitting ? 'Sending…' : 'Send Message'}
        </Button>
      </div>
    </form>
  );
};
