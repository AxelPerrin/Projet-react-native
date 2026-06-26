import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';

import { useAuth } from '@/providers/AuthProvider';
import { useNotesStore } from '@/store/notesStore';
import type { Note, NoteCategory, NoteInput } from '@/types/note';
import { filterNotes, sortNotes, toIsoDateOnly, type NoteFilter } from '@/lib/noteUtils';

import type { NoteFormMode } from '@/components/notes/NoteFormModal';

interface UseNotesResult {
  notes: Note[];
  filteredNotes: Note[];
  activeFilter: NoteFilter;
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  modalVisible: boolean;
  formMode: NoteFormMode;
  title: string;
  description: string;
  category: NoteCategory;
  dueDate: Date | null;
  completed: boolean;
  formError: string | null;
  isSubmitting: boolean;
  refresh: () => Promise<void>;
  setActiveFilter: (filter: NoteFilter) => void;
  openCreateModal: () => void;
  openEditModal: (note: Note) => void;
  closeModal: () => void;
  setTitle: (value: string) => void;
  setDescription: (value: string) => void;
  setCategory: (value: NoteCategory) => void;
  setDueDate: (value: Date | null) => void;
  setCompleted: (value: boolean) => void;
  submitForm: () => Promise<void>;
  confirmDelete: (note: Note) => void;
  toggleComplete: (note: Note) => Promise<void>;
}

export function useNotes(): UseNotesResult {
  const { user } = useAuth();
  const {
    notes,
    loading,
    error,
    fetchNotes,
    createNote,
    updateNote,
    deleteNote,
    toggleNoteCompleted,
  } = useNotesStore();

  const [activeFilter, setActiveFilter] = useState<NoteFilter>('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [formMode, setFormMode] = useState<NoteFormMode>('create');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<NoteCategory>('homework');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [completed, setCompleted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const filteredNotes = useMemo(
    () => sortNotes(filterNotes(notes, activeFilter)),
    [notes, activeFilter],
  );

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

  const resetForm = useCallback(() => {
    setTitle('');
    setDescription('');
    setCategory('homework');
    setDueDate(null);
    setCompleted(false);
    setFormError(null);
  }, []);

  const openCreateModal = useCallback(() => {
    setFormMode('create');
    setEditingNote(null);
    resetForm();
    setModalVisible(true);
  }, [resetForm]);

  const openEditModal = useCallback((note: Note) => {
    setFormMode('edit');
    setEditingNote(note);
    setTitle(note.title);
    setDescription(note.description ?? '');
    setCategory(note.category);
    setDueDate(note.due_date ? new Date(`${note.due_date}T00:00:00`) : null);
    setCompleted(note.completed);
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
      category,
      due_date: dueDate ? toIsoDateOnly(dueDate) : null,
      completed,
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
        ? 'Impossible de créer l\'entrée.'
        : 'Impossible de modifier l\'entrée.',
    );
  }, [
    user?.id,
    title,
    description,
    category,
    dueDate,
    completed,
    formMode,
    editingNote,
    createNote,
    updateNote,
  ]);

  const confirmDelete = useCallback(
    (note: Note) => {
      Alert.alert('Supprimer', `Voulez-vous supprimer « ${note.title} » ?`, [
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

  const toggleComplete = useCallback(
    async (note: Note) => {
      await toggleNoteCompleted(note.id, !note.completed);
    },
    [toggleNoteCompleted],
  );

  return useMemo(
    () => ({
      notes,
      filteredNotes,
      activeFilter,
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
      setActiveFilter,
      openCreateModal,
      openEditModal,
      closeModal,
      setTitle,
      setDescription,
      setCategory,
      setDueDate,
      setCompleted,
      submitForm,
      confirmDelete,
      toggleComplete,
    }),
    [
      notes,
      filteredNotes,
      activeFilter,
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
      openCreateModal,
      openEditModal,
      closeModal,
      submitForm,
      confirmDelete,
      toggleComplete,
    ],
  );
}
