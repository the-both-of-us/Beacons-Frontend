import { cn } from '@/lib/utils';

interface VoteButtonsProps {
  messageId: string;
  upvotes: number;
  downvotes: number;
  userVote?: 'up' | 'down' | null;
  onVote: (voteType: 'up' | 'down') => void;
  compact?: boolean;
}

export const VoteButtons: React.FC<VoteButtonsProps> = ({
  upvotes,
  downvotes,
  userVote = null,
  onVote,
  compact = false,
}) => {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border border-gray-200 bg-white shadow-sm',
        compact ? 'px-2 py-1 gap-2 text-sm' : 'px-3 py-1.5 gap-3'
      )}
    >
      <button
        type="button"
        disabled={!!userVote}
        onClick={() => onVote('up')}
        className={cn(
          'flex items-center gap-1 font-medium transition-colors disabled:cursor-not-allowed disabled:text-gray-400',
          userVote === 'up' ? 'text-green-600' : 'text-gray-500 hover:text-green-600'
        )}
      >
        ▲
        <span>{upvotes}</span>
      </button>
      <span className="h-4 w-px bg-gray-200" />
      <button
        type="button"
        disabled={!!userVote}
        onClick={() => onVote('down')}
        className={cn(
          'flex items-center gap-1 font-medium transition-colors disabled:cursor-not-allowed disabled:text-gray-400',
          userVote === 'down' ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
        )}
      >
        ▼
        <span>{downvotes}</span>
      </button>
    </div>
  );
};
