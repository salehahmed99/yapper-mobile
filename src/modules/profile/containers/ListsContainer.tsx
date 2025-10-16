import { useLocalSearchParams } from "expo-router";
import React from "react";
import { View } from "react-native";
import ListsComponent from "../components/ListsComponent";
import containerStyles from "../styles/container-style";

export default function ListsContainer() {
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const tabValue = Array.isArray(tab) ? tab[0] : tab;

  return (
    <View style={containerStyles.container}>
      <ListsComponent initialTab={tabValue} />
    </View>
  );
}
