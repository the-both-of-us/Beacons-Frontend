'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ThreadView } from '@/components/thread/ThreadView';
import { useSignalR } from '@/hooks/useSignalR';
import { api } from '@/lib/api';
import { Message, AiResponse, Thread } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';

interface ThreadPageProps {
  params: {
    threadId: string;
  };
}

export default function ThreadPage({ params }: ThreadPageProps) {
  const router = useRouter();
  const threadId = decodeURIComponent(params.threadId);
  const user = useAuthStore((state) => state.user);
  const authLoading = useAuthStore((state) => state.isLoading);
  const userVotes = useChatStore((state) => state.userVotes);
  const setUserVote = useChatStore((state) => state.setUserVote);

  const [thread, setThread] = useState<Thread | null>(null);
  const [originalMessage, setOriginalMessage] = useState<Message | null>(null);
  const [replies, setReplies] = useState<Message[]>([]);
  const [aiResponse, setAiResponse] = useState<AiResponse | undefined>(undefined);
  const [locationName, setLocationName] = useState<string>('Loading…');
  const [isLoading, setIsLoading] = useState(true);
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

    const loadThread = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const details = await api.getThreadDetails(threadId);
        if (!active) return;
        setThread(details.thread);
        setOriginalMessage(details.originalMessage);
        setReplies(
          [...details.replies].sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          )
        );
        setAiResponse(details.aiResponse);

        const location = await api.getLocation(details.thread.locationId);
        if (active) setLocationName(location.name);
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Failed to load thread');
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    loadThread();
    return () => {
      active = false;
    };
  }, [threadId, user]);

  const { sendMessage, voteMessage, isConnected } = useSignalR(threadId, {
    enabled: !!user && !!thread,
    onMessage: (message: Message) => {
      setReplies((prev) =>
        [...prev, message].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
      );
    },
    onMessageHistory: (history: Message[]) => {
      const sorted = [...history].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      setReplies(sorted);
    },
    onAiResponse: (response: AiResponse) => {
      if (response.threadId === threadId) {
        setAiResponse(response);
      }
    },
    onVoteUpdated: ({ messageId, upvotes, downvotes }) => {
      setReplies((prev) =>
        prev.map((message) =>
          message.id === messageId
            ? {
                ...message,
                votes: { upvotes, downvotes },
              }
            : message
        )
      );
      setOriginalMessage((prev) =>
        prev && prev.id === messageId
          ? {
              ...prev,
              votes: { upvotes, downvotes },
            }
          : prev
      );
    },
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

  const handleSendReply = async (content: string, tags: string[]) => {
    setIsSending(true);
    try {
      await sendMessage(content, tags, threadId);
    } catch (err) {
      console.error('Failed to send reply', err);
      throw err instanceof Error ? err : new Error('Failed to send reply');
    } finally {
      setIsSending(false);
    }
  };

  const connectionLabel = isConnected ? 'Live updates enabled' : 'Connecting…';

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center gap-3 text-sm text-blue-600">
          <button
            type="button"
            onClick={() => router.back()}
            className="font-medium hover:underline"
          >
            ← Back
          </button>
          <Link href="/scan" className="text-blue-500 hover:underline">
            Change room
          </Link>
        </div>

        <header className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-wide text-blue-600">Thread</p>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">
            {originalMessage?.content ?? 'Loading thread…'}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-600">
            <span>Location: {locationName}</span>
            <span className="flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-300'}`}
              />
              {connectionLabel}
            </span>
            {thread && (
              <span className="text-xs uppercase text-gray-400">Thread ID: {thread.id}</span>
            )}
          </div>
        </header>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {isLoading || !originalMessage ? (
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-24 animate-pulse rounded-2xl bg-gray-100" />
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <ThreadView
              originalMessage={originalMessage}
              replies={replies}
              aiResponse={aiResponse}
              onVote={handleVote}
              onSendReply={handleSendReply}
              isSending={isSending}
              userVotes={userVotes}
            />
          </div>
        )}
      </div>
    </main>
  );
}
