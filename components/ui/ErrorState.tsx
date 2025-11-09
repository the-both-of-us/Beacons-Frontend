'use client';

import React from 'react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  onGoBack?: () => void;
  variant?: 'error' | 'warning' | 'info';
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message,
  onRetry,
  onGoBack,
  variant = 'error',
}) => {
  const colors = {
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      titleColor: 'text-red-900',
      messageColor: 'text-red-700',
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      titleColor: 'text-amber-900',
      messageColor: 'text-amber-700',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      titleColor: 'text-blue-900',
      messageColor: 'text-blue-700',
    },
  };

  const c = colors[variant];

  const icons = {
    error: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    warning: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    info: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  return (
    <div className={`rounded-2xl border-2 ${c.border} ${c.bg} px-6 py-8 text-center space-y-4 shadow-lg`}>
      <div className={`mx-auto w-16 h-16 ${c.iconBg} rounded-full flex items-center justify-center`}>
        <span className={c.iconColor}>{icons[variant]}</span>
      </div>
      <div>
        <h3 className={`text-xl font-bold ${c.titleColor} mb-2`}>{title}</h3>
        <p className={`text-sm ${c.messageColor} max-w-md mx-auto`}>{message}</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
        {onRetry && (
          <Button onClick={onRetry} size="lg">
            Try Again
          </Button>
        )}
        {onGoBack && (
          <Button onClick={onGoBack} variant="outline" size="lg">
            Go Back
          </Button>
        )}
      </div>
    </div>
  );
};
