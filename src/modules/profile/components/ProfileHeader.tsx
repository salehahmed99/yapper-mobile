import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ChevronLeft } from "lucide-react-native";
import { useState } from "react";
import {
  Image,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import headerStyles from "../styles/profile-header-styles";
import EditProfileModal from "./EditProfileModal";

export default function ProfileHeader() {
  const [editModalOpen, setEditModalOpen] = useState(false);


  const router = useRouter();
  const imageUri = "https://randomuser.me/api/portraits/men/1.jpg";
  const bannerUri = "https://picsum.photos/1200/400";

  return (
    <View style={headerStyles.container}>
      {/* Banner */}
      <TouchableOpacity
        activeOpacity={0.95}
      >
        <Image source={{ uri: bannerUri }} style={headerStyles.banner} />

        {/* Back Button */}
        <TouchableOpacity
          style={headerStyles.backButton}
          onPress={() => router.back()}
        >
          <ChevronLeft color="#fff" size={25} />
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Image and button Container */}
      <View style={headerStyles.imageContainer}>
        <TouchableOpacity
          activeOpacity={0.9}
        >
          <Image source={{ uri: imageUri }} style={headerStyles.avatar} />
        </TouchableOpacity>

        {/* Edit button */}
        <TouchableOpacity
          style={headerStyles.editButton}
          onPress={() => setEditModalOpen(true)}
        >
          <Text style={headerStyles.editText}>Edit profile</Text>
        </TouchableOpacity>
      </View>

      {/* Info */}
      <View style={headerStyles.info}>
        <Text style={headerStyles.name}>Pixsellz</Text>
        <Text style={headerStyles.handle}>@pixsellz</Text>
        <Text style={headerStyles.bio}>
          Digital Goodies Team - Web & Mobile UI/UX development; Graphics;
          Illustrations
        </Text>
        <Text style={headerStyles.link}>pixsellz.io • Joined September 2018</Text>

        {/* Stats */}
        <View style={headerStyles.stats}>
          <TouchableOpacity
            onPress={() => router.push("/(profile)/Lists?tab=following")}
          >
            <Text style={headerStyles.stat}>
              <Text style={headerStyles.bold}>217</Text> Following
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/(profile)/Lists?tab=followers")}
          >
            <Text style={[headerStyles.stat, { marginLeft: 10 }]}>
              <Text style={headerStyles.bold}>118</Text> Followers
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Edit Profile Modal */}
      <EditProfileModal
        visible={editModalOpen}
        onclose={() => setEditModalOpen(false)}
      />

      <StatusBar style="light" />
    </View>
  );
}

