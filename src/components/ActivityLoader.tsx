import React, { useMemo } from 'react';
import { Modal, View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { Theme } from '@/src/constants/theme';

interface IActivityLoaderProps {
  visible: boolean;
  message?: string;
}

const ActivityLoader: React.FC<IActivityLoaderProps> = ({ visible, message = 'Loading...' }) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.overlay}>
        <View>
          <ActivityIndicator size="large" color={theme.colors.text.link} />
          <Text style={styles.message}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    message: {
      marginTop: theme.spacing.md,
      fontSize: theme.typography.sizes.md,
      fontFamily: theme.typography.fonts.medium,
      color: theme.colors.text.primary,
      textAlign: 'center',
    },
  });

export default ActivityLoader;
