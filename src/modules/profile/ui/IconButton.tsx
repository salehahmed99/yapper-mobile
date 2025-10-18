import React from "react";
import { StyleSheet, TouchableOpacity, ViewStyle } from "react-native";

type Props = {
  onPress?: () => void;
  style?: ViewStyle;
  children?: React.ReactNode;
};

export default function IconButton({ onPress, style, children }: Props) {
  return (
    <TouchableOpacity style={[styles.wrapper, style]} onPress={onPress}>
      {children}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
});
