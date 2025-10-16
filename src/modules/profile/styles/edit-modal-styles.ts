import { Platform, StyleSheet } from "react-native";

const editModalStyles = StyleSheet.create({
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  buttonsText: {
    fontSize: 18,
    fontWeight: "500",
  },
  titleText: {
    fontSize: 20,
    fontWeight: "900",
  },
  contentContainer: {
    flex: 1,
  },
  insideContainer: {
    paddingHorizontal: 20,
  },
  avatarContainer: {
    alignSelf: "flex-start",
    position: "relative",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: "#fff",
    marginTop: -25,
  },
  overlay: {
    position: "absolute",
    top: -20,
    left: 5,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  userDetailsContainer: {
    marginTop: 20,
    flexDirection: "column",
  },
  inputContainer: {
    borderTopColor: "#ccc",
    borderTopWidth: 0.5,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
    width: 80,
    alignSelf: Platform.OS === "ios" ? "flex-start" : "center",
  },
  input: {
    color: "#1d9bf0",
    fontWeight: "600",
    fontSize: 15,
  },
  banner: {
    width: "100%",
    height: 160,
    backgroundColor: "#1F1F1F",
    position: "relative",
  },
});

export default editModalStyles;