import React, { createContext, useCallback, useContext, useState } from 'react';
import { Animated } from 'react-native';

interface IUiShellContextValue {
  isSideMenuOpen: boolean;
  openSideMenu: () => void;
  closeSideMenu: () => void;
  toggleSideMenu: () => void;
  activeTab: string;
  setActiveTab: (key: string) => void;
  scrollY: Animated.Value;
  appBarVisible: boolean;
  setAppBarVisible: (v: boolean) => void;
  toggleAppBar: () => void;
}

const UiShellContext = createContext<IUiShellContextValue | undefined>(undefined);

export const UiShellProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSideMenuOpen, setSideMenuOpen] = useState(false);
  const [activeTab, setActiveTabState] = useState('home');
  const [appBarVisible, setAppBarVisible] = useState(true);
  const scrollY = React.useRef(new Animated.Value(0)).current;

  const openSideMenu = useCallback(() => setSideMenuOpen(true), []);
  const closeSideMenu = useCallback(() => setSideMenuOpen(false), []);
  const toggleSideMenu = useCallback(() => setSideMenuOpen((v) => !v), []);
  const toggleAppBar = useCallback(() => setAppBarVisible((v) => !v), []);
  const setActiveTab = useCallback((key: string) => setActiveTabState(key), []);

  return (
    <UiShellContext.Provider
      value={{
        isSideMenuOpen,
        openSideMenu,
        closeSideMenu,
        toggleSideMenu,
        activeTab,
        setActiveTab,
        scrollY,
        appBarVisible,
        setAppBarVisible,
        toggleAppBar,
      }}
    >
      {children}
    </UiShellContext.Provider>
  );
};

export const useUiShell = (): IUiShellContextValue => {
  const ctx = useContext(UiShellContext);
  if (!ctx) throw new Error('useUiShell must be used within UiShellProvider');
  return ctx;
};

export default UiShellContext;
