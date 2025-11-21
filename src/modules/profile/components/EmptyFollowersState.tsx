import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Theme } from '../../../constants/theme';
import { useTheme } from '../../../context/ThemeContext';

interface EmptyFollowersStateProps {
  message: string;
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.xxl,
      backgroundColor: theme.colors.background.primary,
    },
    message: {
      fontSize: theme.typography.sizes.md,
      color: theme.colors.text.secondary,
      textAlign: 'center',
      fontFamily: theme.typography.fonts.regular,
    },
  });

const EmptyFollowersState: React.FC<EmptyFollowersStateProps> = ({ message }) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container} testID="empty_followers_state">
      <Text style={styles.message} testID="empty_followers_message">
        {message}
      </Text>
    </View>
  );
};

export default EmptyFollowersState;
