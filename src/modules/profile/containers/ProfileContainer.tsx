import { View } from "react-native";
import ProfileHeader from "../components/ProfileHeader";
import containerStyles from "../styles/container-style";

export default function ProfileContainer() {
  return (
    <View style={containerStyles.container}>
      <ProfileHeader />
    </View>
  );
}