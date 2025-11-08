'use client';

import { FormEvent, useState } from 'react';
import { TagSelector } from './TagSelector';
import { Button } from '@/components/ui/Button';

interface MessageInputProps {
  onSend: (content: string, tags: string[]) => Promise<void> | void;
  disabled?: boolean;
  isSubmitting?: boolean;
  placeholder?: string;
  showTagSelector?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSend,
  disabled = false,
  isSubmitting = false,
  placeholder = 'Share an update or ask a question…',
  showTagSelector = true,
}) => {
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!content.trim()) {
      setError('Message cannot be empty');
      return;
    }

    setError(null);
    try {
      await onSend(content.trim(), tags);
      setContent('');
      setTags([]);
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

      <textarea
        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100"
        rows={3}
        placeholder={placeholder}
        value={content}
        onChange={(event) => setContent(event.target.value)}
        disabled={disabled || isSubmitting}
      />

      {showTagSelector && (
        <div>
          <p className="mb-2 text-sm font-medium text-gray-700">Tags</p>
          <TagSelector value={tags} onChange={setTags} disabled={disabled || isSubmitting} />
          <p className="mt-1 text-xs text-gray-500">
            Add <strong>Location Question</strong> to spawn a dedicated thread.
          </p>
        </div>
      )}

      <div className="flex justify-end">
          <Button
            type="submit"
            disabled={disabled || isSubmitting}
            className="min-w-[140px]"
          >
            {isSubmitting ? 'Sending…' : 'Send Message'}
          </Button>
      </div>
    </form>
  );
};
