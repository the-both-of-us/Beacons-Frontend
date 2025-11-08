import { QrCode, QrPayload } from '@/types';

export const mockQRCodes: QrCode[] = [
  {
    id: 'qr_classroom_a101',
    type: 'qr_code',
    locationId: 'loc_classroom_a101',
    qrData: JSON.stringify({
      location_id: 'loc_classroom_a101',
      generated_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 86400000).toISOString(),
      signature: 'mock_signature_abc123',
    }),
    signature: 'mock_signature_abc123',
    generatedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    isActive: true,
  },
  {
    id: 'qr_library_main',
    type: 'qr_code',
    locationId: 'loc_library_main',
    qrData: JSON.stringify({
      location_id: 'loc_library_main',
      generated_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 86400000).toISOString(),
      signature: 'mock_signature_def456',
    }),
    signature: 'mock_signature_def456',
    generatedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    isActive: true,
  },
  {
    id: 'qr_cafeteria',
    type: 'qr_code',
    locationId: 'loc_cafeteria',
    qrData: JSON.stringify({
      location_id: 'loc_cafeteria',
      generated_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 86400000).toISOString(),
      signature: 'mock_signature_ghi789',
    }),
    signature: 'mock_signature_ghi789',
    generatedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    isActive: true,
  },
  {
    id: 'qr_gym',
    type: 'qr_code',
    locationId: 'loc_gym',
    qrData: JSON.stringify({
      location_id: 'loc_gym',
      generated_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 86400000).toISOString(),
      signature: 'mock_signature_jkl012',
    }),
    signature: 'mock_signature_jkl012',
    generatedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    isActive: true,
  },
];

export const parseQRData = (qrData: string): QrPayload | null => {
  try {
    const payload = JSON.parse(qrData);
    if (payload.location_id && payload.signature) {
      return payload as QrPayload;
    }
    return null;
  } catch {
    return null;
  }
};

export const verifyQRCode = (qrData: string): boolean => {
  const payload = parseQRData(qrData);
  if (!payload) return false;

  // Mock verification - in real app, this would verify signature and expiry
  const expiresAt = new Date(payload.expires_at);
  return expiresAt > new Date();
};
