export interface Message {
  id: string;
  type: 'message';
  roomId: string;
  locationId: string;
  userId: string;
  content: string;
  tags: string[];
  isThreadStarter: boolean;
  parentThreadId: string | null;
  votes: {
    upvotes: number;
    downvotes: number;
  };
  createdAt: string;
  updatedAt: string;

  // Extended fields for UI (not in database)
  username?: string;
  isAnonymous?: boolean;
  aiResponse?: AiResponse;
}

export interface AiResponse {
  id: string;
  type: 'ai_response';
  messageId: string;
  threadId: string;
  locationId: string;
  responseText: string;
  confidenceScore: number;
  modelVersion: string;
  sources: Array<{
    type: string;
    id: string;
  }>;
  votes: {
    upvotes: number;
    downvotes: number;
  };
  createdAt: string;
}

export interface Vote {
  id: string;
  type: 'vote';
  messageId?: string;
  aiResponseId?: string;
  voterId: string;
  locationId: string;
  voteType: 'up' | 'down';
  createdAt: string;
}

export interface CreateMessageRequest {
  roomId: string;
  userId: string;
  content: string;
  tags: string[];
}
