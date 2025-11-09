'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const [room, setRoom] = useState<Room | null>(null);
  const [allMessages, setAllMessages] = useState<Message[]>([]); // Single flat array for ALL messages
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [replyingTo, setReplyingTo] = useState<{ id: string; username: string } | null>(null);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const { account, isAdmin } = useAuth();
  const messageInputRef = useRef<HTMLTextAreaElement | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const focusMessageInput = () => {
    if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
      window.requestAnimationFrame(() => messageInputRef.current?.focus());
    } else {
      messageInputRef.current?.focus();
    }
  };

  // Load initial data
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
        setAllMessages(history);
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

  // Separate messages into top-level and thread replies, calculate AI loading states
  const { topLevelMessages, threadReplies, aiLoadingForMessages } = useMemo(() => {
    const topLevel: Message[] = [];
    const replies: Record<string, Message[]> = {};
    const aiLoading = new Set<string>();

    allMessages.forEach((msg) => {
      if (msg.parentMessageId) {
        // It's a thread reply
        if (!replies[msg.parentMessageId]) {
          replies[msg.parentMessageId] = [];
        }
        replies[msg.parentMessageId].push(msg);
      } else {
        // It's a top-level message
        topLevel.push(msg);
      }
    });

    // Sort top-level messages by timestamp
    topLevel.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    // Sort thread replies: AI first, then by timestamp
    Object.keys(replies).forEach((parentId) => {
      replies[parentId].sort((a, b) => {
        if (a.aiGenerated && !b.aiGenerated) return -1;
        if (!a.aiGenerated && b.aiGenerated) return 1;
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      });
    });

    // Determine which messages are waiting for AI response
    topLevel.forEach((msg) => {
      const hasLocationTag = msg.tags?.includes('location-specific-question');
      const threadRepliesForMsg = replies[msg.id] || [];
      const hasAiReply = threadRepliesForMsg.some((reply) => reply.aiGenerated === true);

      if (hasLocationTag && msg.isThreadStarter && !hasAiReply) {
        aiLoading.add(msg.id);
      }
    });

    return { topLevelMessages: topLevel, threadReplies: replies, aiLoadingForMessages: aiLoading };
  }, [allMessages]);

  const { isConnected, assignedUsername, sendMessage, voteMessage: voteMessageViaHub } = useChatHub({
    roomId,
    onHistory: (history) => {
      setAllMessages(history);
    },
    onThreadHistory: (threadMsgs) => {
      // Add thread messages to the main array
      setAllMessages((prev) => {
        const newMessages = threadMsgs.filter(
          (msg) => !prev.some((existing) => existing.id === msg.id)
        );
        return [...prev, ...newMessages];
      });
    },
    onMessage: (message) => {
      // Add any new message to the flat array
      setAllMessages((prev) => {
        // Avoid duplicates
        if (prev.some((m) => m.id === message.id)) {
          return prev;
        }
        return [...prev, message];
      });

    },
    onVoteUpdate: (update: VoteUpdate) => {
      // Update votes in all messages
      setAllMessages((prev) =>
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
    enabled: true,
  });

  const handleSend = async (content: string, tags?: string[], parentMessageId?: string) => {
    setIsSending(true);
    try {
      await sendMessage(content, tags, parentMessageId);

      // Clear reply state
      if (parentMessageId) {
        setReplyingTo(null);
      }
    } finally {
      setIsSending(false);
      focusMessageInput();
    }
  };

  const showNotification = (message: string, duration = 3000) => {
    setNotification(message);
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    notificationTimeoutRef.current = setTimeout(() => {
      setNotification(null);
    }, duration);
  };

  const handleVote = async (messageId: string, voteType: 'up' | 'down') => {
    if (!account) {
      showNotification('Log in to vote.');
      return;
    }

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
    const message = allMessages.find((m) => m.id === messageId);
    if (message) {
      setReplyingTo({ id: message.id, username: message.username });
    }
  };

  useEffect(() => {
    if (replyingTo) {
      focusMessageInput();
    }
  }, [replyingTo]);

  useEffect(() => {
    return () => {
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, []);

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
    <main className="h-screen overflow-hidden bg-gradient-to-b from-blue-50 to-white flex flex-col relative">
      {/* Header - Fixed height */}
      <div className="flex-shrink-0 px-2 sm:px-4 py-2 sm:py-4 border-b border-gray-100 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-5xl">
            <div className="flex flex-col gap-1 sm:gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm uppercase tracking-wide text-blue-600">Now chatting in</p>
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{room.name}</h1>
                {room.locationName && (
                  <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">
                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 11a3 3 0 100-6 3 3 0 000 6z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4.5 8-11a8 8 0 10-16 0c0 6.5 8 11 8 11z" />
                    </svg>
                    {room.locationName}
                  </div>
                )}
              </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700 shadow-sm">
                <span
                  className={`h-2 w-2 rounded-full ${
                    isConnected ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
                {isConnected ? 'Connected' : 'Connecting…'}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
                type="button"
              >
                Back
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/')}
                type="button"
              >
                Home
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Chat area - Flexible */}
      <div className="flex-1 overflow-hidden px-2 sm:px-4 py-2 sm:py-4">
        <div className="mx-auto max-w-5xl h-full flex flex-col">
          {/* Messages - Scrollable */}
          <div className="flex-1 overflow-y-auto mb-3 sm:mb-4 rounded-xl sm:rounded-2xl border border-gray-100 bg-white p-2 sm:p-4 shadow-lg">
            <MessageList
              messages={topLevelMessages}
              threadReplies={threadReplies}
              aiLoadingForMessages={aiLoadingForMessages}
              onVote={handleVote}
              onReply={handleReply}
            />
          </div>

          {/* Input - Fixed at bottom */}
          <div className="flex-shrink-0 rounded-xl sm:rounded-2xl border border-gray-100 bg-white p-2 sm:p-4 shadow-lg">
            <MessageInput
              onSend={handleSend}
              disabled={!isConnected}
              isSubmitting={isSending}
              availableTags={room?.availableTags}
              replyingTo={replyingTo}
              onCancelReply={() => setReplyingTo(null)}
              textAreaRef={messageInputRef}
            />
          </div>
        </div>
      </div>
      {notification && (
        <div className="pointer-events-none fixed bottom-20 right-4 z-50 max-w-xs rounded-2xl bg-gray-900/90 px-5 py-3 text-sm text-white shadow-2xl">
          {notification}
        </div>
      )}
    </main>
  );
};
