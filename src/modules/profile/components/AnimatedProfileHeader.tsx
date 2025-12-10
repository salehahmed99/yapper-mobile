import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useMemo } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Theme } from '../../../constants/theme';
import { useTheme } from '../../../context/ThemeContext';

type AnimatedProfileHeaderProps = {
  username: string;
  bannerUri: string;
  scrollY: Animated.Value;
  headerHeight: number;
};

const WHITE = '#ffffff';
const TEXT_SHADOW_COLOR = 'rgba(0, 0, 0, 0.75)';

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    headerContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      overflow: 'hidden',
    },
    blurContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.xxxl + 5,
      paddingBottom: theme.spacing.md,
    },
    backButton: {
      backgroundColor: `rgba(0, 0, 0, ${theme.opacity.translucent - 0.5})`,
      width: theme.sizes.icon.lg + theme.spacing.xs * 1.5,
      height: theme.sizes.icon.lg + theme.spacing.xs * 1.5,
      borderRadius: (theme.sizes.icon.lg + theme.spacing.xs * 1.5) / 2,
      marginRight: theme.spacing.md,
      justifyContent: 'center',
      alignItems: 'center',
    },
    username: {
      fontSize: theme.typography.sizes.md,
      fontWeight: theme.typography.weights.bold,
      color: WHITE,
      flex: 1,
      textShadowColor: TEXT_SHADOW_COLOR,
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 3,
    },
    bannerBackground: {
      ...StyleSheet.absoluteFillObject,
    },
  });

export default function AnimatedProfileHeader({
  username,
  bannerUri,
  scrollY,
  headerHeight,
}: AnimatedProfileHeaderProps) {
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();

  const headerOpacity = scrollY.interpolate({
    inputRange: [200, 350],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const headerTranslateY = scrollY.interpolate({
    inputRange: [200, 350],
    outputRange: [-headerHeight, 0],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      style={[
        styles.headerContainer,
        {
          height: headerHeight,
          opacity: headerOpacity,
          transform: [{ translateY: headerTranslateY }],
        },
      ]}
      testID="animated_profile_header"
    >
      <Animated.Image
        source={{ uri: bannerUri }}
        style={styles.bannerBackground}
        blurRadius={30}
        testID="animated_profile_header_banner"
      />
      <BlurView intensity={20} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill}>
        <View style={styles.blurContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              }
            }}
            testID="animated_profile_header_back_button"
          >
            <ChevronLeft color="#fff" size={25} />
          </TouchableOpacity>
          <Text style={styles.username} numberOfLines={1} testID="animated_profile_header_username">
            {username}
          </Text>
        </View>
      </BlurView>
    </Animated.View>
  );
}
