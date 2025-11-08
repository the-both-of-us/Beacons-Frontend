import { Location } from '@/types';

export const mockLocations: Location[] = [
  {
    id: 'loc_classroom_a101',
    type: 'location',
    locationCode: 'uni_classroom_A101',
    name: 'University Classroom A101',
    description: 'Main lecture hall for Computer Science courses',
    coordinates: {
      latitude: 40.7128,
      longitude: -74.0060,
    },
    geofenceRadius: 100, // meters
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
  },
  {
    id: 'loc_library_main',
    type: 'location',
    locationCode: 'uni_library_main',
    name: 'University Main Library',
    description: 'Central campus library with study areas and resources',
    coordinates: {
      latitude: 40.7129,
      longitude: -74.0061,
    },
    geofenceRadius: 150,
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
  },
  {
    id: 'loc_cafeteria',
    type: 'location',
    locationCode: 'uni_cafeteria',
    name: 'Student Cafeteria',
    description: 'Main dining hall for students and faculty',
    coordinates: {
      latitude: 40.7130,
      longitude: -74.0062,
    },
    geofenceRadius: 100,
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
  },
  {
    id: 'loc_gym',
    type: 'location',
    locationCode: 'uni_gym',
    name: 'Campus Gym & Recreation Center',
    description: 'Fitness center and sports facilities',
    coordinates: {
      latitude: 40.7127,
      longitude: -74.0059,
    },
    geofenceRadius: 120,
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
  },
];

export const getLocationById = (id: string): Location | undefined => {
  return mockLocations.find(loc => loc.id === id);
};

export const getLocationByCode = (code: string): Location | undefined => {
  return mockLocations.find(loc => loc.locationCode === code);
};
