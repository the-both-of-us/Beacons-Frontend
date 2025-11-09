'use client';

import { useEffect, useRef, useState } from 'react';
import QRCodeLib from 'qrcode';
import { Button } from '@/components/ui/Button';

interface QRCodeDisplayProps {
  code: string;
  locationName?: string;
  roomName?: string;
  size?: number;
}

export function QRCodeDisplay({ code, locationName, roomName, size = 300 }: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      QRCodeLib.toCanvas(
        canvasRef.current,
        code,
        {
          width: size,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#ffffff',
          },
        },
        (err) => {
          if (err) {
            console.error('Error generating QR code:', err);
            setError('Failed to generate QR code');
          }
        }
      );
    }
  }, [code, size]);

  const handleDownload = () => {
    if (!canvasRef.current) return;

    try {
      // Create a download link
      const url = canvasRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      const filename = locationName
        ? `qr-${locationName.toLowerCase().replace(/\s+/g, '-')}.png`
        : `qr-${code}.png`;
      link.download = filename;
      link.href = url;
      link.click();
    } catch (err) {
      console.error('Error downloading QR code:', err);
      setError('Failed to download QR code');
    }
  };

  const handlePrint = () => {
    if (!canvasRef.current) return;

    try {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Print QR Code - ${locationName || code}</title>
              <style>
                body {
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  min-height: 100vh;
                  margin: 0;
                  font-family: sans-serif;
                }
                .header {
                  text-align: center;
                  margin-bottom: 20px;
                }
                .qr-container {
                  text-align: center;
                }
                img {
                  max-width: 100%;
                  height: auto;
                }
                .footer {
                  margin-top: 20px;
                  text-align: center;
                  font-size: 14px;
                  color: #666;
                }
                @media print {
                  @page {
                    margin: 1in;
                  }
                }
              </style>
            </head>
            <body>
              <div class="header">
                ${roomName ? `<h1>${roomName}</h1>` : ''}
                ${locationName ? `<h2>${locationName}</h2>` : ''}
              </div>
              <div class="qr-container">
                <img src="${dataUrl}" alt="QR Code" />
              </div>
              <div class="footer">
                <p>Scan this QR code to join the chat room</p>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
        }, 250);
      }
    } catch (err) {
      console.error('Error printing QR code:', err);
      setError('Failed to print QR code');
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {error && (
        <div className="w-full p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
        <canvas ref={canvasRef} />
      </div>

      {(locationName || roomName) && (
        <div className="text-center">
          {roomName && <p className="font-semibold text-gray-900">{roomName}</p>}
          {locationName && <p className="text-sm text-gray-600">{locationName}</p>}
        </div>
      )}

      <div className="flex gap-2">
        <Button onClick={handleDownload} variant="outline" size="sm">
          Download PNG
        </Button>
        <Button onClick={handlePrint} variant="outline" size="sm">
          Print
        </Button>
      </div>

      <div className="text-xs text-gray-500 font-mono bg-gray-50 px-3 py-2 rounded border">
        {code}
      </div>
    </div>
  );
}
