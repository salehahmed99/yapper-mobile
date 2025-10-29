import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { Slot } from 'expo-router';
import React from 'react';
import { Animated, Dimensions, Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import BottomNavigation from './BottomNavigation';
import SideMenu, { drawerWidth } from './SideMenu';
import { UiShellProvider, useUiShell } from './UiShellContext';

const AppShell: React.FC = () => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [anim] = React.useState(() => new Animated.Value(0));
  return (
    <UiShellProvider>
      <View style={styles.container}>
        <SlidingShell styles={styles} anim={anim} />
        <SideMenu anim={anim} />
        <BottomNavigation anim={anim} />
      </View>
    </UiShellProvider>
  );
};

type AppShellStyles = {
  container: ViewStyle;
  content: ViewStyle;
};

const createStyles = (theme: Theme): AppShellStyles =>
  StyleSheet.create<AppShellStyles>({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    content: {
      flex: 1,
    },
  });

interface ISlidingShellProps {
  styles: AppShellStyles;
  anim: Animated.Value;
}

const SlidingShell: React.FC<ISlidingShellProps> = React.memo(function SlidingShell(props) {
  const { styles, anim } = props;
  const { isSideMenuOpen } = useUiShell();
  React.useEffect(() => {
    Animated.timing(anim, {
      toValue: isSideMenuOpen ? drawerWidth : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [isSideMenuOpen, anim]);
  const screenWidth = Dimensions.get('window').width;
  const { closeSideMenu } = useUiShell();
  // Animate overlay opacity and width with drawer
  const overlayOpacity = anim.interpolate({
    inputRange: [0, drawerWidth],
    outputRange: [0, 0.4],
    extrapolate: 'clamp',
  });
  const overlayWidth = anim.interpolate({
    inputRange: [0, drawerWidth],
    outputRange: [0, screenWidth - drawerWidth],
    extrapolate: 'clamp',
  });
  return (
    <>
      <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ translateX: anim }], zIndex: 10 }]}>
        <View style={styles.content}>
          <Slot />
        </View>
      </Animated.View>
      {/* Animated overlay*/}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            left: drawerWidth,
            width: overlayWidth,
            backgroundColor: 'transparent',
            opacity: overlayOpacity,
            zIndex: 20,
          },
        ]}
        pointerEvents={isSideMenuOpen ? 'auto' : 'none'}
      >
        <Pressable
          style={{ flex: 1 }}
          onPress={() => {
            Animated.timing(anim, {
              toValue: 0,
              duration: 200,
              useNativeDriver: false,
            }).start(() => closeSideMenu());
          }}
        />
      </Animated.View>
    </>
  );
});
export default React.memo(AppShell);
