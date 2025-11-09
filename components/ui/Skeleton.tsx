'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <div className={cn('bg-gray-200 rounded-lg animate-pulse', className)} />
  );
};

export const MessageSkeleton = () => (
  <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm animate-pulse">
    <div className="flex items-center gap-3 mb-3">
      <Skeleton className="h-8 w-8 rounded-full" />
      <Skeleton className="h-4 w-24" />
      <Skeleton className="ml-auto h-3 w-16" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-4/6" />
    </div>
    <div className="mt-4 flex gap-2">
      <Skeleton className="h-8 w-20 rounded-lg" />
      <Skeleton className="h-8 w-20 rounded-lg" />
    </div>
  </div>
);

export const RoomListSkeleton = () => (
  <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm animate-pulse">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-3 w-32" />
      </div>
      <Skeleton className="h-10 w-28 rounded-lg" />
    </div>
  </div>
);

export const ChatHeaderSkeleton = () => (
  <div className="px-3 sm:px-4 py-3 sm:py-4 border-b border-gray-100 bg-white animate-pulse">
    <div className="mx-auto max-w-5xl">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-6 w-32" />
        </div>
        <Skeleton className="h-8 w-20 rounded-full" />
      </div>
    </div>
  </div>
);
