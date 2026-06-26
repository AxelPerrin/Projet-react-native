import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { formatDate, formatDueDate } from '@/lib/format';
import { getCategoryColors, isOverdue, NOTE_CATEGORY_LABELS } from '@/lib/noteUtils';
import { commonStyles, theme } from '@/lib/theme';
import type { Note } from '@/types/note';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (note: Note) => void;
  onToggleComplete: (note: Note) => void;
}

function NoteCardComponent({ note, onEdit, onDelete, onToggleComplete }: NoteCardProps) {
  const categoryColors = getCategoryColors(note.category);
  const overdue = isOverdue(note);

  return (
    <View style={[styles.card, note.completed && styles.cardCompleted]}>
      <View style={styles.topRow}>
        <Pressable
          accessibilityLabel={note.completed ? 'Marquer comme à faire' : 'Marquer comme terminé'}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: note.completed }}
          hitSlop={8}
          onPress={() => onToggleComplete(note)}
          style={[styles.checkbox, note.completed && styles.checkboxChecked]}
        >
          {note.completed ? <Text style={styles.checkmark}>✓</Text> : null}
        </Pressable>

        <View style={styles.content}>
          <View style={styles.metaRow}>
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: categoryColors.background,
                  borderColor: categoryColors.border,
                },
              ]}
            >
              <Text style={[styles.badgeText, { color: categoryColors.text }]}>
                {NOTE_CATEGORY_LABELS[note.category]}
              </Text>
            </View>
            {note.due_date ? (
              <Text
                style={[
                  styles.dueDate,
                  overdue && styles.dueDateOverdue,
                  note.completed && styles.dueDateCompleted,
                ]}
              >
                {overdue && !note.completed ? 'En retard · ' : ''}
                {formatDueDate(note.due_date)}
              </Text>
            ) : null}
          </View>

          <Text style={[styles.title, note.completed && styles.titleCompleted]}>{note.title}</Text>
          {note.description ? (
            <Text
              numberOfLines={3}
              style={[styles.description, note.completed && styles.descriptionCompleted]}
            >
              {note.description}
            </Text>
          ) : null}
          <Text style={styles.date}>Ajouté le {formatDate(note.created_at)}</Text>
        </View>
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
  cardCompleted: {
    opacity: 0.85,
  },
  topRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm + 4,
  },
  checkbox: {
    alignItems: 'center',
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    borderWidth: 2,
    height: 24,
    justifyContent: 'center',
    marginTop: 2,
    width: 24,
  },
  checkboxChecked: {
    backgroundColor: theme.colors.success,
    borderColor: theme.colors.success,
  },
  checkmark: {
    color: theme.colors.surface,
    fontSize: 14,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  badge: {
    borderRadius: theme.radius.full,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.sm + 2,
    paddingVertical: 2,
  },
  badgeText: {
    ...theme.typography.caption,
    fontSize: 12,
    fontWeight: '600',
  },
  dueDate: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  dueDateOverdue: {
    color: theme.colors.error,
  },
  dueDateCompleted: {
    color: theme.colors.textTertiary,
    textDecorationLine: 'line-through',
  },
  title: {
    ...theme.typography.h3,
    color: theme.colors.text,
  },
  titleCompleted: {
    color: theme.colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  description: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  descriptionCompleted: {
    color: theme.colors.textTertiary,
    textDecorationLine: 'line-through',
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
