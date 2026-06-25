import { Platform, StyleSheet } from 'react-native';

const shadowColor = '#0F172A';

export const theme = {
  colors: {
    primary: '#2563EB',
    primaryDark: '#1D4ED8',
    primaryLight: '#EFF6FF',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceSecondary: '#F1F5F9',
    text: '#0F172A',
    textSecondary: '#64748B',
    textTertiary: '#94A3B8',
    border: '#E2E8F0',
    borderLight: '#F1F5F9',
    error: '#DC2626',
    errorBackground: '#FEF2F2',
    success: '#059669',
    successBackground: '#ECFDF5',
    warning: '#D97706',
    warningBackground: '#FFFBEB',
    overlay: 'rgba(15, 23, 42, 0.45)',
    tabBar: '#FFFFFF',
    tabBarInactive: '#94A3B8',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  typography: {
    h1: {
      fontSize: 28,
      fontWeight: '700' as const,
      lineHeight: 34,
      letterSpacing: -0.3,
    },
    h2: {
      fontSize: 22,
      fontWeight: '600' as const,
      lineHeight: 28,
      letterSpacing: -0.2,
    },
    h3: {
      fontSize: 18,
      fontWeight: '600' as const,
      lineHeight: 24,
    },
    body: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 24,
    },
    bodySmall: {
      fontSize: 15,
      fontWeight: '400' as const,
      lineHeight: 22,
    },
    caption: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 20,
    },
    label: {
      fontSize: 14,
      fontWeight: '500' as const,
      lineHeight: 20,
    },
    overline: {
      fontSize: 12,
      fontWeight: '500' as const,
      lineHeight: 16,
      letterSpacing: 0.4,
      textTransform: 'uppercase' as const,
    },
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    full: 9999,
  },
  shadows: {
    sm: Platform.select({
      ios: {
        shadowColor,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
      },
      android: { elevation: 1 },
      default: {},
    }),
    md: Platform.select({
      ios: {
        shadowColor,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
      default: {},
    }),
  },
  sizes: {
    buttonHeight: 48,
    buttonHeightSm: 40,
    inputMinHeight: 48,
    tabBarHeight: 56,
    avatarSize: 120,
  },
} as const;

export type Theme = typeof theme;

export const commonStyles = StyleSheet.create({
  screen: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  screenContent: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    padding: theme.spacing.md,
  },
  cardElevated: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.borderLight,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    padding: theme.spacing.md,
    ...theme.shadows.sm,
  },
  separator: {
    backgroundColor: theme.colors.border,
    height: StyleSheet.hairlineWidth,
  },
  feedbackSuccess: {
    backgroundColor: theme.colors.successBackground,
    borderColor: theme.colors.success,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    padding: theme.spacing.sm,
  },
  feedbackSuccessText: {
    ...theme.typography.caption,
    color: theme.colors.success,
    textAlign: 'center',
  },
  feedbackError: {
    backgroundColor: theme.colors.errorBackground,
    borderColor: theme.colors.error,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    padding: theme.spacing.sm,
  },
  sectionTitle: {
    ...theme.typography.overline,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
});
