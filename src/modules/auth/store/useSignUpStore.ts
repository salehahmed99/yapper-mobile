import { create } from 'zustand';

interface ISignUpState {
  // State
  name: string;
  email: string;
  dateOfBirth: string;

  // Actions
  setName: (value: string) => void;
  setEmail: (value: string) => void;
  setDateOfBirth: (value: string) => void;
  reset: () => void;
}

export const useSignUpStore = create<ISignUpState>((set) => ({
  // Initial state
  name: '',
  email: '',
  dateOfBirth: '',
  verificationToken: '',

  // Actions
  setName: (value: string) => set({ name: value }),
  setEmail: (value: string) => set({ email: value }),
  setDateOfBirth: (value: string) => set({ dateOfBirth: value }),
  reset: () => set({ name: '', email: '', dateOfBirth: '' }),
}));
