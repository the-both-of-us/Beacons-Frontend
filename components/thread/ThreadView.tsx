'use client';

import { Message, AiResponse } from '@/types';
import { MessageItem } from '@/components/chat/MessageItem';
import { MessageInput } from '@/components/chat/MessageInput';

interface ThreadViewProps {
  originalMessage: Message;
  replies: Message[];
  aiResponse?: AiResponse;
  onVote: (messageId: string, voteType: 'up' | 'down') => void;
  onSendReply: (content: string, tags: string[]) => Promise<void>;
  isSending?: boolean;
  userVotes: Record<string, 'up' | 'down'>;
}

export const ThreadView: React.FC<ThreadViewProps> = ({
  originalMessage,
  replies,
  aiResponse,
  onVote,
  onSendReply,
  isSending = false,
  userVotes,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-blue-600">Original Question</p>
        <div className="mt-3">
          <MessageItem
            message={originalMessage}
            aiResponse={aiResponse}
            userVote={userVotes[originalMessage.id]}
            onVote={onVote}
          />
        </div>
      </div>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">
            Replies ({replies.length})
          </h2>
        </div>

        <div className="mt-3 space-y-3">
          {replies.length === 0 && (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
              No replies yet. Share what you know!
            </div>
          )}

          {replies.map((reply) => (
            <MessageItem
              key={reply.id}
              message={reply}
              userVote={userVotes[reply.id]}
              onVote={onVote}
            />
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-gray-900">Add a reply</h3>
        <div className="mt-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <MessageInput
            onSend={onSendReply}
            isSubmitting={isSending}
            showTagSelector={false}
            placeholder="Share context, tips, or next steps…"
          />
        </div>
      </section>
    </div>
  );
};
