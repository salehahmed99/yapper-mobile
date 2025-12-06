import TweetSummary from '@/src/modules/tweets/components/TweetSummary';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

export default function TweetSummaryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { t } = useTranslation();

  const tweetId = typeof params.tweetId === 'string' ? params.tweetId : undefined;

  if (!tweetId) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>{t('tweetSummary.noTweetId')}</Text>
      </View>
    );
  }

  return <TweetSummary tweetId={tweetId} onBack={() => router.back()} />;
}
