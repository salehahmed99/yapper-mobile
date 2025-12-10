import React, { useMemo, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, I18nManager } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { ISettingsItem as SettingsItemType } from '../types/types';
import { useTheme } from '@/src/context/ThemeContext';
import { Theme } from '@/src/constants/theme';

interface ISettingsItemProps {
  item: SettingsItemType;
  onPress?: (item: SettingsItemType) => void;
  showDescription?: boolean;
  showChevron?: boolean;
  showIcons?: boolean;
}

export const SettingsItem: React.FC<ISettingsItemProps> = ({
  item,
  onPress,
  showChevron = false,
  showDescription = true,
  showIcons = true,
}) => {
  const { theme } = useTheme();
  const isRTL = I18nManager.isRTL;
  const styles = useMemo(() => createStyles(theme), [theme]);

  const getIconComponent = useCallback(() => {
    const iconProps = {
      name: item.icon as never,
      size: theme.typography.sizes.xl,
      color: theme.colors.text.tertiary,
    };

    switch (item.iconFamily) {
      case 'Ionicons':
        return <Ionicons {...iconProps} />;
      case 'MaterialCommunityIcons':
      default:
        return <MaterialCommunityIcons {...iconProps} />;
    }
  }, [item.icon, item.iconFamily, theme]);

  const Icon = useMemo(() => getIconComponent(), [getIconComponent]);

  return (
    <Pressable
      style={styles.container}
      onPress={() => onPress?.(item)}
      accessibilityLabel={`Settings Item: ${item.title}`}
      testID={`Settings_Item_${item.id}`}
    >
      {showIcons && <View style={styles.iconContainer}>{Icon}</View>}
      <View style={styles.content}>
        <Text style={showDescription ? styles.title : styles.titleOnly}>{item.title}</Text>
        {showDescription && <Text style={styles.description}>{item.description}</Text>}
      </View>
      {showChevron && (
        <View style={styles.chevronContainer}>
          <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={20} color={theme.colors.text.tertiary} />
        </View>
      )}
    </Pressable>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      backgroundColor: theme.colors.background.primary,
    },
    iconContainer: {
      width: theme.spacing.xxxxl,
      height: theme.spacing.xxxxl,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.md,
    },
    content: {
      flex: 1,
      marginRight: theme.spacing.md,
    },
    title: {
      fontSize: theme.typography.sizes.sm,
      fontFamily: theme.typography.fonts.light,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xs,
    },
    titleOnly: {
      fontSize: theme.typography.sizes.md,
      fontFamily: theme.typography.fonts.semiBold,
      color: theme.colors.text.primary,
    },
    description: {
      fontSize: theme.typography.sizes.sm,
      lineHeight: 20,
      color: theme.colors.text.secondary,
    },
    chevronContainer: {
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
