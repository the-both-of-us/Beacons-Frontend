import { create } from 'zustand';
import { Location, Room, Thread } from '@/types';

interface RoomState {
  currentLocation: Location | null;
  currentRoom: Room | null;
  threads: Thread[];

  // Actions
  setLocation: (location: Location) => void;
  setRoom: (room: Room) => void;
  addThread: (thread: Thread) => void;
  setThreads: (threads: Thread[]) => void;
  clearRoom: () => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  currentLocation: null,
  currentRoom: null,
  threads: [],

  setLocation: (location) => set({ currentLocation: location }),

  setRoom: (room) => set({ currentRoom: room }),

  addThread: (thread) => set((state) => {
    if (state.threads.some((existing) => existing.id === thread.id)) {
      return state;
    }
    return { threads: [...state.threads, thread] };
  }),

  setThreads: (threads) => set({ threads }),

  clearRoom: () => set({
    currentLocation: null,
    currentRoom: null,
    threads: [],
  }),
}));
