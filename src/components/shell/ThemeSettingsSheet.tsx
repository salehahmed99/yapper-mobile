import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import * as Haptics from 'expo-haptics';
import { Circle } from 'lucide-react-native';
import React from 'react';
import { Modal, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface IThemeSettingsSheetProps {
  visible: boolean;
  onClose: () => void;
}

const ThemeSettingsSheet: React.FC<IThemeSettingsSheetProps> = ({ visible, onClose }) => {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme);
  const insets = useSafeAreaInsets();
  const [darkMode, setDarkMode] = React.useState(isDark);
  const [useDeviceSettings, setUseDeviceSettings] = React.useState(false);
  const [selectedTheme, setSelectedTheme] = React.useState<'dim' | 'lights-out'>('lights-out');

  // Sync state with theme context when modal opens
  React.useEffect(() => {
    if (visible) {
      setDarkMode(isDark);
      // TODO: Sync useDeviceSettings and selectedTheme with actual theme context values when available
    }
  }, [visible, isDark]);

  const handleDarkModeToggle = (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDarkMode(value);
    // TODO: Implement theme switching logic
  };

  const handleDeviceSettingsToggle = (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setUseDeviceSettings(value);
    // TODO: Implement device settings sync logic
  };

  const handleThemeSelect = (value: 'dim' | 'lights-out') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTheme(value);
    // TODO: Implement theme variant switching logic
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
              <Text style={styles.switchLabel}>Dark mode</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={handleDarkModeToggle}
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

          {/* Divider */}
          <View style={styles.divider} />

          {/* Theme Section */}
          <Text style={styles.sectionTitle}>Theme</Text>

          {/* Dim Option */}
          <TouchableOpacity
            style={styles.radioRow}
            onPress={() => handleThemeSelect('dim')}
            accessibilityLabel="theme_settings_dim_option"
            testID="theme_settings_dim_option"
            accessibilityRole="radio"
            accessibilityState={{ selected: selectedTheme === 'dim' }}
          >
            <Text style={styles.radioLabel}>Dim</Text>
            <View style={styles.radioButton}>
              {selectedTheme === 'dim' ? (
                <View style={styles.radioButtonSelected} />
              ) : (
                <Circle color={theme.colors.border} size={20} strokeWidth={2} />
              )}
            </View>
          </TouchableOpacity>

          {/* Lights Out Option */}
          <TouchableOpacity
            style={styles.radioRow}
            onPress={() => handleThemeSelect('lights-out')}
            accessibilityLabel="theme_settings_lights_out_option"
            testID="theme_settings_lights_out_option"
            accessibilityRole="radio"
            accessibilityState={{ selected: selectedTheme === 'lights-out' }}
          >
            <Text style={styles.radioLabel}>Lights out</Text>
            <View style={styles.radioButton}>
              {selectedTheme === 'lights-out' ? (
                <View style={styles.radioButtonSelected} />
              ) : (
                <Circle color={theme.colors.border} size={20} strokeWidth={2} />
              )}
            </View>
          </TouchableOpacity>
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
    divider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginVertical: theme.spacing.md,
    },
    sectionTitle: {
      fontSize: theme.typography.sizes.xl,
      fontFamily: theme.typography.fonts.bold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
    },
    radioRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
    },
    radioLabel: {
      fontSize: theme.typography.sizes.md,
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fonts.medium,
    },
    radioButton: {
      width: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    radioButtonSelected: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: theme.colors.accent.bookmark,
      borderWidth: 6,
      borderColor: theme.colors.background.primary,
      shadowColor: theme.colors.accent.bookmark,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 0,
    },
  });

export default ThemeSettingsSheet;
