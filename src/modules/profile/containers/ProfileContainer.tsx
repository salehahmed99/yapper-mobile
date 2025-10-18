import { View } from "react-native";
import { useTheme } from "../../../context/ThemeContext";
import ProfileHeader from "../components/ProfileHeader";
import ProfileTabs from "../components/ProfileTabs";
import { createContainerStyles } from "../styles/container-style";

export default function ProfileContainer() {
  const { theme } = useTheme();
  const containerStyles = createContainerStyles(theme);

  return (
    <View style={containerStyles.container}>
      <ProfileHeader />
      <ProfileTabs />
    </View>
  );
}