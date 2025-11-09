"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Room } from "@/types";
import { Button } from "@/components/ui/Button";
import { QRScanner } from "@/components/qr/QRScanner";
import { useAuth } from "@/context/AuthContext";
import { addScannedRoom, getAccessibleRoomIds } from "@/lib/roomAccess";

type Tab = "scan" | "browse";

export default function ScanPage() {
  const router = useRouter();
  const { account, loading: authLoading, login, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("scan");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrError, setQrError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [accessibleRoomIds, setAccessibleRoomIds] = useState<string[]>([]);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError(null);

    // Load accessible room IDs from localStorage
    setAccessibleRoomIds(getAccessibleRoomIds());

    api
      .getRooms()
      .then((data) => {
        if (active) setRooms(data);
      })
      .catch((err) => {
        if (active)
          setError(err instanceof Error ? err.message : "Failed to load rooms");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleQRScan = async (code: string) => {
    setIsValidating(true);
    setQrError(null);

    try {
      const validation = await api.verifyQRCode(code);

      if (validation.isValid && validation.roomId) {
        // Track this room as scanned
        addScannedRoom(validation.roomId, validation.roomName);

        // Update accessible rooms list
        setAccessibleRoomIds(getAccessibleRoomIds());

        // Successfully validated, redirect to room
        router.push(`/room/${encodeURIComponent(validation.roomId)}`);
      } else {
        setQrError("Invalid or expired QR code. Please try again.");
      }
    } catch (err) {
      setQrError(
        err instanceof Error ? err.message : "Failed to validate QR code"
      );
    } finally {
      setIsValidating(false);
    }
  };

  // Filter rooms based on user access
  const accessibleRooms = useMemo(() => {
    // Admins can see all rooms
    if (isAdmin) {
      return rooms;
    }

    // Non-admins can only see rooms they've scanned
    return rooms.filter((room) => accessibleRoomIds.includes(room.id));
  }, [rooms, accessibleRoomIds, isAdmin]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="container mx-auto max-w-4xl py-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Join a Room</h1>
          <p className="text-gray-600">
            Scan a QR code or browse available rooms
          </p>
        </div>

        {!account && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span>
              You can scan QR codes without signing in. Log in to vote, and save
              your rooms for the day.
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={login}
              disabled={authLoading}
            >
              Sign In
            </Button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
            <button
              onClick={() => setActiveTab("scan")}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "scan"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Scan QR
            </button>
            <button
              onClick={() => setActiveTab("browse")}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "browse"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Browse Rooms
            </button>
          </div>
        </div>

        {/* QR Scanner Tab */}
        {activeTab === "scan" && (
          <div className="mb-6">
            {qrError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 mb-4">
                {qrError}
              </div>
            )}

            {isValidating && (
              <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-blue-700 mb-4">
                Validating QR code...
              </div>
            )}

            <QRScanner
              onScanSuccess={handleQRScan}
              onScanError={(err) => setQrError(err)}
            />
          </div>
        )}

        {/* Browse Rooms Tab */}
        {activeTab === "browse" && (
          <>
            {!isAdmin && accessibleRooms.length === 0 && !isLoading && (
              <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-6 text-center mb-6">
                <p className="text-blue-800 font-semibold mb-2">
                  No rooms scanned yet
                </p>
                <p className="text-blue-700 text-sm">
                  You need to scan a QR code to access rooms. Switch to the
                  "Scan QR" tab to get started!
                </p>
              </div>
            )}

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 mb-6">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="h-20 animate-pulse rounded-2xl bg-white/70"
                  />
                ))}
              </div>
            ) : accessibleRooms.length > 0 ? (
              <>
                {isAdmin && (
                  <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-green-700 mb-4 text-sm">
                    Admin: You can see all rooms
                  </div>
                )}
                <div className="space-y-4">
                  {accessibleRooms.map((room) => (
                    <div
                      key={room.id}
                      className="rounded-2xl border border-gray-100 bg-white/80 p-5 shadow-sm"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm uppercase tracking-wide text-blue-600">
                            Room
                          </p>
                          <p className="text-lg font-semibold text-gray-900">
                            {room.name}
                          </p>
                          <p className="text-sm text-gray-600">ID: {room.id}</p>
                          {room.description && (
                            <p className="mt-1 text-sm text-gray-500">
                              {room.description}
                            </p>
                          )}
                        </div>
                        <Link href={`/room/${encodeURIComponent(room.id)}`}>
                          <Button>Join Room</Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : !isAdmin ? null : (
              <div className="rounded-2xl border border-gray-100 bg-white px-4 py-6 text-center text-gray-600">
                No rooms available. Make sure the backend is running and seeded.
              </div>
            )}
          </>
        )}

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-800">
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
