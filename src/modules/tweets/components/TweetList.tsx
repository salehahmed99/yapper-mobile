import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { useMemo, useRef, useState } from 'react';
import { FlatList, StyleSheet, View, ViewToken } from 'react-native';
import TweetContainer from '../containers/TweetContainer';
import { ITweet } from '../types';

interface ITweetListProps {
  data: ITweet[];
}

const TweetList: React.FC<ITweetListProps> = (props) => {
  const { data } = props;
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [visibleTweetIds, setVisibleTweetIds] = useState<Set<string>>(new Set());

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    const visibleIds = new Set(
      viewableItems.filter((item) => item.isViewable).map((item) => (item.item as ITweet).tweet_id),
    );
    setVisibleTweetIds(visibleIds);
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50, // Item is considered visible when 50% is in view
    waitForInteraction: false,
  }).current;

  return (
    <FlatList
      data={data}
      renderItem={({ item }) => <TweetContainer tweet={item} isVisible={visibleTweetIds.has(item.tweet_id)} />}
      keyExtractor={(item) => {
        if (item.type === 'repost') {
          return item.tweet_id + item.reposted_by?.repost_id;
        } else {
          return item.tweet_id;
        }
      }}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      accessibilityLabel="tweet_list_feed"
      maintainVisibleContentPosition={{
        minIndexForVisible: 0,
        autoscrollToTopThreshold: 10,
      }}
      removeClippedSubviews={false}
      windowSize={10}
      maxToRenderPerBatch={10}
      initialNumToRender={10}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
      persistentScrollbar
    />
  );
};

export default TweetList;

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    separator: {
      height: 1,
      backgroundColor: theme.colors.border,
    },
  });
