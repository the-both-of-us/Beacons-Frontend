'use client';

import { useEffect, useRef, useState } from 'react';
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
} from '@microsoft/signalr';
import { SIGNALR_URL } from '@/lib/config';
import { Message, VoteUpdate } from '@/types';
import { getAccessToken } from '@/lib/authClient';
import { getRecaptchaToken } from '@/lib/recaptcha';

interface MessageDto {
  id: string;
  roomId: string;
  username: string;
  message: string;
  timestamp: string;
  votes?: {
    upvotes: number;
    downvotes: number;
  };
  voteCount: number;
  tags?: string[];
  parentMessageId?: string;
  threadId?: string;
  isThreadStarter: boolean;
  replyCount: number;
  aiGenerated: boolean;
}

interface UseChatHubOptions {
  roomId: string;
  onMessage?: (message: Message) => void;
  onHistory?: (messages: Message[]) => void;
  onThreadHistory?: (messages: Message[]) => void;
  onVoteUpdate?: (update: VoteUpdate) => void;
  onError?: (error: Error) => void;
  enabled?: boolean;
}

const mapMessageDto = (dto: MessageDto): Message => ({
  id: dto.id,
  roomId: dto.roomId,
  username: dto.username,
  message: dto.message,
  timestamp: dto.timestamp,
  votes: dto.votes,
  voteCount: dto.voteCount || 0,
  tags: dto.tags,
  parentMessageId: dto.parentMessageId,
  threadId: dto.threadId,
  isThreadStarter: dto.isThreadStarter || false,
  replyCount: dto.replyCount || 0,
  aiGenerated: dto.aiGenerated || false,
});

const isNegotiationCancellation = (error: unknown) => {
  if (!(error instanceof Error)) return false;
  return (
    error.message.includes('stopped during negotiation') ||
    error.message.includes('The connection was stopped')
  );
};

export const useChatHub = ({ roomId, onMessage, onHistory, onThreadHistory, onVoteUpdate, onError, enabled = true }: UseChatHubOptions) => {
  const connectionRef = useRef<HubConnection | null>(null);
  const callbacksRef = useRef({
    onMessage,
    onHistory,
    onThreadHistory,
    onVoteUpdate,
    onError,
  });
  const [isConnected, setIsConnected] = useState(false);
  const [assignedUsername, setAssignedUsername] = useState<string | null>(null);

  useEffect(() => {
    callbacksRef.current = { onMessage, onHistory, onThreadHistory, onVoteUpdate, onError };
  }, [onMessage, onHistory, onThreadHistory, onVoteUpdate, onError]);

  useEffect(() => {
    if (!enabled) {
      if (connectionRef.current) {
        connectionRef.current.stop().catch(() => {});
        connectionRef.current = null;
      }
      setIsConnected(false);
      return;
    }

    let isCancelled = false;
    const connection = new HubConnectionBuilder()
      .withUrl(SIGNALR_URL, {
        accessTokenFactory: async () => (await getAccessToken()) ?? '',
      })
      .withAutomaticReconnect()
      .build();

    connectionRef.current = connection;

    const joinRoomWithVerification = async () => {
      const token = await getRecaptchaToken('join_room');
      await connection.invoke('JoinRoom', roomId, token);
    };

    connection.on('AssignedUsername', (payload: { username: string; isAuthenticated?: boolean; roles?: string[] } | string) => {
      if (typeof payload === 'string') {
        setAssignedUsername(payload);
      } else if (payload?.username) {
        setAssignedUsername(payload.username);
      } else {
        setAssignedUsername(null);
      }
    });

    connection.on('ReceiveMessageHistory', (history: MessageDto[]) => {
      callbacksRef.current.onHistory?.(history.map(mapMessageDto));
    });

    connection.on('ReceiveThreadHistory', (history: MessageDto[]) => {
      callbacksRef.current.onThreadHistory?.(history.map(mapMessageDto));
    });

    connection.on('ReceiveMessage', (dto: MessageDto) => {
      console.log('📩 Message received:', {
        username: dto.username,
        message: dto.message.substring(0, 100),
        aiGenerated: dto.aiGenerated,
        tags: dto.tags
      });
      callbacksRef.current.onMessage?.(mapMessageDto(dto));
    });

    connection.on('VoteUpdated', (update: VoteUpdate) => {
      callbacksRef.current.onVoteUpdate?.(update);
    });

    connection.on('Error', (message: string) => {
      callbacksRef.current.onError?.(new Error(message));
    });

    connection.onreconnecting(() => setIsConnected(false));
    connection.onreconnected(async () => {
      try {
        await joinRoomWithVerification();
        setIsConnected(true);
      } catch (error) {
        setIsConnected(false);
        callbacksRef.current.onError?.(error as Error);
      }
    });

    connection.onclose(() => {
      setIsConnected(false);
    });

    const startConnection = async () => {
      try {
        await connection.start();
        if (isCancelled) return;
        await joinRoomWithVerification();
        if (!isCancelled) {
          setIsConnected(true);
        }
      } catch (error) {
        if (isCancelled && isNegotiationCancellation(error)) {
          return;
        }
        callbacksRef.current.onError?.(error as Error);
      }
    };

    startConnection();

    return () => {
      isCancelled = true;
      connection.off('AssignedUsername');
      connection.off('ReceiveMessageHistory');
      connection.off('ReceiveThreadHistory');
      connection.off('ReceiveMessage');
      connection.off('VoteUpdated');
      connection.off('Error');
      connection
        .stop()
        .catch(() => {
          /* ignore stop errors */
        })
        .finally(() => {
          if (connectionRef.current === connection) {
            connectionRef.current = null;
          }
        });
      connectionRef.current = null;
    };
  }, [roomId, enabled]);

  const sendMessage = async (content: string, tags?: string[], parentMessageId?: string) => {
    if (!connectionRef.current || connectionRef.current.state !== HubConnectionState.Connected) {
      throw new Error('Not connected to chat hub');
    }

    console.log('📤 Sending message:', { roomId, content, tags, parentMessageId });

    await connectionRef.current.invoke('SendMessage', {
      roomId,
      message: content,
      tags: tags || [],
      parentMessageId: parentMessageId || null,
    });
  };

  const getThreadMessages = async (threadId: string, limit?: number) => {
    if (!connectionRef.current || connectionRef.current.state !== HubConnectionState.Connected) {
      throw new Error('Not connected to chat hub');
    }

    await connectionRef.current.invoke('GetThreadMessages', threadId, limit || null);
  };

  const voteMessage = async (messageId: string, voteType: 'up' | 'down') => {
    if (!connectionRef.current || connectionRef.current.state !== HubConnectionState.Connected) {
      throw new Error('Not connected to chat hub');
    }

    await connectionRef.current.invoke('VoteMessage', messageId, voteType);
  };

  return {
    isConnected,
    assignedUsername,
    sendMessage,
    voteMessage,
    getThreadMessages,
  };
};
