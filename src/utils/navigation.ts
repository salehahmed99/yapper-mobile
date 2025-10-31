import { Href, Router } from 'expo-router';

export type TweetActivityType = 'likers' | 'retweeters' | 'quotes';

export const navigateToTweetActivity = (router: Router, tweetId: string, type: TweetActivityType) => {
  const path = `/(protected)/tweets/${tweetId}/${type}` as Href;
  router.push(path);
};
