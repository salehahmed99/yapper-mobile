import { useNavigation } from '@/src/hooks/useNavigation';
import TweetSummary from '@/src/modules/tweets/components/TweetSummary';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

export default function TweetSummaryScreen() {
  const { goBack } = useNavigation();
  const params = useLocalSearchParams();
  const { t } = useTranslation();

  const tweetId = typeof params.tweetId === 'string' ? params.tweetId : undefined;

  if (!tweetId) {
    return (
      <View style={styles.errorContainer}>
        <Text>{t('tweetSummary.noTweetId')}</Text>
      </View>
    );
  }

  return <TweetSummary tweetId={tweetId} onBack={() => goBack()} />;
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
