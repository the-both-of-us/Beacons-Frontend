'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import { AuthStatus } from '@/components/auth/AuthStatus';

export default function Home() {
  const { account, login, logout, loading } = useAuth();

  return (
    <main className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/beacons-logo.png"
              alt="Beacons"
              width={40}
              height={40}
              className="h-10 w-10"
            />
            <span className="text-lg font-semibold text-gray-900">Beacons</span>
          </Link>
          <AuthStatus variant="header" />
        </div>
      </header>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-24">
        <div className="text-center max-w-4xl mx-auto">
          {/* Large Logo */}
          <div className="mb-8 flex justify-center">
            <Image
              src="/beacons-logo.png"
              alt="Beacons"
              width={120}
              height={120}
              className="h-32 w-32"
            />
          </div>

          {/* Slogan */}
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Turn strangers into neighbors
          </h1>

          {/* Short Description */}
          <p className="text-lg text-gray-600 mb-12 max-w-xl mx-auto">
            Connect through QR codes. Chat in real-time. Get AI-powered answers.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link href="/scan">
              <Button size="lg" className="w-full sm:w-auto">
                {account ? 'View Rooms' : 'Scan Room'}
              </Button>
            </Link>
            {account ? (
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => logout()}
                disabled={loading}
              >
                Sign Out
              </Button>
            ) : (
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => login()}
                disabled={loading}
              >
                Sign In
              </Button>
            )}
          </div>
        </div>


        {/* Features Grid */}
        <div className="mt-24 grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="group rounded-2xl border border-gray-100 p-8 hover:border-blue-200 hover:shadow-lg transition-all duration-300">
            <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-100 transition-colors">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Location-Based</h3>
            <p className="text-gray-600 text-sm">Chat with people in your location in real-time</p>
          </div>

          <div className="group rounded-2xl border border-gray-100 p-8 hover:border-blue-200 hover:shadow-lg transition-all duration-300">
            <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-100 transition-colors">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">AI-Powered</h3>
            <p className="text-gray-600 text-sm">Get instant answers tailored to your location</p>
          </div>

          <div className="group rounded-2xl border border-gray-100 p-8 hover:border-blue-200 hover:shadow-lg transition-all duration-300">
            <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-100 transition-colors">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Private</h3>
            <p className="text-gray-600 text-sm">Anonymous or verified. Your choice. Your control.</p>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-24 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">
            How It Works
          </h2>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-px bg-blue-200 hidden md:block" />

            <div className="space-y-12">
              {/* Step 1 */}
              <div className="flex gap-6 md:gap-8">
                <div className="flex-shrink-0 relative">
                  <div className="w-16 h-16 bg-white border-2 border-blue-600 rounded-full flex items-center justify-center font-bold text-blue-600 text-lg">
                    1
                  </div>
                </div>
                <div className="pt-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Scan QR Code</h3>
                  <p className="text-gray-600 text-sm">Find and scan at your location</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-6 md:gap-8">
                <div className="flex-shrink-0 relative">
                  <div className="w-16 h-16 bg-white border-2 border-blue-600 rounded-full flex items-center justify-center font-bold text-blue-600 text-lg">
                    2
                  </div>
                </div>
                <div className="pt-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Instant Connection</h3>
                  <p className="text-gray-600 text-sm">Join the room for your location</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-6 md:gap-8">
                <div className="flex-shrink-0 relative">
                  <div className="w-16 h-16 bg-white border-2 border-blue-600 rounded-full flex items-center justify-center font-bold text-blue-600 text-lg">
                    3
                  </div>
                </div>
                <div className="pt-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Chat & Get Answers</h3>
                  <p className="text-gray-600 text-sm">Ask questions and connect with others</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
