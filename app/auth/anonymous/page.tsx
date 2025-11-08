'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';

export default function AnonymousPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const setUser = useAuthStore((state) => state.setUser);

  const handleContinueAnonymous = async () => {
    setIsLoading(true);
    try {
      const response = await api.createAnonymousSession();
      setUser(response.user, response.token);
      router.push('/scan');
    } catch (error) {
      console.error('Anonymous session failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Continue as Guest</h1>
          <p className="text-gray-600">No account needed</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Anonymous Mode</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">What you can do:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>✓ Join location-based chat rooms</li>
                  <li>✓ Send and receive messages</li>
                  <li>✓ Vote on messages and AI responses</li>
                  <li>✓ Ask questions and get AI help</li>
                </ul>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Limitations:</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• No message history across devices</li>
                  <li>• Session ends when you close the browser</li>
                  <li>• Cannot create an account later with this session</li>
                </ul>
              </div>

              <Button
                onClick={handleContinueAnonymous}
                disabled={isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? 'Creating session...' : 'Continue Anonymously'}
              </Button>

              <div className="text-center text-sm">
                <span className="text-gray-600">Want full features? </span>
                <Link href="/auth/signup" className="text-blue-600 hover:text-blue-700 font-medium">
                  Create an account
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-4 text-center">
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-700">
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
