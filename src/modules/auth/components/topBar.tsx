import { View, TouchableOpacity, Image,StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';

interface ITopBarProps {
  onBackPress?: () => void;
}

const TopBar: React.FC<ITopBarProps> = ({ onBackPress }) => {
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

const topBarStyles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#000',
  },
  container: {
    width: '100%',
    height: 40,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  exitButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 40,
    height: 40,
  },
});
export default TopBar;
