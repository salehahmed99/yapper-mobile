import { create } from 'zustand';
import { parsePhoneNumberFromString, CountryCode } from 'libphonenumber-js/max';
import * as Localization from 'expo-localization';
import { emailSchema, phoneSchema, usernameSchema } from '../schemas/schemas';

type TextType = 'email' | 'phone' | 'username' | null;

interface IForgotPasswordState {
  // State
  identifier: string;
  textType: TextType;
  resetToken: string;

  // Actions
  setIdentifier: (value: string) => void;
  setResetToken: (token: string) => void;
  detectTextType: (input: string) => TextType;
  reset: () => void;
}

export const useForgotPasswordStore = create<IForgotPasswordState>((set) => {
  const defaultCountry = Localization.getLocales()[0]?.regionCode || 'US';

  return {
    // Initial state
    identifier: '',
    textType: null,
    resetToken: '',

    // Actions
    setIdentifier: (value: string) => set({ identifier: value }),

    setResetToken: (token: string) => set({ resetToken: token }),

    detectTextType: (input: string): TextType => {
      const trimmed = input.trim();

      if (emailSchema.safeParse(trimmed).success) {
        set({ textType: 'email' });
        return 'email';
      }

      const phoneNumber = parsePhoneNumberFromString(input, defaultCountry as CountryCode);
      if (
        phoneNumber &&
        phoneNumber.isValid() &&
        phoneNumber.getType() === 'MOBILE' &&
        phoneSchema.safeParse(trimmed).success
      ) {
        set({ textType: 'phone' });
        return 'phone';
      }

      if (usernameSchema.safeParse(trimmed).success) {
        set({ textType: 'username' });
        return 'username';
      }

      set({ textType: null });
      return null;
    },

    reset: () => set({ identifier: '', textType: null, resetToken: '' }),
  };
});
