'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LoginForm } from '@/components/auth/LoginForm';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const setUser = useAuthStore((state) => state.setUser);

  const handleLogin = async (data: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const response = await api.login(data);
      setUser(response.user, response.token);
      router.push('/scan');
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnonymous = () => {
    router.push('/auth/anonymous');
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Login to continue to Social App</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Login to Your Account</CardTitle>
          </CardHeader>
          <CardContent>
            <LoginForm
              onSubmit={handleLogin}
              onAnonymous={handleAnonymous}
              isLoading={isLoading}
            />

            <div className="mt-6 text-center text-sm">
              <span className="text-gray-600">Don't have an account? </span>
              <Link href="/auth/signup" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign up
              </Link>
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
