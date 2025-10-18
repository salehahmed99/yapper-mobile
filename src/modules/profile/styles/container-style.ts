import { StyleSheet } from "react-native";
import { Theme } from "../../../constants/theme";

export const createContainerStyles = (theme: Theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background.primary },
  });

// Keep backward compatibility with default export
const containerStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
});

export default containerStyles;
