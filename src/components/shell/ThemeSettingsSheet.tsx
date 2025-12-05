import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Modal, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface IThemeSettingsSheetProps {
  visible: boolean;
  onClose: () => void;
}

const ThemeSettingsSheet: React.FC<IThemeSettingsSheetProps> = ({ visible, onClose }) => {
  const {
    theme,
    isDark,
    useDeviceSettings: contextUseDeviceSettings,
    setThemeMode,
    setUseDeviceSettings: contextSetUseDeviceSettings,
  } = useTheme();
  const styles = createStyles(theme);
  const insets = useSafeAreaInsets();
  const [darkMode, setDarkMode] = React.useState(isDark);
  const [useDeviceSettings, setUseDeviceSettings] = React.useState(contextUseDeviceSettings);

  // Sync state with theme context when modal opens
  React.useEffect(() => {
    if (visible) {
      setDarkMode(isDark);
      setUseDeviceSettings(contextUseDeviceSettings);
    }
  }, [visible, isDark, contextUseDeviceSettings]);

  const handleDarkModeToggle = async (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDarkMode(value);
    setThemeMode(value);
  };

  const handleDeviceSettingsToggle = async (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setUseDeviceSettings(value);
    contextSetUseDeviceSettings(value);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
        accessibilityLabel="theme_settings_backdrop"
        testID="theme_settings_backdrop"
      >
        <TouchableOpacity activeOpacity={1} style={[styles.sheet, { paddingBottom: insets.bottom + theme.spacing.lg }]}>
          <View style={styles.handle} />
          <Text style={styles.title}>Dark Mode</Text>

          {/* Dark Mode Switch */}
          <View style={styles.switchRow}>
            <View style={styles.switchTextContainer}>
              <Text style={styles.switchLabel}>Dark </Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={handleDarkModeToggle}
              disabled={useDeviceSettings}
              trackColor={{ false: theme.colors.border, true: theme.colors.accent.bookmark }}
              thumbColor={theme.colors.background.primary}
              accessibilityLabel="theme_settings_dark_mode_switch"
              testID="theme_settings_dark_mode_switch"
            />
          </View>

          {/* Use Device Settings Switch */}
          <View style={styles.switchRow}>
            <View style={styles.switchTextContainer}>
              <Text style={styles.switchLabel}>Use device settings</Text>
              <Text style={styles.switchSubtitle}>
                Set Dark mode to use the Light or Dark selection located in your device Display & Brightness settings.
              </Text>
            </View>
            <Switch
              value={useDeviceSettings}
              onValueChange={handleDeviceSettingsToggle}
              trackColor={{ false: theme.colors.border, true: theme.colors.accent.bookmark }}
              thumbColor={theme.colors.background.primary}
              accessibilityLabel="theme_settings_device_settings_switch"
              testID="theme_settings_device_settings_switch"
            />
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'transparent',
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: theme.colors.background.primary,
      borderTopLeftRadius: theme.borderRadius.xl,
      borderTopRightRadius: theme.borderRadius.xl,
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.md,
    },
    handle: {
      width: 40,
      height: 4,
      backgroundColor: theme.colors.border,
      borderRadius: theme.borderRadius.full,
      alignSelf: 'center',
      marginBottom: theme.spacing.lg,
    },
    title: {
      fontSize: theme.typography.sizes.xl,
      fontFamily: theme.typography.fonts.semiBold,
      color: theme.colors.text.primary,
      textAlign: 'center',
      marginBottom: theme.spacing.lg,
    },
    switchRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
      gap: theme.spacing.md,
    },
    switchTextContainer: {
      flex: 1,
    },
    switchLabel: {
      fontSize: theme.typography.sizes.md,
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fonts.medium,
      marginBottom: theme.spacing.xxs,
    },
    switchSubtitle: {
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.text.secondary,
      lineHeight: theme.typography.sizes.sm * theme.typography.lineHeights.relaxed,
    },
  });

export default ThemeSettingsSheet;
