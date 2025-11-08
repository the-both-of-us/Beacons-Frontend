'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createMockSignalRClient, MockSignalRClient } from '@/lib/mockSignalR';
import { useAuthStore } from '@/store/authStore';
import { Message, AiResponse, Thread } from '@/types';

type VotePayload = {
  messageId: string;
  upvotes: number;
  downvotes: number;
};

interface UseSignalROptions {
  enabled?: boolean;
  onMessage?: (message: Message) => void;
  onMessageHistory?: (messages: Message[]) => void;
  onThreadCreated?: (thread: Thread) => void;
  onAiResponse?: (aiResponse: AiResponse) => void;
  onVoteUpdated?: (payload: VotePayload) => void;
}

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== 'false';

const createClient = (token: string): MockSignalRClient => {
  if (!USE_MOCK) {
    // Placeholder for real client swap-in
    return createMockSignalRClient(token);
  }
  return createMockSignalRClient(token);
};

export const useSignalR = (roomId: string | null, options: UseSignalROptions = {}) => {
  const { token } = useAuthStore();
  const [isConnected, setIsConnected] = useState(false);
  const clientRef = useRef<MockSignalRClient | null>(null);
  const callbacksRef = useRef(options);

  useEffect(() => {
    callbacksRef.current = options;
  }, [options]);

  useEffect(() => {
    if (!roomId || !token || options.enabled === false) {
      return;
    }

    const client = createClient(token);
    clientRef.current = client;
    let active = true;

    const startConnection = async () => {
      try {
        await client.start();
        if (!active) return;

        setIsConnected(true);

        client.on('MessageReceived', (message: Message) => {
          callbacksRef.current.onMessage?.(message);
        });

        client.on('MessageHistory', (history: Message[]) => {
          callbacksRef.current.onMessageHistory?.(history);
        });

        client.on('ThreadCreated', (thread: Thread) => {
          callbacksRef.current.onThreadCreated?.(thread);
        });

        client.on('AiResponse', (aiResponse: AiResponse) => {
          callbacksRef.current.onAiResponse?.(aiResponse);
        });

        client.on('VoteUpdated', (payload: VotePayload) => {
          callbacksRef.current.onVoteUpdated?.(payload);
        });

        await client.invoke('JoinRoom', roomId, token);
      } catch (error) {
        console.error('[SignalR] Connection failed', error);
      }
    };

    startConnection();

    return () => {
      active = false;
      if (clientRef.current) {
        if (roomId) {
          clientRef.current.invoke('LeaveRoom', roomId).catch(() => {
            // ignored for cleanup
          });
        }
        clientRef.current.stop();
        clientRef.current = null;
      }
      setIsConnected(false);
    };
  }, [roomId, token, options.enabled]);

  const sendMessage = useCallback(
    async (content: string, tags: string[], parentThreadId?: string | null) => {
      if (!clientRef.current || !roomId || !token) {
        throw new Error('SignalR client not ready');
      }

      await clientRef.current.invoke(
        'SendMessage',
        roomId,
        content,
        tags,
        token,
        parentThreadId ?? null
      );
    },
    [roomId, token]
  );

  const voteMessage = useCallback(
    async (messageId: string, voteType: 'up' | 'down') => {
      if (!clientRef.current || !token || !roomId) {
        throw new Error('SignalR client not ready');
      }
      await clientRef.current.invoke('VoteMessage', messageId, voteType, token);
    },
    [roomId, token]
  );

  return {
    sendMessage,
    voteMessage,
    isConnected,
  };
};
