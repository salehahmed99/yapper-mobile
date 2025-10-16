import { View, TouchableOpacity, Image } from 'react-native';
import topBarStyles from '../styles/topBarStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';

interface TopBarProps {
  onBackPress?: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onBackPress }) => {
  return (
    <SafeAreaView style={topBarStyles.safeArea}>
      <View style={topBarStyles.container}>
        {/* Exit/Close button on the left */}
        <TouchableOpacity style={topBarStyles.exitButton} onPress={onBackPress} activeOpacity={0.7}>
          <X color="white" size={24} />
        </TouchableOpacity>

        {/* Centered X Logo */}
        <View style={topBarStyles.logoContainer}>
          <Image
            source={require('../../../../assets/images/x-new-logo.png')}
            style={topBarStyles.logo}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};
export default TopBar;
