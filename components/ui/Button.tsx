import { memo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { theme } from '@/lib/theme';

type ButtonVariant = 'primary' | 'secondary' | 'danger';
type ButtonSize = 'default' | 'compact';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

function ButtonComponent({
  title,
  variant = 'primary',
  size = 'default',
  loading = false,
  disabled,
  style,
  ...pressableProps
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        size === 'compact' && styles.compact,
        styles[variant],
        pressed && !isDisabled && styles[`${variant}Pressed` as const],
        isDisabled && styles.disabled,
        style,
      ]}
      {...pressableProps}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? theme.colors.surface : theme.colors.primary}
          size="small"
        />
      ) : (
        <Text style={[styles.text, styles[`${variant}Text` as const]]}>{title}</Text>
      )}
    </Pressable>
  );
}

export const Button = memo(ButtonComponent);

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: theme.radius.md,
    justifyContent: 'center',
    minHeight: theme.sizes.buttonHeight,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  compact: {
    minHeight: theme.sizes.buttonHeightSm,
    paddingHorizontal: theme.spacing.sm + 4,
  },
  primary: {
    backgroundColor: theme.colors.primary,
  },
  primaryPressed: {
    backgroundColor: theme.colors.primaryDark,
  },
  primaryText: {
    color: theme.colors.surface,
  },
  secondary: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
  },
  secondaryPressed: {
    backgroundColor: theme.colors.surfaceSecondary,
  },
  secondaryText: {
    color: theme.colors.text,
  },
  danger: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.error,
    borderWidth: 1,
  },
  dangerPressed: {
    backgroundColor: theme.colors.errorBackground,
  },
  dangerText: {
    color: theme.colors.error,
  },
  text: {
    ...theme.typography.label,
  },
  disabled: {
    opacity: 0.55,
  },
});
