import { create } from 'zustand';

type ToastType = 'success' | 'error';

interface ToastState {
  visible: boolean;
  message: string;
  type: ToastType;
  show: (message: string, type: ToastType) => void;
  hide: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  visible: false,
  message: '',
  type: 'success',
  show: (message, type) => set({ visible: true, message, type }),
  hide: () => set({ visible: false }),
}));
