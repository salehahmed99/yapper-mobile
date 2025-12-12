import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { FlashList } from '@shopify/flash-list';
import { useMemo, useRef } from 'react';
import { ActivityIndicator, RefreshControl, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import NotificationContainer from '../containers/NotificationContainer';
import { INotification } from '../types';

interface INotificationsListProps {
  data: INotification[];
  onRefresh?: () => void;
  refreshing?: boolean;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  isLoading?: boolean;
  isFetchingNextPage?: boolean;
  topSpacing?: number;
  bottomSpacing?: number;
  isTabActive?: boolean;
  useCustomRefreshIndicator?: boolean;
}
const NotificationsList: React.FC<INotificationsListProps> = (props) => {
  const {
    data,
    onRefresh,
    refreshing,
    onEndReached,
    onEndReachedThreshold,
    isLoading,
    isFetchingNextPage,
    topSpacing = 0,
    bottomSpacing = 0,
    useCustomRefreshIndicator = false,
  } = props;
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 90, // Item is considered visible when 90% is in view
    waitForInteraction: false,
  }).current;

  const renderHeader = () => {
    return (
      <View>
        {topSpacing > 0 && <View style={{ height: topSpacing }} />}
        {useCustomRefreshIndicator && refreshing && (
          <View style={styles.customRefreshContainer}>
            <ActivityIndicator color={theme.colors.text.primary} />
          </View>
        )}
      </View>
    );
  };

  const renderFooter = () => {
    return (
      <View>
        {isFetchingNextPage && (
          <View style={styles.loadingFooter}>
            <ActivityIndicator size="small" color={theme.colors.text.primary} />
          </View>
        )}
        {bottomSpacing > 0 && <View style={{ height: bottomSpacing }} />}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.text.primary} />
      </View>
    );
  }

  return (
    <FlashList
      style={{ flex: 1 }}
      data={data}
      renderItem={({ item }) => <NotificationContainer notification={item} />}
      keyExtractor={(item) => item.id}
      scrollIndicatorInsets={{ top: topSpacing - insets.top, bottom: bottomSpacing - insets.bottom }}
      refreshControl={
        <RefreshControl
          key={'refresh-' + topSpacing}
          refreshing={refreshing ?? false}
          onRefresh={onRefresh}
          tintColor={useCustomRefreshIndicator ? 'transparent' : theme.colors.text.primary}
          colors={useCustomRefreshIndicator ? ['transparent'] : [theme.colors.text.primary]}
          progressViewOffset={topSpacing}
        />
      }
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      accessibilityLabel="notifications_list_feed"
      testID="notifications_list_feed"
      ListHeaderComponent={renderHeader}
      ListFooterComponent={renderFooter}
      onEndReached={onEndReached}
      onEndReachedThreshold={onEndReachedThreshold ?? 0.5}
      removeClippedSubviews={false}
      viewabilityConfig={viewabilityConfig}
    />
  );
};

export default NotificationsList;

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    separator: {
      height: 1,
      backgroundColor: theme.colors.border,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingFooter: {
      paddingVertical: 20,
      alignItems: 'center',
    },
    customRefreshContainer: {
      marginTop: -35,
      paddingBottom: 10,
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
    },
  });
