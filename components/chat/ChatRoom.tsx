'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Message, Room, VoteUpdate } from '@/types';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { useChatHub } from '@/hooks/useChatHub';
import { useAuth } from '@/context/AuthContext';
import { hasScannedRoom } from '@/lib/roomAccess';
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
  const [threadMessages, setThreadMessages] = useState<Record<string, Message[]>>({});
  const [loadingThreads, setLoadingThreads] = useState<Set<string>>(new Set());
  const [expandedThreads, setExpandedThreads] = useState<Set<string>>(new Set());
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const { account, isAdmin } = useAuth();

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError(null);

    const load = async () => {
      try {
        // Check if user has access to this room
        const canAccess = isAdmin || hasScannedRoom(roomId);
        setHasAccess(canAccess);

        if (!canAccess) {
          if (active) {
            setIsLoading(false);
          }
          return;
        }

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
  }, [roomId, isAdmin]);

  const sortedMessages = useMemo(
    () =>
      [...messages].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      ),
    [messages]
  );

  const { isConnected, assignedUsername, sendMessage, voteMessage: voteMessageViaHub, getThreadMessages } = useChatHub({
    roomId,
    onHistory: (history) => {
      setMessages(history);
    },
    onThreadHistory: (threadMsgs) => {
      // Group thread messages by their parent
      if (threadMsgs.length > 0) {
        const parentId = threadMsgs[0].parentMessageId;
        if (parentId) {
          setThreadMessages((prev) => ({
            ...prev,
            [parentId]: threadMsgs,
          }));
        }
      }
    },
    onMessage: (message) => {
      // If it's a thread reply, add it to the thread messages
      if (message.parentMessageId) {
        const parentId = message.parentMessageId;
        setThreadMessages((prev) => ({
          ...prev,
          [parentId]: [...(prev[parentId] || []), message],
        }));
        // Update reply count on parent message
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === parentId
              ? { ...msg, replyCount: (msg.replyCount || 0) + 1 }
              : msg
          )
        );
      } else {
        // Regular message
        setMessages((prev) => [...prev, message]);
      }
    },
    onVoteUpdate: (update: VoteUpdate) => {
      // Update votes in main messages
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
      // Update votes in thread messages
      setThreadMessages((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((threadId) => {
          updated[threadId] = updated[threadId].map((msg) =>
            msg.id === update.messageId
              ? {
                  ...msg,
                  votes: { upvotes: update.upvotes, downvotes: update.downvotes },
                  voteCount: update.voteCount,
                }
              : msg
          );
        });
        return updated;
      });
    },
    onError: (err) => {
      setError(err.message);
    },
    enabled: true,
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

  const handleToggleThread = async (messageId: string) => {
    const message = messages.find((m) => m.id === messageId);
    if (!message) return;

    const threadId = message.threadId || message.id;

    // Toggle expanded state
    setExpandedThreads((prev) => {
      const next = new Set(prev);
      if (next.has(messageId)) {
        next.delete(messageId);
      } else {
        next.add(messageId);
      }
      return next;
    });

    // If not already loaded and we're expanding, fetch thread messages
    if (!threadMessages[messageId] && !expandedThreads.has(messageId)) {
      setLoadingThreads((prev) => new Set(prev).add(messageId));
      try {
        await getThreadMessages(threadId);
        // Note: The backend should send thread messages via SignalR which will be handled by onMessage
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load thread');
      } finally {
        setLoadingThreads((prev) => {
          const next = new Set(prev);
          next.delete(messageId);
          return next;
        });
      }
    }
  };

  // Auto-fetch threads for location-specific-question messages
  useEffect(() => {
    const locationQuestions = messages.filter(
      (msg) => msg.tags?.includes('location-specific-question') && msg.isThreadStarter && (msg.replyCount || 0) > 0
    );

    locationQuestions.forEach(async (msg) => {
      const threadId = msg.threadId || msg.id;
      // Only fetch if not already loaded
      if (!threadMessages[msg.id] && !loadingThreads.has(msg.id)) {
        setLoadingThreads((prev) => new Set(prev).add(msg.id));
        try {
          await getThreadMessages(threadId);
        } catch (err) {
          console.error('Failed to auto-load thread:', err);
        } finally {
          setLoadingThreads((prev) => {
            const next = new Set(prev);
            next.delete(msg.id);
            return next;
          });
        }
      }
    });
  }, [messages, getThreadMessages]);

  if (isLoading) {
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

  // Access denied
  if (hasAccess === false) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-6 flex items-center justify-center">
        <div className="mx-auto max-w-md rounded-2xl border border-amber-200 bg-white px-6 py-8 shadow-lg text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Room Access Required</h1>
          <p className="text-gray-600">
            You need to scan a QR code to access this room. QR codes are located at physical locations (classrooms, libraries, etc.).
          </p>
          <div className="flex flex-col gap-2 pt-4">
            <Link href="/scan">
              <Button className="w-full">Scan QR Code</Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full">Back to Home</Button>
            </Link>
          </div>
        </div>
      </div>
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
              threadMessages={threadMessages}
              loadingThreads={loadingThreads}
              expandedThreads={expandedThreads}
              onToggleThread={handleToggleThread}
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
