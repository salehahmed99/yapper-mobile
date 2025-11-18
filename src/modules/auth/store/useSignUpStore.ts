import { create } from 'zustand';

interface ISignUpState {
  // State
  name: string;
  email: string;
  dateOfBirth: string;
  verificationToken: string;
  password: string;
  userNames: string[];

  // Actions
  setName: (value: string) => void;
  setEmail: (value: string) => void;
  setDateOfBirth: (value: string) => void;
  setVerificationToken: (token: string) => void;
  setPassword: (value: string) => void;
  setUserNames: (names: string[]) => void;
  reset: () => void;
}

export const useSignUpStore = create<ISignUpState>((set) => ({
  // Initial state
  name: '',
  email: '',
  dateOfBirth: '',
  verificationToken: '',
  password: '',
  userNames: [],

  // Actions
  setName: (value: string) => set({ name: value }),
  setEmail: (value: string) => set({ email: value }),
  setDateOfBirth: (value: string) => set({ dateOfBirth: value }),
  setVerificationToken: (token: string) => set({ verificationToken: token }),
  setPassword: (value: string) => set({ password: value }),
  setUserNames: (names: string[]) => set({ userNames: names }),
  reset: () => set({ name: '', email: '', dateOfBirth: '', verificationToken: '', password: '', userNames: [] }),
}));
