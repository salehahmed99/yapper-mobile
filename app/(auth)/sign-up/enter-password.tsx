import ActivityLoader from '@/src/components/ActivityLoader';
import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import BottomBar from '@/src/modules/auth/components/shared/BottomBar';
import PasswordInput from '@/src/modules/auth/components/shared/PasswordInput';
import AuthTitle from '@/src/modules/auth/components/shared/Title';
import TopBar from '@/src/modules/auth/components/shared/TopBar';
import { passwordSchema } from '@/src/modules/auth/schemas/schemas';
import { useSignUpStore } from '@/src/modules/auth/store/useSignUpStore';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';

const EnterPasswordScreen = () => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // Zustand store
  const email = useSignUpStore((state) => state.email);
  const verificationToken = useSignUpStore((state) => state.verificationToken);

  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if no email or verification token
  useEffect(() => {
    if (!email || !verificationToken) {
      router.replace('/(auth)/sign-up/create-account-screen');
    }
  }, [email, verificationToken]);

  // Validation
  const isPasswordValid = password.length >= 8 ? passwordSchema.safeParse(password).success : true;
  const isFormValid = password.length >= 8 && isPasswordValid && !isLoading;

  const handleTopBarBackPress = () => {
    router.replace('/(auth)/landing-screen');
  };

  const onNextPress = async () => {
    if (!isFormValid) {
      Toast.show({
        type: 'error',
        text1: 'Invalid password',
        text2: 'Please ensure your password meets all requirements.',
      });
      return;
    }

    setIsLoading(true);
    try {
      // TODO: API CALL HERE to complete sign up with password
      // const response = await signUpAPI({ email, password, verificationToken, ... });

      Toast.show({
        type: 'success',
        text1: 'Account created',
        text2: 'Your account has been created successfully.',
      });

      // Navigate to next step or home
      router.push('/(auth)/sign-up/next-step');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      Toast.show({ type: 'error', text1: 'Error', text2: message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.safeArea}>
      <ActivityLoader visible={isLoading} />
      <TopBar showExitButton={true} onBackPress={handleTopBarBackPress} />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.titleContainer}>
            <AuthTitle title="You'll need a password" />
          </View>

          <View style={styles.descriptionContainer}>
            <Text style={styles.description}>Make sure it's 8 characters or more.</Text>
          </View>

          <View style={styles.inputContainer}>
            <PasswordInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              onToggleVisibility={() => setIsPasswordVisible(!isPasswordVisible)}
              isVisible={isPasswordVisible}
              showCheck={password.length >= 8}
              status={password.length >= 8 && !isPasswordValid ? 'error' : password.length >= 8 ? 'success' : undefined}
              errorMessage={
                password.length >= 8 && !isPasswordValid
                  ? 'Password must contain uppercase, lowercase, number, and special character'
                  : ''
              }
            />
          </View>

          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              By signing up, you agree to the <Text style={styles.linkText}>Terms of Service</Text> and{' '}
              <Text style={styles.linkText}>Privacy Policy</Text>, including{' '}
              <Text style={styles.linkText}>Cookie Use</Text>. X may use your contact information, including your email
              address and phone number for purposes outlined in our Privacy Policy, like keeping your account secure and
              personalizing our services, including ads. <Text style={styles.linkText}>Learn more</Text>. Others will be
              able to find you by email or phone number, when provided, unless you choose otherwise{' '}
              <Text style={styles.linkText}>here</Text>.
            </Text>
          </View>
        </View>
      </ScrollView>

      <BottomBar
        rightButton={{
          label: 'Sign up',
          onPress: onNextPress,
          enabled: isFormValid,
          visible: true,
          type: 'primary',
        }}
      />
    </View>
  );
};

export default EnterPasswordScreen;

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
    content: {
      flex: 1,
      justifyContent: 'flex-start',
      paddingHorizontal: theme.spacing.xl,
    },
    titleContainer: {
      marginBottom: theme.spacing.md,
    },
    descriptionContainer: {
      marginBottom: theme.spacing.xl,
    },
    description: {
      color: theme.colors.text.secondary,
      fontSize: theme.typography.sizes.sm,
      fontFamily: theme.typography.fonts.regular,
      lineHeight: 20,
    },
    inputContainer: {
      marginBottom: theme.spacing.xl,
    },
    termsContainer: {
      marginTop: theme.spacing.lg,
    },
    termsText: {
      color: theme.colors.text.secondary,
      fontSize: theme.typography.sizes.xs,
      fontFamily: theme.typography.fonts.regular,
      lineHeight: 16,
    },
    linkText: {
      color: theme.colors.text.link,
    },
  });
