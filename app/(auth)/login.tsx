import { useCallback, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LoginForm } from '@/components/auth/LoginForm';
import { mapAuthError } from '@/lib/errors';
import { commonStyles, theme } from '@/lib/theme';
import { useAuth } from '@/providers/AuthProvider';
import type { LoginFormData } from '@/types';

type AuthMode = 'login' | 'signup';

export default function LoginScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const submitInFlightRef = useRef(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormData>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const switchMode = useCallback(() => {
    setMode((current) => (current === 'login' ? 'signup' : 'login'));
    setErrorMessage(null);
    setSuccessMessage(null);
    reset();
  }, [reset]);

  const onSubmit = useCallback(
    async (data: LoginFormData) => {
      if (submitInFlightRef.current) {
        return;
      }

      submitInFlightRef.current = true;
      setIsSubmitting(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      try {
        const { error } =
          mode === 'login'
            ? await signIn(data.email, data.password)
            : await signUp(data.email, data.password);

        if (error) {
          setErrorMessage(error);
          return;
        }

        if (mode === 'signup') {
          setSuccessMessage(
            'Inscription réussie. Vérifiez votre e-mail si la confirmation est activée.',
          );
          return;
        }

        setSuccessMessage('Connexion réussie.');
      } catch (err) {
        setErrorMessage(mapAuthError(err));
      } finally {
        submitInFlightRef.current = false;
        setIsSubmitting(false);
      }
    },
    [mode, signIn, signUp],
  );

  const submitForm = useCallback(() => {
    void handleSubmit(onSubmit)();
  }, [handleSubmit, onSubmit]);

  const isLogin = mode === 'login';

  return (
    <SafeAreaView style={commonStyles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.brand}>Notes</Text>
            <Text style={styles.title}>
              {isLogin ? 'Connexion' : 'Inscription'}
            </Text>
            <Text style={styles.subtitle}>
              {isLogin
                ? 'Connectez-vous pour accéder à votre espace.'
                : 'Créez un compte pour commencer.'}
            </Text>
          </View>

          <LoginForm
            control={control}
            errorMessage={errorMessage}
            errors={errors}
            isSubmitting={isSubmitting}
            mode={mode}
            onSubmit={submitForm}
            onSwitchMode={switchMode}
            successMessage={successMessage}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
  },
  header: {
    marginBottom: theme.spacing.lg,
  },
  brand: {
    ...theme.typography.overline,
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
});
