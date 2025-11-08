'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';
import { useRoomStore } from '@/store/roomStore';
import { api } from '@/lib/api';
import { useSignalR } from '@/hooks/useSignalR';
import { ThreadList } from '@/components/thread/ThreadList';
import { Thread } from '@/types';

interface ChatRoomProps {
  roomId: string;
}

export const ChatRoom: React.FC<ChatRoomProps> = ({ roomId }) => {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const authLoading = useAuthStore((state) => state.isLoading);

  const {
    messages,
    aiResponses,
    setMessages,
    addMessage,
    updateMessageVotes,
    addAiResponse,
    clearMessages,
    userVotes,
    setUserVote,
  } = useChatStore();

  const {
    currentLocation,
    currentRoom,
    setLocation,
    setRoom,
    threads,
    addThread,
    setThreads,
  } = useRoomStore();
  const currentRoomId = currentRoom?.id;
  const currentLocationId = currentLocation?.id;

  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth/login');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    let active = true;

    const bootstrap = async () => {
      setIsBootstrapping(true);
      setError(null);

      try {
        let room = currentRoom;
        if (!room || room.id !== roomId) {
          room = await api.getRoom(roomId);
          if (active) setRoom(room);
        }
        if (!room) {
          throw new Error('Room not found');
        }

        if (!currentLocation || currentLocation.id !== room.locationId) {
          const location = await api.getLocation(room.locationId);
          if (active) setLocation(location);
        }

        const initialMessages = await api.getMessages(roomId);
        if (active) {
          setMessages(initialMessages);
        }

        const locationThreads = await api.getThreadsForLocation(room.locationId);
        if (active) {
          setThreads(locationThreads);
        }

        if (locationThreads.length > 0) {
          const responses = await Promise.all(
            locationThreads.map((thread) =>
              api
                .getThreadDetails(thread.id)
                .then((details) => details.aiResponse)
                .catch(() => undefined)
            )
          );

          if (active) {
            responses.forEach((response) => {
              if (response) {
                addAiResponse(response);
              }
            });
          }
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Failed to load room');
        }
      } finally {
        if (active) {
          setIsBootstrapping(false);
        }
      }
    };

    bootstrap();

    return () => {
      active = false;
      clearMessages();
    };
  }, [
    roomId,
    user,
    currentRoomId,
    currentLocationId,
    addAiResponse,
    setRoom,
    setLocation,
    setMessages,
    setThreads,
    clearMessages,
  ]);

  const { sendMessage, voteMessage, isConnected } = useSignalR(roomId, {
    enabled: !!user && !isBootstrapping,
    onMessage: addMessage,
    onMessageHistory: setMessages,
    onThreadCreated: (thread: Thread) => addThread(thread),
    onAiResponse: addAiResponse,
    onVoteUpdated: ({ messageId, upvotes, downvotes }) =>
      updateMessageVotes(messageId, upvotes, downvotes),
  });

  const handleVote = async (messageId: string, voteType: 'up' | 'down') => {
    if (userVotes[messageId]) {
      return;
    }
    try {
      await voteMessage(messageId, voteType);
      setUserVote(messageId, voteType);
    } catch (err) {
      console.error('Vote failed', err);
    }
  };

  const handleViewThread = (threadId: string) => {
    router.push(`/thread/${threadId}`);
  };

  const sendChatMessage = async (content: string, tags: string[]) => {
    setIsSending(true);
    try {
      await sendMessage(content, tags);
    } catch (err) {
      console.error('Failed to send message', err);
      throw err instanceof Error ? err : new Error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const threadLookup = useMemo(() => {
    return threads.reduce<Record<string, string>>((acc, thread) => {
      acc[thread.originalMessageId] = thread.id;
      return acc;
    }, {});
  }, [threads]);

  const threadSummaries = useMemo(() => {
    return threads.map((thread) => {
      const question = messages.find((msg) => msg.id === thread.originalMessageId);
      return {
        id: thread.id,
        question: question?.content ?? 'Thread question',
        createdAt: thread.createdAt,
        hasAiResponse: aiResponses.has(thread.originalMessageId),
      };
    });
  }, [threads, messages, aiResponses]);

  const locationName = currentLocation?.name ?? 'Loading location…';

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-blue-600">Now chatting in</p>
            <h1 className="text-3xl font-bold text-gray-900">{locationName}</h1>
            {currentRoom && (
              <p className="text-sm text-gray-600">Room ID: {currentRoom.id}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm">
              <span
                className={`h-2.5 w-2.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-300'}`}
              />
              {isConnected ? 'Connected' : 'Connecting…'}
            </span>
            <Link
              href="/scan"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Change room →
            </Link>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[3fr,1.25fr]">
          <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-lg">
            <div className="mb-6">
              {isBootstrapping ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <div key={idx} className="h-24 animate-pulse rounded-2xl bg-gray-100" />
                  ))}
                </div>
              ) : (
                <MessageList
                  messages={messages}
                  aiResponses={aiResponses}
                  userVotes={userVotes}
                  onVote={handleVote}
                  onViewThread={handleViewThread}
                  threadLookup={threadLookup}
                />
              )}
            </div>

            <div className="border-t border-gray-100 pt-6">
              <MessageInput
                onSend={sendChatMessage}
                disabled={!isConnected}
                isSubmitting={isSending}
              />
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Threads</h2>
                <span className="text-xs uppercase tracking-wide text-gray-500">
                  {threads.length} total
                </span>
              </div>
              <div className="mt-4">
                {isBootstrapping ? (
                  <div className="space-y-2">
                    {Array.from({ length: 2 }).map((_, idx) => (
                      <div key={idx} className="h-20 animate-pulse rounded-2xl bg-gray-100" />
                    ))}
                  </div>
                ) : (
                  <ThreadList items={threadSummaries} onSelect={handleViewThread} />
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
};
