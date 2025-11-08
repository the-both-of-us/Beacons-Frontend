import { create } from 'zustand';
import { Message, AiResponse } from '@/types';

interface ChatState {
  messages: Message[];
  aiResponses: Map<string, AiResponse>; // messageId -> AI Response
  currentRoomId: string | null;
  userVotes: Record<string, 'up' | 'down'>;

  // Actions
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateMessageVotes: (messageId: string, upvotes: number, downvotes: number) => void;
  addAiResponse: (aiResponse: AiResponse) => void;
  setCurrentRoom: (roomId: string | null) => void;
  setUserVote: (messageId: string, vote: 'up' | 'down') => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  aiResponses: new Map(),
  currentRoomId: null,
  userVotes: {},

  setMessages: (messages) =>
    set({
      messages: [...messages].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      ),
    }),

  addMessage: (message) =>
    set((state) => {
      const exists = state.messages.some((msg) => msg.id === message.id);
      const nextMessages = exists
        ? state.messages.map((msg) => (msg.id === message.id ? message : msg))
        : [...state.messages, message];

      nextMessages.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      return { messages: nextMessages };
    }),

  updateMessageVotes: (messageId, upvotes, downvotes) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === messageId ? { ...msg, votes: { upvotes, downvotes } } : msg
      ),
    })),

  addAiResponse: (aiResponse) =>
    set((state) => {
      const newMap = new Map(state.aiResponses);
      newMap.set(aiResponse.messageId, aiResponse);
      return { aiResponses: newMap };
    }),

  setCurrentRoom: (roomId) => set({ currentRoomId: roomId }),

  setUserVote: (messageId, vote) =>
    set((state) => ({
      userVotes: {
        ...state.userVotes,
        [messageId]: vote,
      },
    })),

  clearMessages: () => set({ messages: [], aiResponses: new Map(), currentRoomId: null }),
}));
