import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/format';
import { commonStyles, theme } from '@/lib/theme';
import type { Note } from '@/types/note';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (note: Note) => void;
}

function NoteCardComponent({ note, onEdit, onDelete }: NoteCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.content}>
        <Text style={styles.title}>{note.title}</Text>
        {note.description ? (
          <Text style={styles.description} numberOfLines={3}>
            {note.description}
          </Text>
        ) : null}
        <Text style={styles.date}>{formatDate(note.created_at)}</Text>
      </View>

      <View style={styles.separator} />

      <View style={styles.actions}>
        <Button
          onPress={() => onEdit(note)}
          size="compact"
          style={styles.actionButton}
          title="Modifier"
          variant="secondary"
        />
        <Button
          onPress={() => onDelete(note)}
          size="compact"
          style={styles.actionButton}
          title="Supprimer"
          variant="danger"
        />
      </View>
    </View>
  );
}

export const NoteCard = memo(NoteCardComponent);

const styles = StyleSheet.create({
  card: {
    ...commonStyles.cardElevated,
  },
  content: {
    gap: theme.spacing.xs,
  },
  title: {
    ...theme.typography.h3,
    color: theme.colors.text,
  },
  description: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  date: {
    ...theme.typography.caption,
    color: theme.colors.textTertiary,
    marginTop: theme.spacing.xs,
  },
  separator: {
    ...commonStyles.separator,
    marginVertical: theme.spacing.sm + 4,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
});
