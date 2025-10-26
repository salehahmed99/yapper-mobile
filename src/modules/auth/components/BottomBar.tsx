import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Button from '../../../components/Button';
import type { Theme } from '../../../constants/theme';
import { useTheme } from '../../../context/ThemeContext';
import { ButtonOptions } from '../utils/enums';

interface IBottomBarProps {
  text: ButtonOptions;
  isNextEnabled?: boolean;
  onForgotPassword?: () => void;
  onNext?: () => void;
}

const BottomBar: React.FC<IBottomBarProps> = ({
  text = ButtonOptions.NEXT,
  isNextEnabled = false,
  onForgotPassword,
  onNext,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const forgotPasswordPress = () => {
    onForgotPassword?.();
  };

  const handleNextPress = () => {
    if (isNextEnabled) {
      onNext?.();
    }
  };
  return (
    <View style={styles.container}>
      {/* Thin off-white line above the bar */}
      <View style={styles.topBorder} />

      <View style={styles.content}>
        {/* Forgot Password button on the left */}
        <TouchableOpacity onPress={forgotPasswordPress} style={styles.forgotPasswordButton} activeOpacity={0.7}>
          <Text style={styles.forgotPasswordText}>{t('auth.login.forgotPassword')}</Text>
        </TouchableOpacity>

        {/* Next button on the right */}
        <Button
          text={t(`auth.login.buttons.${String(text).toLowerCase()}`)}
          isNextEnabled={isNextEnabled}
          onNext={handleNextPress}
        />
      </View>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      width: '100%',
      backgroundColor: theme.colors.background.primary,
    },
    topBorder: {
      width: '100%',
      height: 1,
      backgroundColor: theme.colors.border,
    },
    content: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    forgotPasswordButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: theme.colors.text.primary,
      borderRadius: 20,
      backgroundColor: theme.colors.background.primary,
    },
    forgotPasswordText: {
      color: theme.colors.text.primary,
      fontSize: 15,
      fontWeight: '400',
    },
  });

export default BottomBar;
