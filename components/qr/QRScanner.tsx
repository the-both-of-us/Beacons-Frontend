"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/Button";

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (error: string) => void;
}

export function QRScanner({ onScanSuccess, onScanError }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerIdRef = useRef<string>("qr-reader");

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (scannerRef.current && isScanning) {
        scannerRef.current
          .stop()
          .catch((err) => console.error("Error stopping scanner:", err));
      }
    };
  }, [isScanning]);

  const startScanning = async () => {
    try {
      setError(null);

      // Check for camera permissions
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        const errorMsg = "Camera not supported on this device";
        setError(errorMsg);
        onScanError?.(errorMsg);
        return;
      }

      // Request camera permission
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
        setHasPermission(true);
      } catch (permError) {
        const errorMsg =
          "Camera permission denied. Please allow camera access.";
        setError(errorMsg);
        setHasPermission(false);
        onScanError?.(errorMsg);
        return;
      }

      // Initialize scanner
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(scannerIdRef.current);
      }

      // Start scanning
      await scannerRef.current.start(
        { facingMode: "environment" }, // Use back camera on mobile
        {
          fps: 10, // Frames per second
          qrbox: { width: 250, height: 250 }, // QR box size
        },
        (decodedText) => {
          // Success callback
          console.log("QR Code scanned:", decodedText);
          onScanSuccess(decodedText);
          stopScanning(); // Stop after successful scan
        },
        (errorMessage) => {
          // Error callback (scanning errors, not camera errors)
          // This fires frequently while scanning, so we don't show it to user
          console.debug("QR scan error:", errorMessage);
        }
      );

      setIsScanning(true);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to start camera";
      setError(errorMsg);
      onScanError?.(errorMsg);
      console.error("Error starting QR scanner:", err);
    }
  };

  const stopScanning = async () => {
    try {
      if (scannerRef.current && isScanning) {
        await scannerRef.current.stop();
        setIsScanning(false);
      }
    } catch (err) {
      console.error("Error stopping scanner:", err);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4 text-black">Scan QR Code</h3>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {hasPermission === false && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              Camera access is required to scan QR codes. Please check your
              browser settings.
            </p>
          </div>
        )}

        <div
          id={scannerIdRef.current}
          className={`mb-4 rounded-lg overflow-hidden ${
            isScanning ? "border-2 border-blue-500" : "border border-gray-300"
          }`}
          style={{ minHeight: isScanning ? "300px" : "0" }}
        />

        <div className="flex gap-3">
          {!isScanning ? (
            <Button onClick={startScanning} className="flex-1">
              Start Scanning
            </Button>
          ) : (
            <Button onClick={stopScanning} variant="outline" className="flex-1">
              Stop Scanning
            </Button>
          )}
        </div>

        <p className="mt-4 text-sm text-gray-600 text-center">
          {isScanning
            ? "Point your camera at a QR code"
            : 'Click "Start Scanning" to begin'}
        </p>
      </div>
    </div>
  );
}
