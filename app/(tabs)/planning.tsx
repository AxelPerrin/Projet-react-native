import { useCallback, useMemo } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NoteFormModal } from '@/components/notes/NoteFormModal';
import { PlanningNoteRow } from '@/components/notes/PlanningNoteRow';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { LoadingView } from '@/components/ui/LoadingView';
import { useNotes } from '@/hooks/useNotes';
import { formatWeekRange } from '@/lib/format';
import { getCurrentWeekBounds, groupNotesByDay } from '@/lib/noteUtils';
import { commonStyles, theme } from '@/lib/theme';
import type { Note } from '@/types/note';

export default function PlanningScreen() {
  const {
    notes,
    loading,
    error,
    refreshing,
    modalVisible,
    formMode,
    title,
    description,
    category,
    dueDate,
    completed,
    formError,
    isSubmitting,
    refresh,
    openEditModal,
    closeModal,
    setTitle,
    setDescription,
    setCategory,
    setDueDate,
    setCompleted,
    submitForm,
    toggleComplete,
  } = useNotes();

  const dayGroups = useMemo(() => groupNotesByDay(notes), [notes]);
  const weekRangeLabel = useMemo(() => {
    const { weekStart, weekEnd } = getCurrentWeekBounds();
    return formatWeekRange(weekStart, weekEnd);
  }, []);

  const handleToggleComplete = useCallback(
    (note: Note) => {
      void toggleComplete(note);
    },
    [toggleComplete],
  );

  const renderContent = () => {
    if (loading && dayGroups.length === 0) {
      return <LoadingView message="Chargement du planning…" />;
    }

    if (error && dayGroups.length === 0) {
      return (
        <View style={styles.centered}>
          <ErrorMessage message={error} />
          <Button onPress={refresh} style={styles.retryButton} title="Réessayer" />
        </View>
      );
    }

    if (dayGroups.length === 0) {
      return (
        <EmptyState
          description="Les devoirs, cours et examens à venir cette semaine apparaîtront ici."
          title="Semaine tranquille"
        />
      );
    }

    return (
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            colors={[theme.colors.primary]}
            refreshing={refreshing}
            tintColor={theme.colors.primary}
            onRefresh={refresh}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {dayGroups.map((group) => (
          <View key={group.key} style={styles.daySection}>
            <View style={styles.dayHeader}>
              <Text style={[styles.dayTitle, group.isOverdue && styles.dayTitleOverdue]}>
                {group.label}
              </Text>
              <Text style={styles.dayCount}>
                {group.notes.length} {group.notes.length > 1 ? 'entrées' : 'entrée'}
              </Text>
            </View>
            <View style={styles.dayNotes}>
              {group.notes.map((note) => (
                <PlanningNoteRow
                  key={note.id}
                  note={note}
                  onPress={openEditModal}
                  onToggleComplete={handleToggleComplete}
                />
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={commonStyles.screen} edges={['bottom']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.overline}>StudyFlow</Text>
          <Text style={styles.title}>Vue semaine</Text>
          <Text style={styles.subtitle}>{weekRangeLabel}</Text>
        </View>

        {error && dayGroups.length > 0 ? (
          <ErrorMessage message={error} style={styles.inlineError} />
        ) : null}

        {renderContent()}
      </View>

      <NoteFormModal
        category={category}
        completed={completed}
        description={description}
        dueDate={dueDate}
        formError={formError}
        isSubmitting={isSubmitting}
        mode={formMode}
        onChangeCategory={setCategory}
        onChangeCompleted={setCompleted}
        onChangeDescription={setDescription}
        onChangeDueDate={setDueDate}
        onChangeTitle={setTitle}
        onClose={closeModal}
        onSubmit={submitForm}
        title={title}
        visible={modalVisible}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  header: {
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.lg,
  },
  overline: {
    ...theme.typography.overline,
    color: theme.colors.primary,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
  },
  subtitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  inlineError: {
    marginBottom: theme.spacing.md,
  },
  centered: {
    alignItems: 'center',
    flex: 1,
    gap: theme.spacing.md,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  retryButton: {
    minWidth: 140,
  },
  scrollContent: {
    gap: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  daySection: {
    gap: theme.spacing.sm,
  },
  dayHeader: {
    alignItems: 'baseline',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    flex: 1,
  },
  dayTitleOverdue: {
    color: theme.colors.error,
  },
  dayCount: {
    ...theme.typography.caption,
    color: theme.colors.textTertiary,
    marginLeft: theme.spacing.sm,
  },
  dayNotes: {
    gap: theme.spacing.sm,
  },
});
