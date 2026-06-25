import { memo, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import { theme } from '@/lib/theme';

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
}

function InputComponent({ label, error, style, onFocus, onBlur, editable = true, ...textInputProps }: InputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        editable={editable}
        placeholderTextColor={theme.colors.textTertiary}
        style={[
          styles.input,
          focused && editable && styles.inputFocused,
          error ? styles.inputError : null,
          !editable && styles.inputDisabled,
          style,
        ]}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        {...textInputProps}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

export const Input = memo(InputComponent);

const styles = StyleSheet.create({
  field: {
    gap: theme.spacing.xs + 2,
  },
  label: {
    ...theme.typography.label,
    color: theme.colors.text,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    color: theme.colors.text,
    minHeight: theme.sizes.inputMinHeight,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm + 2,
    ...theme.typography.body,
  },
  inputFocused: {
    borderColor: theme.colors.primary,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  inputDisabled: {
    backgroundColor: theme.colors.surfaceSecondary,
    color: theme.colors.textSecondary,
  },
  errorText: {
    ...theme.typography.caption,
    color: theme.colors.error,
  },
});
