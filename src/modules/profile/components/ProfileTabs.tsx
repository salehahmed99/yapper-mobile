import React from "react";
import { StyleSheet, Text, View } from "react-native";
import CustomTabView, { TabConfig } from "../../../components/CustomTabView";

const PostsRoute = () => (
  <View style={styles.page}>
    <Text style={styles.placeholderText}>Tweets will be shown here.</Text>
  </View>
);

const RepliesRoute = () => (
  <View style={styles.page}>
    <Text style={styles.placeholderText}>Replies will be shown here.</Text>
  </View>
);

const MediaRoute = () => (
  <View style={styles.page}>
    <Text style={styles.placeholderText}>Media will be shown here.</Text>
  </View>
);

const LikesRoute = () => (
  <View style={styles.page}>
    <Text style={styles.placeholderText}>Likes will be shown here.</Text>
  </View>
);

export default function ProfileTabs() {
  const tabs: TabConfig[] = [
    { key: "tweets", title: "Tweets", component: PostsRoute },
    { key: "tweetsReplies", title: "Tweets & Replies", component: RepliesRoute },
    { key: "media", title: "Media", component: MediaRoute },
    { key: "likes", title: "Likes", component: LikesRoute },
  ];

  return <CustomTabView tabs={tabs} scrollEnabled={true} />;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#fff" },
  placeholderText: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
    color: "#536471",
  },
});
