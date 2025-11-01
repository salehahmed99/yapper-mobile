import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { useMemo } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import TweetContainer from '../containers/TweetContainer';
import { ITweet } from '../types';

interface ITweetListProps {
  data: ITweet[];
}
const TweetList: React.FC<ITweetListProps> = (props) => {
  const { data } = props;
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <FlatList
      data={data}
      renderItem={({ item }) => <TweetContainer tweet={item} />}
      keyExtractor={(item) => {
        if (item.type === 'repost') {
          return item.tweet_id + item.reposted_by?.repost_id;
        } else {
          return item.tweet_id;
        }
      }}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      accessibilityLabel="tweet_list_feed"
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
