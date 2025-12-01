import { z } from 'zod';

export const passwordSchema = z.object({
  newPassword: z
    .string()
    .min(8, 'Must be at least 8 characters')
    .refine((val) => /[A-Z]/.test(val), {
      message: 'Must contain at least one uppercase letter',
    })
    .refine((val) => /[a-z]/.test(val), {
      message: 'Must contain at least one lowercase letter',
    })
    .refine((val) => /[0-9]/.test(val), {
      message: 'Must contain at least one number',
    })
    .refine((val) => /[!@#$%^&*()_+\-=\\[\]{};':"\\|,.<>\\/?]/.test(val), {
      message: 'Must contain one special character',
    }),
});

export const PASSWORD_RULES = [
  { key: 'minLength', test: (pwd: string) => pwd.length >= 8, text: 'At least 8 characters' },
  { key: 'hasUppercase', test: (pwd: string) => /[A-Z]/.test(pwd), text: 'At least one uppercase letter (A-Z)' },
  { key: 'hasLowercase', test: (pwd: string) => /[a-z]/.test(pwd), text: 'At least one lowercase letter (a-z)' },
  { key: 'hasNumber', test: (pwd: string) => /[0-9]/.test(pwd), text: 'At least one number (0-9)' },
  {
    key: 'hasSpecialChar',
    test: (pwd: string) => /[!@#$%^&*()_+\-=\\[\]{};':"\\|,.<>\\/?]/.test(pwd),
    text: 'At least one special character (!@#$%^&*)',
  },
] as const;
