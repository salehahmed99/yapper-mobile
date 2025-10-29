import { X } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { Image, StyleSheet, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Theme } from '../../../../constants/theme';
import { useTheme } from '../../../../context/ThemeContext';

interface ITopBarProps {
  onBackPress?: () => void;
}

const TopBar: React.FC<ITopBarProps> = ({ onBackPress }) => {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();

  // Responsive scaling — adjusts smoothly based on screen width
  const scaleFactor = Math.min(Math.max(width / 390, 0.85), 1.1);

  const styles = useMemo(() => createStyles(theme, scaleFactor), [theme, scaleFactor]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Exit/Close button on the left */}
        <TouchableOpacity
          style={styles.exitButton}
          onPress={onBackPress}
          activeOpacity={0.7}
          accessibilityLabel="TopBar_Exit_Button"
        >
          <X color={theme.colors.text.primary} size={24 * scaleFactor} />
        </TouchableOpacity>

        {/* Centered X Logo */}
        <View style={styles.logoContainer}>
          <Image source={require('../../../../../assets/images/yapper.png')} style={styles.logo} resizeMode="contain" />
        </View>
      </View>
    </SafeAreaView>
  );
};

const createStyles = (theme: Theme, scaleFactor: number) =>
  StyleSheet.create({
    safeArea: {
      backgroundColor: theme.colors.background.primary,
    },
    container: {
      width: '100%',
      height: 48 * scaleFactor,
      paddingHorizontal: theme.spacing.md * scaleFactor,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.background.primary,
    },
    exitButton: {
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.sm * scaleFactor,
    },
    logoContainer: {
      position: 'absolute',
      left: 0,
      right: 0,
      alignItems: 'center',
      justifyContent: 'center',
    },
    logo: {
      width: 90 * scaleFactor,
      height: 90 * scaleFactor,
    },
  });

export default TopBar;
