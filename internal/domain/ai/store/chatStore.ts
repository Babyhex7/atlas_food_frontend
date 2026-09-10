import { create } from "zustand";

interface ChatState {
  isOpen: boolean;
  activeSessionId: string | null;
  setIsOpen: (isOpen: boolean) => void;
  toggleOpen: () => void;
  setActiveSessionId: (id: string | null) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  isOpen: false,
  activeSessionId: null,
  setIsOpen: (isOpen) => set({ isOpen }),
  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
  setActiveSessionId: (id) => set({ activeSessionId: id }),
}));
