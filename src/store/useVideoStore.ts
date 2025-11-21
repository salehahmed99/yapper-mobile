import { create } from 'zustand';

interface IVideoState {
  isMuted: boolean;
  toggleMute: () => void;
  setMuted: (muted: boolean) => void;
}

export const useVideoStore = create<IVideoState>((set) => ({
  isMuted: true, // Videos start muted globally
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
  setMuted: (muted: boolean) => set({ isMuted: muted }),
}));
