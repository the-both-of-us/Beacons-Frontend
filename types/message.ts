export interface Message {
  id: string;
  roomId: string;
  username: string;
  message: string; // Changed from content to match backend
  timestamp: string;
  votes?: MessageVotes;
  voteCount?: number;
  tags?: string[];
  parentMessageId?: string;
  threadId?: string;
  isThreadStarter?: boolean;
  replyCount?: number;
  aiGenerated?: boolean;
}

export interface MessageVotes {
  upvotes: number;
  downvotes: number;
}

export interface VoteUpdate {
  messageId: string;
  upvotes: number;
  downvotes: number;
  voteCount: number;
}
