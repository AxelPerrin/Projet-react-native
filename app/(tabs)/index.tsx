import { useCallback } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NoteCard } from '@/components/notes/NoteCard';
import { NoteFormModal } from '@/components/notes/NoteFormModal';
import { NotificationsCard } from '@/components/notes/NotificationsCard';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { LoadingView } from '@/components/ui/LoadingView';
import { useNotes } from '@/hooks/useNotes';
import { useNotifications } from '@/hooks/useNotifications';
import { commonStyles, theme } from '@/lib/theme';
import type { Note } from '@/types/note';

export default function HomeScreen() {
  const {
    notes,
    loading,
    error,
    refreshing,
    modalVisible,
    formMode,
    title,
    description,
    formError,
    isSubmitting,
    refresh,
    openCreateModal,
    openEditModal,
    closeModal,
    setTitle,
    setDescription,
    submitForm,
    confirmDelete,
  } = useNotes();

  const { status, isTesting, testNotification } = useNotifications();

  const renderNote = useCallback(
    ({ item }: { item: Note }) => (
      <NoteCard note={item} onDelete={confirmDelete} onEdit={openEditModal} />
    ),
    [confirmDelete, openEditModal],
  );

  const keyExtractor = useCallback((item: Note) => item.id, []);

  const renderSeparator = useCallback(
    () => <View style={styles.listSeparator} />,
    [],
  );

  const renderContent = () => {
    if (loading && notes.length === 0) {
      return <LoadingView message="Chargement des notes…" />;
    }

    if (error && notes.length === 0) {
      return (
        <View style={styles.centered}>
          <ErrorMessage message={error} />
          <Button onPress={refresh} style={styles.retryButton} title="Réessayer" />
        </View>
      );
    }

    if (notes.length === 0) {
      return (
        <EmptyState
          description="Appuyez sur « Nouvelle note » pour commencer."
          title="Aucune note"
        />
      );
    }

    return (
      <FlatList
        contentContainerStyle={styles.listContent}
        data={notes}
        ItemSeparatorComponent={renderSeparator}
        keyExtractor={keyExtractor}
        removeClippedSubviews
        refreshControl={
          <RefreshControl
            colors={[theme.colors.primary]}
            refreshing={refreshing}
            tintColor={theme.colors.primary}
            onRefresh={refresh}
          />
        }
        renderItem={renderNote}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <SafeAreaView style={commonStyles.screen} edges={['bottom']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.overline}>Accueil</Text>
            <Text style={styles.title}>Mes notes</Text>
          </View>
          <Button
            onPress={openCreateModal}
            size="compact"
            style={styles.addButton}
            title="Nouvelle note"
          />
        </View>

        {error && notes.length > 0 ? (
          <ErrorMessage message={error} style={styles.inlineError} />
        ) : null}

        <NotificationsCard
          isTesting={isTesting}
          onTest={testNotification}
          status={status}
        />

        {renderContent()}
      </View>

      <NoteFormModal
        description={description}
        formError={formError}
        isSubmitting={isSubmitting}
        mode={formMode}
        onChangeDescription={setDescription}
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
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  headerText: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  overline: {
    ...theme.typography.overline,
    color: theme.colors.textTertiary,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
  },
  addButton: {
    marginLeft: theme.spacing.sm,
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
  listContent: {
    paddingBottom: theme.spacing.xl,
  },
  listSeparator: {
    height: theme.spacing.md,
  },
});
