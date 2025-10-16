import { StyleSheet } from "react-native";

const headerStyles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  banner: {
    width: "100%",
    height: 160,
    backgroundColor: "#1F1F1F",
    position: "relative",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: "#fff",
    marginTop: -20,
    zIndex: 5,
  },
  imageContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    alignItems: "flex-start",
    zIndex: 5,
  },
  editButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#4C9EEB",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 12,
  },
  backButton: {
    backgroundColor: "rgba(0,0,0,0.65)",
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 45,
    left: 20,
  },
  editText: { color: "#4C9EEB", fontWeight: "600" },
  info: { paddingHorizontal: 16, marginTop: 10 },
  name: { fontSize: 20, fontWeight: "700", color: "#000" },
  handle: { color: "#555", marginBottom: 8 },
  bio: { fontSize: 14, color: "#333", marginBottom: 4 },
  link: { fontSize: 12, color: "#1d9bf0", marginBottom: 8 },
  stats: { flexDirection: "row" },
  stat: { fontSize: 14, color: "#333" },
  bold: { fontWeight: "700" },
});

export default headerStyles;