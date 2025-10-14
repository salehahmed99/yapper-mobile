import { View, TouchableOpacity, Image } from 'react-native';
import tobBarStyles from '../styles/tob-bar-styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';

interface TopBarProps {
  onBackPress?: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onBackPress }) => {
  return (
    <SafeAreaView style={tobBarStyles.safeArea}>
      <View style={tobBarStyles.container}>
        {/* Exit/Close button on the left */}
        <TouchableOpacity style={tobBarStyles.exitButton} onPress={onBackPress} activeOpacity={0.7}>
          <X color="white" size={24} />
        </TouchableOpacity>

        {/* Centered X Logo */}
        <View style={tobBarStyles.logoContainer}>
          <Image
            source={require('../../../../assets/images/x-new-logo.png')}
            style={tobBarStyles.logo}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};
export default TopBar;
