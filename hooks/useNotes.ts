import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';

import { useAuth } from '@/providers/AuthProvider';
import { useNotesStore } from '@/store/notesStore';
import type { Note, NoteInput } from '@/types/note';

import type { NoteFormMode } from '@/components/notes/NoteFormModal';

interface UseNotesResult {
  notes: Note[];
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  modalVisible: boolean;
  formMode: NoteFormMode;
  title: string;
  description: string;
  formError: string | null;
  isSubmitting: boolean;
  refresh: () => Promise<void>;
  openCreateModal: () => void;
  openEditModal: (note: Note) => void;
  closeModal: () => void;
  setTitle: (value: string) => void;
  setDescription: (value: string) => void;
  submitForm: () => Promise<void>;
  confirmDelete: (note: Note) => void;
}

export function useNotes(): UseNotesResult {
  const { user } = useAuth();
  const { notes, loading, error, fetchNotes, createNote, updateNote, deleteNote } =
    useNotesStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [formMode, setFormMode] = useState<NoteFormMode>('create');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotes = useCallback(async () => {
    if (!user?.id) {
      return;
    }
    await fetchNotes(user.id);
  }, [user?.id, fetchNotes]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await loadNotes();
    setRefreshing(false);
  }, [loadNotes]);

  const openCreateModal = useCallback(() => {
    setFormMode('create');
    setEditingNote(null);
    setTitle('');
    setDescription('');
    setFormError(null);
    setModalVisible(true);
  }, []);

  const openEditModal = useCallback((note: Note) => {
    setFormMode('edit');
    setEditingNote(note);
    setTitle(note.title);
    setDescription(note.description ?? '');
    setFormError(null);
    setModalVisible(true);
  }, []);

  const closeModal = useCallback(() => {
    if (isSubmitting) {
      return;
    }
    setModalVisible(false);
    setFormError(null);
  }, [isSubmitting]);

  const submitForm = useCallback(async () => {
    if (!user?.id) {
      return;
    }

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setFormError('Le titre est requis.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    const input: NoteInput = {
      title: trimmedTitle,
      description: description.trim() || null,
    };

    const success =
      formMode === 'create'
        ? await createNote(user.id, input)
        : editingNote
          ? await updateNote(editingNote.id, input)
          : false;

    setIsSubmitting(false);

    if (success) {
      setModalVisible(false);
      return;
    }

    setFormError(
      formMode === 'create'
        ? 'Impossible de créer la note.'
        : 'Impossible de modifier la note.',
    );
  }, [
    user?.id,
    title,
    description,
    formMode,
    editingNote,
    createNote,
    updateNote,
  ]);

  const confirmDelete = useCallback(
    (note: Note) => {
      Alert.alert('Supprimer la note', `Voulez-vous supprimer « ${note.title} » ?`, [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            await deleteNote(note.id);
          },
        },
      ]);
    },
    [deleteNote],
  );

  return useMemo(
    () => ({
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
    }),
    [
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
      submitForm,
      confirmDelete,
    ],
  );
}
