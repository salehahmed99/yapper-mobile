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
  { key: 'minLength', test: (pwd: string) => pwd.length >= 8 },
  { key: 'hasUppercase', test: (pwd: string) => /[A-Z]/.test(pwd) },
  { key: 'hasLowercase', test: (pwd: string) => /[a-z]/.test(pwd) },
  { key: 'hasNumber', test: (pwd: string) => /[0-9]/.test(pwd) },
  {
    key: 'hasSpecialChar',
    test: (pwd: string) => /[!@#$%^&*()_+\-=\\[\]{};':"\\|,.<>\\/?]/.test(pwd),
  },
] as const;
