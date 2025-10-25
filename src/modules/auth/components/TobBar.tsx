import { X } from 'lucide-react-native';
import { useMemo } from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Theme } from '../../../constants/theme';
import { useTheme } from '../../../context/ThemeContext';

interface ITopBarProps {
  onBackPress?: () => void;
}

const TopBar: React.FC<ITopBarProps> = ({ onBackPress }) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Exit/Close button on the left */}
        <TouchableOpacity style={styles.exitButton} onPress={onBackPress} activeOpacity={0.7}>
          <X color={theme.colors.text.primary} size={24} />
        </TouchableOpacity>

        {/* Centered X Logo */}
        <View style={styles.logoContainer}>
          <Image source={require('../../../../assets/images/x-new-logo.png')} style={styles.logo} />
        </View>
      </View>
    </SafeAreaView>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    safeArea: {
      backgroundColor: theme.colors.background.primary,
    },
    container: {
      width: '100%',
      height: 40,
      paddingHorizontal: 10,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.background.primary,
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
