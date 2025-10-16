import { View } from "react-native";
import ProfileHeader from "../components/ProfileHeader";
import ProfileTabs from "../components/ProfileTabs";
import containerStyles from "../styles/container-style";

export default function ProfileContainer() {
  return (
    <View style={containerStyles.container}>
      <ProfileHeader />
      <ProfileTabs />
    </View>
  );
}