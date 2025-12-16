import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

import {
  avatarSizes,
  borderRadius,
  borderWidth,
  buttonHeights,
  colors,
  iconSizes,
  iconSizesAlt,
  opacity,
  shadows,
  sizes,
  spacing,
  Theme,
  typography,
  ui,
} from '../constants/theme';

const THEME_STORAGE_KEY = 'app-theme-mode';
const USE_DEVICE_SETTINGS_KEY = 'app-use-device-theme';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  useDeviceSettings: boolean;
  toggleTheme: () => Promise<void>;
  setThemeMode: (dark: boolean) => Promise<void>;
  setUseDeviceSettings: (use: boolean) => Promise<void>;
}
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface IThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<IThemeProviderProps> = (props) => {
  const { children } = props;
  const systemColorScheme = useColorScheme() || 'dark';
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');
  const [useDeviceSettings, setUseDeviceSettingsState] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load theme preferences on mount
  useEffect(() => {
    const loadThemePreferences = async () => {
      try {
        const [savedTheme, savedUseDevice] = await Promise.all([
          AsyncStorage.getItem(THEME_STORAGE_KEY),
          AsyncStorage.getItem(USE_DEVICE_SETTINGS_KEY),
        ]);

        const useDevice = savedUseDevice !== null ? savedUseDevice === 'true' : true;
        setUseDeviceSettingsState(useDevice);

        if (useDevice) {
          setIsDark(systemColorScheme === 'dark');
        } else if (savedTheme !== null) {
          setIsDark(savedTheme === 'dark');
        }

        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to load theme preferences:', error);
        setIsInitialized(true);
      }
    };

    loadThemePreferences();
  }, [systemColorScheme]);

  // Sync with system theme when device settings is enabled
  useEffect(() => {
    if (isInitialized && useDeviceSettings) {
      setIsDark(systemColorScheme === 'dark');
    }
  }, [systemColorScheme, useDeviceSettings, isInitialized]);

  const toggleTheme = async () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newIsDark ? 'dark' : 'light');
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  const setThemeMode = async (dark: boolean) => {
    setIsDark(dark);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, dark ? 'dark' : 'light');
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  const setUseDeviceSettings = async (use: boolean) => {
    setUseDeviceSettingsState(use);
    try {
      await AsyncStorage.setItem(USE_DEVICE_SETTINGS_KEY, use.toString());
      if (use) {
        // When enabling device settings, sync with system immediately
        setIsDark(systemColorScheme === 'dark');
        await AsyncStorage.setItem(THEME_STORAGE_KEY, systemColorScheme === 'dark' ? 'dark' : 'light');
      }
    } catch (error) {
      console.error('Failed to save device settings preference:', error);
    }
  };

  const theme = {
    colors: isDark ? colors.dark : colors.light,
    typography,
    spacing,
    borderRadius,
    ui,
    iconSizes,
    borderWidth,
    avatarSizes,
    buttonHeights,
    shadows,
    opacity,
    sizes,
    iconSizesAlt,
  };

  return (
    <ThemeContext.Provider
      value={{ theme, isDark, useDeviceSettings, toggleTheme, setThemeMode, setUseDeviceSettings }}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
