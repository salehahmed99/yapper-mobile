import TweetSummary from '@/src/modules/tweets/components/TweetSummary';
import { ITweet } from '@/src/modules/tweets/types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';

export default function TweetSummaryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  let tweet: ITweet | null = null;

  try {
    if (typeof params.tweet === 'string') {
      tweet = JSON.parse(params.tweet);
    }
  } catch (e) {
    console.error('Failed to parse tweet param', e);
  }

  if (!tweet) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Error loading tweet summary</Text>
      </View>
    );
  }

  return <TweetSummary tweet={tweet} onBack={() => router.back()} />;
}
