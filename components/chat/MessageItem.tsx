import { Message, AiResponse } from '@/types';
import { formatRelativeTime } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { VoteButtons } from '@/components/voting/VoteButtons';
import { Button } from '@/components/ui/Button';

interface MessageItemProps {
  message: Message;
  aiResponse?: AiResponse;
  userVote?: 'up' | 'down';
  onVote: (messageId: string, voteType: 'up' | 'down') => void;
  onViewThread?: (threadId: string) => void;
  threadId?: string | null;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  aiResponse,
  userVote,
  onVote,
  onViewThread,
  threadId,
}) => {
  const username = message.username ?? 'Anonymous';
  const timestamp = formatRelativeTime(message.createdAt);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-900">
            {username}{' '}
            {message.isAnonymous && <span className="text-xs font-normal text-gray-500">(guest)</span>}
          </p>
          <p className="text-xs text-gray-500">{timestamp}</p>
        </div>
        <VoteButtons
          messageId={message.id}
          upvotes={message.votes.upvotes}
          downvotes={message.votes.downvotes}
          userVote={userVote}
          onVote={(vote) => onVote(message.id, vote)}
          compact
        />
      </div>

      <p className="mt-3 text-sm leading-relaxed text-gray-800">{message.content}</p>

      {message.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {message.tags.map((tag) => (
            <Badge key={tag} variant="primary">
              {tag.replace(/_/g, ' ')}
            </Badge>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {message.isThreadStarter && onViewThread && threadId && (
          <Button variant="outline" size="sm" onClick={() => onViewThread(threadId)}>
            View Thread
          </Button>
        )}
      </div>

      {aiResponse && (
        <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/70 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-blue-900">
            <span>AI Answer</span>
            <Badge variant="success">confidence {(aiResponse.confidenceScore * 100).toFixed(0)}%</Badge>
          </div>
          <p className="mt-2 text-sm text-blue-900">{aiResponse.responseText}</p>
        </div>
      )}
    </div>
  );
};
