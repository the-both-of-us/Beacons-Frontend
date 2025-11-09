'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import { AuthStatus } from '@/components/auth/AuthStatus';

export default function Home() {
  const { account, login, logout, loading } = useAuth();

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="border-b border-blue-100/60 bg-white/70 backdrop-blur">
        <div className="container mx-auto flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-blue-900">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white font-bold">
              🔦
            </span>
            Beacons
          </Link>
          <AuthStatus variant="header" />
        </div>
      </header>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          {/* Logo/Title */}
          <h1 className="text-6xl sm:text-7xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Beacons
          </h1>

          {/* Slogan */}
          <p className="text-2xl sm:text-3xl text-gray-700 font-semibold mb-8">
            Turn strangers into neighbors
          </p>

          {/* Description */}
          <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            A location-based platform that brings people together through QR codes.
            Join real-time conversations, ask questions, and get AI-assisted answers
            specific to your physical location.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
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
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <CardTitle>Location-Based Rooms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Each physical location has its own chat room. Connect with people around you in real-time.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <CardTitle>AI-Assisted Answers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Ask location-specific questions and get instant AI responses trained on community knowledge.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <CardTitle>Privacy First</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Join anonymously or create an account. Your choice. We prioritize your privacy and security.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <div className="mt-20 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>

          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Scan a QR Code</h3>
                <p className="text-gray-600">
                  Find a QR code at your location (classroom, library, cafeteria, etc.) and scan it with your phone's camera.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Join the Room</h3>
                <p className="text-gray-600">
                  You'll be instantly connected to the chatroom for that specific location. No app download needed—works right in your browser!
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Chat & Ask Questions</h3>
                <p className="text-gray-600">
                  Ask questions, share information, or just chat with others in the same location. Tag questions for AI assistance!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Hackathon Badge */}
        <div className="mt-20 text-center">
          <div className="inline-block bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg">
            Built for: Making Cities Inclusive, Safe, Resilient & Sustainable
          </div>
        </div>
      </div>
    </main>
  );
}
