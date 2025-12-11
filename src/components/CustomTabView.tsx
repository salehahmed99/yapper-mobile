import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Animated,
  I18nManager,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

interface RouteItem {
  key: string;
  title: string;
}

interface CustomTabViewProps {
  routes: RouteItem[];
  index?: number;
  onIndexChange?: (index: number) => void;
  scrollable?: boolean;
}

const CustomTabView: React.FC<CustomTabViewProps> = ({
  routes,
  index: propsIndex,
  onIndexChange,
  scrollable = true,
}) => {
  const layout = useWindowDimensions();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar' || I18nManager.isRTL;

  const [internalIndex, setInternalIndex] = React.useState(0);
  const index = propsIndex ?? internalIndex;
  const setIndex = (i: number) => {
    if (propsIndex === undefined) setInternalIndex(i);
    onIndexChange?.(i);
  };

  // measurements for each tab (x, width) (final indicator target)
  const [measures, setMeasures] = React.useState<Array<{ x: number; width: number } | null>>(
    Array(routes.length).fill(null),
  );
  // container measurements (used to compute text-centered indicator in non-scrollable mode)
  const [containerMeasures, setContainerMeasures] = React.useState<Array<{ x: number; width: number } | null>>(
    Array(routes.length).fill(null),
  );
  // measured width of the text content for each tab (nullable)
  const [textWidths, setTextWidths] = React.useState<Array<number | null>>(Array(routes.length).fill(null));

  // When in non-scrollable mode and we have both the container and the measured
  // text width, compute a final measure so the indicator wraps the text content
  React.useEffect(() => {
    if (scrollable) return;
    containerMeasures.forEach((cm, i) => {
      const tw = textWidths[i];
      if (cm && typeof tw === 'number') {
        const x = cm.x + Math.max(0, (cm.width - tw) / 2);
        setMeasures((prev) => {
          const next = prev.slice();
          next[i] = { x, width: tw };
          return next;
        });
      }
    });
  }, [containerMeasures, textWidths, scrollable]);
  const indicatorStart = React.useRef(new Animated.Value(0));
  const indicatorWidth = React.useRef(new Animated.Value(0));
  const scrollRef = React.useRef<ScrollView | null>(null);

  // animate indicator when index or measures change
  React.useEffect(() => {
    const m = measures[index];

    if (m) {
      // Use measured dimensions when available (covers both scrollable and non-scrollable)
      const indicatorPosition = isRTL ? layout.width - m.x - m.width : m.x;
      Animated.parallel([
        Animated.timing(indicatorStart.current, { toValue: indicatorPosition, duration: 200, useNativeDriver: false }),
        Animated.timing(indicatorWidth.current, { toValue: m.width, duration: 200, useNativeDriver: false }),
      ]).start();

      // if scrollable, ensure active tab is visible in scroll view: center it
      if (scrollable && scrollRef.current) {
        const containerWidth = layout.width;
        // In RTL, the scroll direction is reversed, so we calculate from the end
        const offset = Math.max(0, m.x + m.width / 2 - containerWidth / 2);
        try {
          scrollRef.current.scrollTo({ x: offset, animated: true });
        } catch {
          /* ignore */
        }
      }
    } else if (!scrollable) {
      // fallback: non-scrollable and no measures yet -> distribute equally
      const tabWidth = layout.width / routes.length;
      // Use index-based position - works for both LTR and RTL since we use 'start' positioning
      const indicatorX = index * tabWidth;
      Animated.parallel([
        Animated.timing(indicatorStart.current, { toValue: indicatorX, duration: 200, useNativeDriver: false }),
        Animated.timing(indicatorWidth.current, { toValue: tabWidth, duration: 200, useNativeDriver: false }),
      ]).start();
    }
  }, [index, measures, layout.width, scrollable, routes.length]);

  const renderTabBar = () => {
    if (scrollable) {
      return (
        <View style={styles.tabBarWrapper}>
          <ScrollView
            ref={(r: ScrollView | null) => {
              scrollRef.current = r;
            }}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabBarScrollable}
          >
            {routes.map((route, i) => {
              const opacity = index === i ? 1 : 0.4;

              return (
                <View
                  key={route.key ?? i}
                  style={styles.tabItemScrollable}
                  onLayout={(e) => {
                    const { x, width } = e.nativeEvent.layout;
                    setMeasures((prev) => {
                      const next = prev.slice();
                      next[i] = { x, width };
                      return next;
                    });
                    setContainerMeasures((prev) => {
                      const next = prev.slice();
                      next[i] = { x, width };
                      return next;
                    });
                  }}
                >
                  <TouchableOpacity
                    style={[styles.tabTouch, styles.tabTouchScrollable]}
                    onPress={() => setIndex(i)}
                    accessibilityLabel={`tab_${route.key}_button`}
                    testID={`tab_${route.key}_button`}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: index === i }}
                  >
                    <Animated.Text style={[styles.tabText, { opacity }]}>{route.title}</Animated.Text>
                  </TouchableOpacity>
                </View>
              );
            })}
            <Animated.View
              pointerEvents="none"
              style={[
                styles.indicator,
                isRTL
                  ? { right: indicatorStart.current, width: indicatorWidth.current }
                  : { left: indicatorStart.current, width: indicatorWidth.current },
              ]}
            />
          </ScrollView>
        </View>
      );
    }

    return (
      <View style={[styles.tabBarNonScrollable, { width: layout.width }]}>
        {routes.map((route, i) => {
          const opacity = index === i ? 1 : 0.4;
          return (
            <View
              key={route.key ?? i}
              style={[styles.tabItemNonScrollable, { height: theme.ui.tabViewHeight }]}
              onLayout={(e) => {
                const { x, width } = e.nativeEvent.layout;
                setContainerMeasures((prev) => {
                  const next = prev.slice();
                  next[i] = { x, width };
                  return next;
                });
              }}
            >
              <TouchableOpacity
                style={styles.tabTouch}
                onPress={() => setIndex(i)}
                accessibilityLabel={`tab_${route.key}_button`}
                testID={`tab_${route.key}_button`}
                accessibilityRole="tab"
                accessibilityState={{ selected: index === i }}
              >
                <Animated.Text
                  onLayout={(e) => {
                    const tw = e.nativeEvent.layout.width;
                    setTextWidths((prev) => {
                      const next = prev.slice();
                      next[i] = tw;
                      return next;
                    });
                  }}
                  style={[styles.tabText, { opacity }]}
                >
                  {route.title}
                </Animated.Text>
              </TouchableOpacity>
            </View>
          );
        })}
        <Animated.View
          pointerEvents="none"
          style={[styles.indicator, { left: indicatorStart.current, width: indicatorWidth.current }]}
        />
      </View>
    );
  };

  return <View style={styles.container}>{renderTabBar()}</View>;
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      width: '100%',
      overflow: 'hidden',
      height: theme.ui.tabViewHeight,
    },
    tabBar: {
      flexDirection: 'row',
      height: theme.ui.tabViewHeight,
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
    },
    tabBarScrollable: {
      flexDirection: 'row',
      height: theme.ui.tabViewHeight,
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      justifyContent: 'flex-start',
    },
    tabBarNonScrollable: {
      flexDirection: 'row',
      height: theme.ui.tabViewHeight,
      alignItems: 'center',
    },
    tabItem: {
      justifyContent: 'center',
      alignItems: 'center',
      minWidth: 88,
      paddingHorizontal: theme.spacing.sm,
    },
    // Scrollable tab item: let width wrap content
    tabItemScrollable: {
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'flex-start',
      flexShrink: 0,
      paddingHorizontal: 0,
      height: theme.ui.tabViewHeight,
    },
    tabTouchScrollable: {
      paddingHorizontal: theme.spacing.md,
    },
    tabBarWrapper: {
      width: '100%',
      position: 'relative',
    },
    tabText: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fonts.extraBold,
    },
    indicator: {
      position: 'absolute',
      bottom: 0,
      height: 2,
      backgroundColor: theme.colors.text.link,
      borderRadius: 1,
    },
    tabItemNonScrollable: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      height: theme.ui.tabViewHeight,
    },
    tabTouch: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
    },
  });

export default CustomTabView;
