export interface QrCode {
  id: string;
  type: 'qr_code';
  locationId: string;
  qrData: string;
  signature: string;
  generatedAt: string;
  expiresAt: string;
  isActive: boolean;
}

export interface QrPayload {
  location_id: string;
  generated_at: string;
  expires_at: string;
  signature: string;
}

export interface QrVerificationRequest {
  qrData: string;
}

export interface QrVerificationResponse {
  locationId: string;
  locationName: string;
  roomId: string;
  isValid: boolean;
}
