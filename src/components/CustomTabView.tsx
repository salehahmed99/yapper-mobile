import React, { useState } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import type {
    NavigationState,
    SceneRendererProps,
} from "react-native-tab-view";
import { TabBar, TabView } from "react-native-tab-view";

type RouteType = { key: string; title: string };

export interface TabConfig {
  key: string;
  title: string;
  component: React.ComponentType<any>;
}

interface CustomTabViewProps {
  tabs: TabConfig[];
  initialTab?: string;
  scrollEnabled?: boolean;
}

export default function CustomTabView({
  tabs,
  initialTab,
  scrollEnabled = false,
}: CustomTabViewProps) {
  const layout = useWindowDimensions();

  // Map tabs to routes
  const routes: RouteType[] = tabs.map((tab) => ({
    key: tab.key,
    title: tab.title,
  }));

  // Calculate initial index based on the parameter
  const getInitialIndex = () => {
    if (initialTab) {
      const tabIndex = routes.findIndex(
        (route) => route.key.toLowerCase() === initialTab.toLowerCase()
      );
      return tabIndex !== -1 ? tabIndex : 0;
    }
    return 0;
  };

  const [index, setIndex] = useState(getInitialIndex());

  // Dynamic scene renderer
  const renderScene = ({ route }: { route: RouteType }) => {
    const tab = tabs.find((t) => t.key === route.key);
    if (!tab) return null;
    const Component = tab.component;
    return <Component />;
  };

  const renderTabBar = (
    props: SceneRendererProps & { navigationState: NavigationState<RouteType> }
  ) => (
    <TabBar
      {...props}
      scrollEnabled={scrollEnabled}
      indicatorStyle={styles.activeUnderline}
      style={styles.tabBarContainer}
      tabStyle={styles.tab}
      activeColor={styles.activeTabText.color}
      inactiveColor={styles.inactiveTabText.color}
    />
  );

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{ width: layout.width }}
      renderTabBar={renderTabBar}
      style={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabBarContainer: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eff3f4",
    elevation: 0,
    shadowOpacity: 0,
  },
  tab: {},
  activeTabText: { color: "#1d9bf0" },
  inactiveTabText: { color: "#536471" },
  activeUnderline: {
    height: 4,
    borderRadius: 2,
    backgroundColor: "#1d9bf0",
  },
});
