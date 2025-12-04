import { PASSWORD_RULES } from '@/src/modules/settings/types/schemas';

export const validatePassword = (password: string) => {
  return PASSWORD_RULES.map((rule) => ({
    ...rule,
    isValid: rule.test(password),
  }));
};

export const isPasswordValid = (password: string): boolean => {
  return validatePassword(password).every((rule) => rule.isValid);
};
