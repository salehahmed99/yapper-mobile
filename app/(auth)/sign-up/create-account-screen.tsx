import ActivityLoader from '@/src/components/ActivityLoader';
import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import BottomBar from '@/src/modules/auth/components/shared/BottomBar';
import MultiAuthInputs from '@/src/modules/auth/components/shared/MultiAuthInputs';
import TopBar from '@/src/modules/auth/components/shared/TopBar';
import { emailSchema, userBirthDateSchema } from '@/src/modules/auth/schemas/schemas';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';

const CreateAccountScreen = () => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const onBackPress = () => {
    router.back();
  };

  const validity = {
    name: name.trim().length > 0,
    emailNotEmpty: email.trim().length > 0,
    emailValid: emailSchema.safeParse(email).success,
    dateNotEmpty: dateOfBirth.length > 0,
    birthDateValid: userBirthDateSchema.safeParse(new Date(dateOfBirth)).success,
    notLoading: !isLoading,
  };

  const isFormValid = Object.values(validity).every(Boolean);

  const onNextPress = () => {
    if (isFormValid) {
      setIsLoading(true);
      //API CALL HERE
      router.push('/(auth)/sign-up/next-step');
    } else {
      Toast.show({
        type: 'error',
        text1: 'Please fill all fields correctly before proceeding.',
      });
      return;
    }
  };

  const fields = [
    {
      label: 'Name',
      value: name,
      onChange: (text: string) => {
        if (text.length <= 50) {
          setName(text);
        }
      },
      type: 'text' as const,
    },
    {
      label: 'Email',
      value: email,
      onChange: setEmail,
      type: 'text' as const,
    },
    {
      label: 'Date of birth',
      value: dateOfBirth,
      onChange: setDateOfBirth,
      type: 'date' as const,
      hint: 'This will not be shown publicly. Confirm your own age, even if this account is for a business, a pet, or something else.',
    },
  ];

  return (
    <View style={styles.safeArea}>
      <ActivityLoader visible={isLoading} />
      <TopBar showExitButton={true} onBackPress={onBackPress} />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Create your account</Text>
        </View>

        <View style={styles.contentContainer}>
          <MultiAuthInputs fields={fields} />

          {/* Character count for Name field */}
          <View style={styles.charCountContainer}>
            <Text style={styles.charCount}>{name.length}/50</Text>
          </View>
        </View>
      </ScrollView>

      <BottomBar
        rightButton={{
          label: 'Next',
          onPress: onNextPress,
          enabled: isFormValid,
          visible: true,
          type: 'primary',
        }}
      />
    </View>
  );
};

export default CreateAccountScreen;

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
    },
    titleContainer: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.xxxl,
    },
    title: {
      fontSize: theme.typography.sizes.xxxl,
      fontFamily: theme.typography.fonts.bold,
      color: theme.colors.text.primary,
      lineHeight: theme.typography.sizes.xxxl * theme.typography.lineHeights.tight,
      marginBottom: theme.spacing.xxxl + theme.spacing.xxxl,
    },
    contentContainer: {
      flex: 1,
      paddingBottom: theme.spacing.xl,
    },
    charCountContainer: {
      paddingHorizontal: theme.spacing.mdg,
      marginTop: theme.spacing.sm,
    },
    charCount: {
      textAlign: 'right',
      color: theme.colors.text.secondary,
      fontSize: theme.typography.sizes.sm,
      fontFamily: theme.typography.fonts.regular,
    },
  });
