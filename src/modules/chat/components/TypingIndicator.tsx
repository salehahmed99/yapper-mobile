import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

export default function TypingIndicator() {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const dot1Anim = useRef(new Animated.Value(0)).current;
  const dot2Anim = useRef(new Animated.Value(0)).current;
  const dot3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateDot = (animValue: Animated.Value) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(animValue, {
            toValue: -6,
            duration: 300,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 300,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
        ]),
      );
    };

    const anim1 = animateDot(dot1Anim);
    const anim2 = animateDot(dot2Anim);
    const anim3 = animateDot(dot3Anim);

    // Start each animation with a staggered delay
    anim1.start();
    setTimeout(() => anim2.start(), 150);
    setTimeout(() => anim3.start(), 300);

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, [dot1Anim, dot2Anim, dot3Anim]);

  return (
    <View style={styles.container} testID="typing_indicator_container">
      <View style={styles.bubble} testID="typing_indicator_bubble">
        <View style={styles.dotsContainer}>
          <Animated.View style={[styles.dot, { transform: [{ translateY: dot1Anim }] }]} />
          <Animated.View style={[styles.dot, { transform: [{ translateY: dot2Anim }] }]} />
          <Animated.View style={[styles.dot, { transform: [{ translateY: dot3Anim }] }]} />
        </View>
      </View>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.xs,
      alignItems: 'flex-start',
    },
    bubble: {
      backgroundColor: theme.colors.background.secondary,
      borderRadius: theme.borderRadius.xl,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
    },
    dotsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      height: 20,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.text.secondary,
    },
  });
