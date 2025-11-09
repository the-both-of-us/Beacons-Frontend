export interface QRCode {
  id: string;
  roomId: string;
  roomName: string;
  locationName: string;
  createdAt: string;
  expiresAt?: string;
  isActive: boolean;
}

export interface CreateQRCodeRequest {
  roomId: string;
  locationName: string;
  expiresAt?: string;
}

export interface QRValidationResponse {
  isValid: boolean;
  roomId?: string;
  roomName?: string;
  locationName?: string;
}
