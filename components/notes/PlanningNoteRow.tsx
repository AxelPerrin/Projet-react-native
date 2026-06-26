import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatDueDate } from '@/lib/format';
import { getCategoryColors, isOverdue, NOTE_CATEGORY_LABELS } from '@/lib/noteUtils';
import { theme } from '@/lib/theme';
import type { Note } from '@/types/note';

interface PlanningNoteRowProps {
  note: Note;
  onPress: (note: Note) => void;
  onToggleComplete: (note: Note) => void;
}

function PlanningNoteRowComponent({ note, onPress, onToggleComplete }: PlanningNoteRowProps) {
  const categoryColors = getCategoryColors(note.category);
  const overdue = isOverdue(note);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onPress(note)}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <Pressable
        accessibilityLabel="Marquer comme terminé"
        accessibilityRole="checkbox"
        accessibilityState={{ checked: false }}
        hitSlop={8}
        onPress={() => onToggleComplete(note)}
        style={styles.checkbox}
      />

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
            <Text style={[styles.dueDate, overdue && styles.dueDateOverdue]}>
              {overdue ? 'En retard · ' : ''}
              {formatDueDate(note.due_date)}
            </Text>
          ) : null}
        </View>
        <Text numberOfLines={2} style={styles.title}>
          {note.title}
        </Text>
      </View>
    </Pressable>
  );
}

export const PlanningNoteRow = memo(PlanningNoteRowComponent);

const styles = StyleSheet.create({
  row: {
    alignItems: 'flex-start',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: theme.spacing.sm + 4,
    padding: theme.spacing.md,
  },
  rowPressed: {
    backgroundColor: theme.colors.surfaceSecondary,
  },
  checkbox: {
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    borderWidth: 2,
    height: 22,
    marginTop: 2,
    width: 22,
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
  title: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '500',
  },
});
