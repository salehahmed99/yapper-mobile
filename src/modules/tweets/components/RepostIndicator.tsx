import RepostIcon from '@/src/components/icons/RepostIcon';
import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { useAuthStore } from '@/src/store/useAuthStore';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

interface IRepostIndicatorProps {
  repostById?: string;
  repostedByName?: string;
}
const RepostIndicator: React.FC<IRepostIndicatorProps> = (props) => {
  const { repostById, repostedByName } = props;
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const user = useAuthStore((state) => state.user);

  return (
    <View style={styles.repostContainer}>
      <RepostIcon size={theme.iconSizes.xs} stroke={theme.colors.text.secondary} strokeWidth={0} />
      <Text style={styles.repostText}>
        {user?.id === repostById ? t('tweets.repost.you') : repostedByName} {t('tweets.repost.reposted')}
      </Text>
    </View>
  );
};

export default RepostIndicator;

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    repostContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      marginBottom: theme.spacing.xs,
      marginStart: theme.spacing.xl,
    },
    repostText: {
      color: theme.colors.text.secondary,
      fontFamily: theme.typography.fonts.bold,
      fontSize: theme.typography.sizes.xs,
    },
  });
