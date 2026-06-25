import { memo } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { commonStyles, theme } from '@/lib/theme';

interface ErrorMessageProps {
  message: string;
  style?: StyleProp<ViewStyle>;
}

function ErrorMessageComponent({ message, style }: ErrorMessageProps) {
  return (
    <View style={[commonStyles.feedbackError, styles.container, style]}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

export const ErrorMessage = memo(ErrorMessageComponent);

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  text: {
    ...theme.typography.caption,
    color: theme.colors.error,
    textAlign: 'center',
  },
});
