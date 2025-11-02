import type { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { X } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { Image, StyleSheet, TouchableOpacity, View, useWindowDimensions } from 'react-native';

interface ITopBarProps {
  onBackPress?: () => void;
}

const TopBar: React.FC<ITopBarProps> = ({ onBackPress }) => {
  const { theme, isDark } = useTheme();
  const { width, height } = useWindowDimensions();

  const scaleWidth = Math.min(Math.max(width / 390, 0.85), 1.1);
  const scaleHeight = Math.min(Math.max(height / 844, 0.85), 1.1);
  const scaleFonts = Math.min(scaleWidth, scaleHeight);

  const styles = useMemo(() => createStyles(theme, scaleWidth, scaleHeight), [theme, scaleWidth, scaleHeight]);

  return (
    <View style={styles.container}>
      {/* Exit/Close button on the left */}
      <TouchableOpacity
        style={styles.exitButton}
        onPress={onBackPress}
        activeOpacity={0.7}
        accessibilityLabel="TopBar_Exit_Button"
      >
        <X color={theme.colors.text.primary} size={24 * scaleFonts} />
      </TouchableOpacity>

      {/* Centered X Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={isDark ? require('@/assets/images/Yapper-Black.png') : require('@/assets/images/Yapper-White.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
    </View>
  );
};

const createStyles = (theme: Theme, scaleWidth: number = 1, scaleHeight: number = 1) =>
  StyleSheet.create({
    container: {
      width: '100%',
      height: 48 * scaleHeight,
      paddingHorizontal: theme.spacing.md * scaleWidth,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.background.primary,
    },
    exitButton: {
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.sm * scaleWidth,
      paddingVertical: theme.spacing.sm * scaleHeight,
    },
    logoContainer: {
      position: 'absolute',
      left: 0,
      right: 0,
      alignItems: 'center',
      justifyContent: 'center',
    },
    logo: {
      width: 25 * scaleWidth,
      height: 25 * scaleHeight,
    },
  });

export default TopBar;
