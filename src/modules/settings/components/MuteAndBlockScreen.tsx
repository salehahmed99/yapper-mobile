import { ChevronRight } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../context/ThemeContext';
import { createMuteAndBlockStyles } from '../styles/mute-and-block-styles';

interface IMuteAndBlockScreenProps {
  username: string;
  blockedCount?: number;
  mutedCount?: number;
  isLoading?: boolean;
  onBlockedAccountsPress: () => void;
  onMutedAccountsPress: () => void;
}

const MuteAndBlockScreen: React.FC<IMuteAndBlockScreenProps> = ({
  blockedCount = 0,
  mutedCount = 0,
  isLoading = false,
  onBlockedAccountsPress,
  onMutedAccountsPress,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useMemo(() => createMuteAndBlockStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Description */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>{t('settings.mute_block.description')}</Text>
        </View>

        {/* Blocked accounts */}
        <TouchableOpacity style={styles.menuItem} onPress={onBlockedAccountsPress} activeOpacity={0.7}>
          <View style={styles.menuItemContent}>
            <Text style={styles.menuItemTitle}>{t('settings.mute_block.blocked_accounts')}</Text>
          </View>
          <View style={styles.menuItemRight}>
            {isLoading ? (
              <ActivityIndicator size="small" color={theme.colors.text.secondary} style={styles.loader} />
            ) : (
              blockedCount > 0 && <Text style={styles.menuItemCount}>{blockedCount}</Text>
            )}
            <ChevronRight color={theme.colors.text.secondary} size={theme.sizes.icon.sm} strokeWidth={2} />
          </View>
        </TouchableOpacity>

        {/* Muted accounts */}
        <TouchableOpacity style={styles.menuItem} onPress={onMutedAccountsPress} activeOpacity={0.7}>
          <View style={styles.menuItemContent}>
            <Text style={styles.menuItemTitle}>{t('settings.mute_block.muted_accounts')}</Text>
          </View>
          <View style={styles.menuItemRight}>
            {isLoading ? (
              <ActivityIndicator size="small" color={theme.colors.text.secondary} style={styles.loader} />
            ) : (
              mutedCount > 0 && <Text style={styles.menuItemCount}>{mutedCount}</Text>
            )}
            <ChevronRight color={theme.colors.text.secondary} size={theme.sizes.icon.sm} strokeWidth={2} />
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default MuteAndBlockScreen;
