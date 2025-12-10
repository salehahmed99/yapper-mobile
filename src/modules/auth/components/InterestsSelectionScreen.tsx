import ActivityLoader from '@/src/components/ActivityLoader';
import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import BottomBar from '@/src/modules/auth/components/shared/BottomBar';
import AuthTitle from '@/src/modules/auth/components/shared/Title';
import TopBar from '@/src/modules/auth/components/shared/TopBar';
import { Check } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';

interface IInterestsSelectionScreenProps {
  categories: string[];
  isLoading: boolean;
  onNext: (selectedIds: number[]) => Promise<void>;
  onSkip: () => void;
}

const InterestsSelectionScreen: React.FC<IInterestsSelectionScreenProps> = ({
  categories,
  isLoading,
  onNext,
  onSkip,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [selectedCategories, setSelectedCategories] = useState<Set<number>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleCategory = (index: number) => {
    setSelectedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleNext = async () => {
    setIsSubmitting(true);
    try {
      const selectedIds = Array.from(selectedCategories).map((idx) => idx + 1);
      await onNext(selectedIds);
    } catch (error) {
      const message = error instanceof Error ? error.message : t('auth.signUp.interests.errors.generic');
      Toast.show({
        type: 'error',
        text1: t('auth.signUp.interests.errors.error'),
        text2: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCategoryLabel = (category: string): string => {
    return category
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' & ');
  };

  const renderCategory = ({ item, index }: { item: string; index: number }) => {
    const isSelected = selectedCategories.has(index);

    return (
      <TouchableOpacity
        style={[styles.categoryButton, isSelected && styles.categoryButtonSelected]}
        onPress={() => toggleCategory(index)}
        activeOpacity={0.7}
      >
        {isSelected && (
          <View style={styles.checkIcon}>
            <View style={styles.checkCircle}>
              <Check color={theme.colors.text.link} size={13} strokeWidth={3} />
            </View>
          </View>
        )}
        <Text style={styles.categoryText}>{formatCategoryLabel(item)}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ActivityLoader visible={isLoading || isSubmitting} />
      <TopBar showExitButton={false} />

      <View style={styles.content}>
        <View style={styles.headerSection}>
          <AuthTitle title={t('auth.signUp.interests.title')} />
          <View style={styles.descriptionContainer}>
            <Text style={styles.description}>{t('auth.signUp.interests.description')}</Text>
          </View>
        </View>

        <FlatList
          data={categories}
          renderItem={renderCategory}
          keyExtractor={(item, index) => `${item}-${index}`}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </View>

      <BottomBar
        rightButton={{
          label: t('buttons.next'),
          onPress: handleNext,
          enabled: !isSubmitting && selectedCategories.size > 0,
          visible: true,
          type: 'primary',
        }}
        leftButton={{
          label: t('auth.signUp.userName.skipButton'),
          onPress: onSkip,
          enabled: !isSubmitting,
          visible: true,
          type: 'secondary',
        }}
      />
    </View>
  );
};

export default InterestsSelectionScreen;

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    content: {
      flex: 1,
      paddingHorizontal: theme.spacing.xl,
    },
    headerSection: {
      marginBottom: theme.spacing.lg,
    },
    descriptionContainer: {
      marginTop: theme.spacing.sm,
    },
    description: {
      color: theme.colors.text.secondary,
      fontSize: theme.typography.sizes.sm,
      fontFamily: theme.typography.fonts.regular,
      lineHeight: 20,
    },
    listContent: {
      paddingBottom: theme.spacing.xl,
    },
    row: {
      justifyContent: 'space-between',
      marginBottom: theme.spacing.md,
    },
    categoryButton: {
      flex: 0.48,
      minHeight: 80,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.lg,
      borderWidth: theme.borderWidth.thin,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.background.primary,
      justifyContent: 'flex-end',
      alignItems: 'flex-start',
      position: 'relative',
    },
    categoryButtonSelected: {
      backgroundColor: theme.colors.text.link,
      borderColor: theme.colors.text.link,
    },
    categoryText: {
      fontSize: theme.typography.sizes.sm,
      fontFamily: theme.typography.fonts.bold,
      color: theme.colors.text.primary,
      textAlign: 'left',
    },
    checkIcon: {
      position: 'absolute',
      top: theme.spacing.sm,
      right: theme.spacing.sm,
    },
    checkCircle: {
      width: theme.spacing.mdg,
      height: theme.spacing.mdg,
      borderRadius: theme.borderRadius.fullRounded,
      backgroundColor: theme.colors.white,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
