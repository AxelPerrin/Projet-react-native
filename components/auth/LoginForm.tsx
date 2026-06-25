import { memo } from 'react';
import { Controller, type Control, type FieldErrors } from 'react-hook-form';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { Input } from '@/components/ui/Input';
import { commonStyles, theme } from '@/lib/theme';
import type { LoginFormData } from '@/types';

type AuthMode = 'login' | 'signup';

interface LoginFormProps {
  mode: AuthMode;
  control: Control<LoginFormData>;
  errors: FieldErrors<LoginFormData>;
  isSubmitting: boolean;
  errorMessage: string | null;
  successMessage: string | null;
  onSubmit: () => void;
  onSwitchMode: () => void;
}

function LoginFormComponent({
  mode,
  control,
  errors,
  isSubmitting,
  errorMessage,
  successMessage,
  onSubmit,
  onSwitchMode,
}: LoginFormProps) {
  const isLogin = mode === 'login';

  return (
    <View style={styles.card}>
      {errorMessage ? <ErrorMessage message={errorMessage} /> : null}

      {successMessage ? (
        <View style={commonStyles.feedbackSuccess}>
          <Text style={commonStyles.feedbackSuccessText}>{successMessage}</Text>
        </View>
      ) : null}

      <View style={styles.fields}>
        <Controller
          control={control}
          name="email"
          rules={{
            required: 'L\u2019e-mail est requis',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'E-mail invalide',
            },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              autoCapitalize="none"
              autoComplete="email"
              editable={!isSubmitting}
              error={errors.email?.message}
              keyboardType="email-address"
              label="E-mail"
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="vous@exemple.com"
              value={value}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          rules={{
            required: 'Le mot de passe est requis',
            minLength: {
              value: 6,
              message: 'Minimum 6 caractères',
            },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              autoComplete="password"
              editable={!isSubmitting}
              error={errors.password?.message}
              label="Mot de passe"
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="••••••••"
              secureTextEntry
              value={value}
            />
          )}
        />
      </View>

      <Button
        disabled={isSubmitting}
        loading={isSubmitting}
        onPress={onSubmit}
        style={styles.submitButton}
        title={isLogin ? 'Se connecter' : "S'inscrire"}
      />

      <Pressable
        disabled={isSubmitting}
        onPress={onSwitchMode}
        style={({ pressed }) => [styles.switchMode, pressed && styles.switchModePressed]}
      >
        <Text style={styles.switchModeText}>
          {isLogin ? 'Pas de compte ? Inscription' : 'Déjà un compte ? Connexion'}
        </Text>
      </Pressable>
    </View>
  );
}

export const LoginForm = memo(LoginFormComponent);

const styles = StyleSheet.create({
  card: {
    ...commonStyles.cardElevated,
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  fields: {
    gap: theme.spacing.md,
  },
  submitButton: {
    marginTop: theme.spacing.xs,
  },
  switchMode: {
    alignItems: 'center',
    borderRadius: theme.radius.sm,
    paddingVertical: theme.spacing.sm,
  },
  switchModePressed: {
    opacity: 0.7,
  },
  switchModeText: {
    ...theme.typography.bodySmall,
    color: theme.colors.primary,
    fontWeight: '500',
  },
});
