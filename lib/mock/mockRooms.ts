import { Room } from '@/types';

export const mockRooms: Room[] = [
  {
    id: 'room_classroom_a101_main',
    type: 'room',
    locationId: 'loc_classroom_a101',
    roomType: 'main',
    parentThreadId: null,
    filterCriteria: {},
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
    isActive: true,
  },
  {
    id: 'room_library_main',
    type: 'room',
    locationId: 'loc_library_main',
    roomType: 'main',
    parentThreadId: null,
    filterCriteria: {},
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
    isActive: true,
  },
  {
    id: 'room_cafeteria_main',
    type: 'room',
    locationId: 'loc_cafeteria',
    roomType: 'main',
    parentThreadId: null,
    filterCriteria: {},
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
    isActive: true,
  },
  {
    id: 'room_gym_main',
    type: 'room',
    locationId: 'loc_gym',
    roomType: 'main',
    parentThreadId: null,
    filterCriteria: {},
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
    isActive: true,
  },
  // Thread room example
  {
    id: 'thread_bathroom_question',
    type: 'room',
    locationId: 'loc_classroom_a101',
    roomType: 'thread',
    parentThreadId: 'msg_1',
    filterCriteria: {},
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    isActive: true,
  },
  {
    id: 'thread_lecture_time',
    type: 'room',
    locationId: 'loc_classroom_a101',
    roomType: 'thread',
    parentThreadId: 'msg_5',
    filterCriteria: {},
    createdAt: new Date(Date.now() - 900000).toISOString(),
    isActive: true,
  },
];

export const getRoomById = (id: string): Room | undefined => {
  return mockRooms.find(room => room.id === id);
};

export const getRoomByLocationId = (locationId: string, type: 'main' | 'thread' = 'main'): Room | undefined => {
  return mockRooms.find(room => room.locationId === locationId && room.roomType === type);
};

export const addMockRoom = (room: Room): void => {
  mockRooms.push(room);
};
