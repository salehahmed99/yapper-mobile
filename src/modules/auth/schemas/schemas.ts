import { z } from 'zod';
export const emailSchema = z
  .string({ required_error: 'Email is required' })
  .trim()
  .email('Please enter a valid email address');

// Username
export const usernameSchema = z
  .string({ required_error: 'Username is required' })
  .trim()
  .min(3, 'Username must be at least 3 characters long')
  .max(30, 'Username must be at most 20 characters long')
  .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores');

export const userBirthDateSchema = z.string({ required_error: 'Birth date is required' }).refine((date) => {
  const parsedDate = new Date(date);
  const today = new Date();
  let age = today.getFullYear() - parsedDate.getFullYear();
  const monthDiff = today.getMonth() - parsedDate.getMonth();
  const dayDiff = today.getDate() - parsedDate.getDate();

  // Adjust age if birthday hasn't occurred yet this year
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--;
  }

  return age >= 13;
}, 'You must be at least 13 years old to register');

// Password
export const passwordLogInSchema = z
  .string({ required_error: 'Password is required' })
  .min(8, 'Password must be at least 8 characters long')
  .max(64, 'Password must be at most 64 characters long');

export const passwordSchema = z
  .string({ required_error: 'Password is required' })
  .min(8, 'Password must be at least 8 characters long')
  .max(64, 'Password must be at most 64 characters long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

// Phone number
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[0-9]{10,15}$/, 'Invalid phone number');

// Login schema
export const loginSchema = z.object({
  identifier: z.string({ required_error: 'Email or username or phoneNumber is required' }).trim(),
  password: passwordLogInSchema,
});
