'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (error: string) => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScanSuccess, onScanError }) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    if (!scannerRef.current && isScanning) {
      scannerRef.current = new Html5QrcodeScanner(
        'qr-reader',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        false
      );

      scannerRef.current.render(
        (decodedText) => {
          onScanSuccess(decodedText);
          setIsScanning(false);
          if (scannerRef.current) {
            scannerRef.current.clear();
          }
        },
        (error) => {
          // Ignore errors (they happen on every frame without QR code)
        }
      );
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
    };
  }, [isScanning, onScanSuccess]);

  return (
    <div>
      <div id="qr-reader" className="w-full max-w-md mx-auto"></div>
      {!isScanning && (
        <div className="text-center mt-4">
          <p className="text-green-600 font-medium">QR Code scanned successfully!</p>
        </div>
      )}
    </div>
  );
};
