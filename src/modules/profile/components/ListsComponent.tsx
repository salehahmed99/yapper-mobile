import { StatusBar } from "expo-status-bar";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import CustomTabView, { TabConfig } from "../../../components/CustomTabView";

const FollowingRoute = () => (
  <View style={styles.page}>
    <Text style={styles.placeholderText}>
      Following List will be shown here.
    </Text>
  </View>
);

const FollowersRoute = () => (
  <View style={styles.page}>
    <Text style={styles.placeholderText}>
      Followers List will be shown here.
    </Text>
  </View>
);

interface ListsComponentProps {
  initialTab?: string;
}

export default function ListsComponent({ initialTab }: ListsComponentProps) {
  const tabs: TabConfig[] = [
    { key: "Following", title: "Following", component: FollowingRoute },
    { key: "Followers", title: "Followers", component: FollowersRoute },
  ];

  return (
    <>
      <CustomTabView tabs={tabs} initialTab={initialTab} />
      <StatusBar style="dark" />
    </>
  );
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
