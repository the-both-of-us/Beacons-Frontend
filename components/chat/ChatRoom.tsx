'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
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
  const [allMessages, setAllMessages] = useState<Message[]>([]); // Single flat array for ALL messages
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [replyingTo, setReplyingTo] = useState<{ id: string; username: string } | null>(null);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const { account, isAdmin } = useAuth();
  const messageInputRef = useRef<HTMLTextAreaElement | null>(null);

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

    console.log('🔄 Recalculating message structure. Total messages:', allMessages.length);

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

      console.log(`🔍 Message ${msg.id.slice(0, 8)}:`, {
        hasLocationTag,
        isThreadStarter: msg.isThreadStarter,
        replyCount: threadRepliesForMsg.length,
        hasAiReply,
        replies: threadRepliesForMsg.map(r => ({
          id: r.id.slice(0, 8),
          aiGenerated: r.aiGenerated,
          username: r.username
        }))
      });

      if (hasLocationTag && msg.isThreadStarter && !hasAiReply) {
        console.log(`⏳ Setting AI loading for message ${msg.id.slice(0, 8)}`);
        aiLoading.add(msg.id);
      } else if (hasLocationTag && hasAiReply) {
        console.log(`✅ AI response found for message ${msg.id.slice(0, 8)}`);
      }
    });

    console.log('📊 Final state:', {
      topLevelCount: topLevel.length,
      threadCount: Object.keys(replies).length,
      loadingCount: aiLoading.size,
      loadingMessages: Array.from(aiLoading).map(id => id.slice(0, 8))
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
      console.log('📨 Message received:', {
        id: message.id,
        username: message.username,
        parentMessageId: message.parentMessageId,
        aiGenerated: message.aiGenerated,
        isThreadStarter: message.isThreadStarter,
        tags: message.tags,
      });

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
    <main className="h-screen overflow-hidden bg-gradient-to-b from-blue-50 to-white flex flex-col">
      {/* Header - Fixed height */}
      <div className="flex-shrink-0 px-2 sm:px-4 py-2 sm:py-4 border-b border-gray-100 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col gap-1 sm:gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm uppercase tracking-wide text-blue-600">Now chatting in</p>
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{room.name}</h1>
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
    </main>
  );
};
