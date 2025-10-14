import LoginScreen from "@/src/modules/auth/screens/login-screen";
import React from "react";
import { StyleSheet } from "react-native";

const HomeScreen = () => {
  return (
    <LoginScreen />
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
