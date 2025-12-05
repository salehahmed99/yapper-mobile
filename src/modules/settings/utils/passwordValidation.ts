import { PASSWORD_RULES } from '@/src/modules/settings/types/schemas';
import i18n from '@/src/i18n';

export const validatePassword = (password: string) => {
  return PASSWORD_RULES.map((rule) => {
    const t = i18n.t.bind(i18n);
    return {
      ...rule,
      text: t(`settings.password.validation_${rule.key}`),
      isValid: rule.test(password),
    };
  });
};

export const isPasswordValid = (password: string): boolean => {
  return validatePassword(password).every((rule) => rule.isValid);
};
