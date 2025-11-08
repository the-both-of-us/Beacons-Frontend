export interface Location {
  id: string;
  type: 'location';
  locationCode: string;
  name: string;
  description: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  geofenceRadius: number;
  createdAt: string;
}

export interface ProximityVerificationRequest {
  locationId: string;
  userLatitude: number;
  userLongitude: number;
}

export interface ProximityVerificationResponse {
  accessGranted: boolean;
  roomId: string;
  locationName: string;
}
