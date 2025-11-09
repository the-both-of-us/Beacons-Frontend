'use client';

import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { Message, Room, VoteUpdate } from '@/types';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { useChatHub } from '@/hooks/useChatHub';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';

interface ChatRoomProps {
  roomId: string;
}

export const ChatRoom: React.FC<ChatRoomProps> = ({ roomId }) => {
  const [room, setRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [replyingTo, setReplyingTo] = useState<{ id: string; username: string } | null>(null);
  const { account, loading: authLoading, login } = useAuth();

  useEffect(() => {
    if (!account) {
      setIsLoading(false);
      return;
    }

    let active = true;
    setIsLoading(true);
    setError(null);

    const load = async () => {
      try {
        const [roomDetails, history] = await Promise.all([
          api.getRoom(roomId),
          api.getRoomMessages(roomId),
        ]);

        if (!active) return;
        setRoom(roomDetails);
        setMessages(history);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Failed to load room');
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [roomId, account]);

  const sortedMessages = useMemo(
    () =>
      [...messages].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      ),
    [messages]
  );

  const { isConnected, assignedUsername, sendMessage, voteMessage: voteMessageViaHub } = useChatHub({
    roomId,
    onHistory: (history) => {
      setMessages(history);
    },
    onMessage: (message) => {
      setMessages((prev) => [...prev, message]);
    },
    onVoteUpdate: (update: VoteUpdate) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === update.messageId
            ? {
                ...msg,
                votes: { upvotes: update.upvotes, downvotes: update.downvotes },
                voteCount: update.voteCount,
              }
            : msg
        )
      );
    },
    onError: (err) => {
      setError(err.message);
    },
    enabled: !!account,
  });

  const handleSend = async (content: string, tags?: string[], parentMessageId?: string) => {
    setIsSending(true);
    try {
      await sendMessage(content, tags, parentMessageId);
    } finally {
      setIsSending(false);
    }
  };

  const handleVote = async (messageId: string, voteType: 'up' | 'down') => {
    try {
      await api.voteMessage(roomId, messageId, voteType, assignedUsername ?? undefined);
    } catch (err) {
      try {
        await voteMessageViaHub(messageId, voteType);
      } catch (hubError) {
        setError(
          hubError instanceof Error
            ? hubError.message
            : err instanceof Error
              ? err.message
              : 'Failed to vote'
        );
      }
    }
  };

  const handleReply = (messageId: string) => {
    const message = messages.find((m) => m.id === messageId);
    if (message) {
      setReplyingTo({ id: message.id, username: message.username });
    }
  };

  if (authLoading || (isLoading && account)) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-6">
        <div className="mx-auto max-w-4xl space-y-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="h-24 animate-pulse rounded-2xl bg-white/60" />
          ))}
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-6 flex items-center justify-center">
        <div className="max-w-md rounded-2xl border border-blue-200 bg-white px-6 py-8 text-center space-y-4 shadow-lg">
          <h1 className="text-2xl font-bold text-gray-900">Sign in required</h1>
          <p className="text-gray-600">
            Please sign in with your organization account to join this room.
          </p>
          <Button onClick={login} className="w-full">
            Sign in
          </Button>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-6">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!room) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-blue-600">Now chatting in</p>
            <h1 className="text-3xl font-bold text-gray-900">{room.name}</h1>
            <p className="text-sm text-gray-600">Room ID: {room.id}</p>
            {room.description && (
              <p className="mt-1 text-sm text-gray-500">{room.description}</p>
            )}
          </div>
          <div className="space-y-1 text-right">
            <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  isConnected ? 'bg-green-500' : 'bg-gray-300'
                }`}
              />
              {isConnected ? 'Connected' : 'Connecting…'}
            </span>
            {assignedUsername && (
              <p className="text-xs text-gray-500">You are: {assignedUsername}</p>
            )}
          </div>
        </div>

        <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-lg">
          <div className="mb-6">
            <MessageList
              messages={sortedMessages}
              onVote={handleVote}
              onReply={handleReply}
            />
          </div>

          <div className="border-t border-gray-100 pt-6">
            <MessageInput
              onSend={handleSend}
              disabled={!isConnected}
              isSubmitting={isSending}
              availableTags={room?.availableTags}
              replyingTo={replyingTo}
              onCancelReply={() => setReplyingTo(null)}
            />
          </div>
        </section>
      </div>
    </main>
  );
};
