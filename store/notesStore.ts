import { create } from 'zustand';

import { getErrorMessage } from '@/lib/errors';
import * as notesService from '@/services/notes';
import type { Note, NoteInput } from '@/types/note';

interface NotesState {
  notes: Note[];
  loading: boolean;
  error: string | null;
  fetchRequestId: number;
  fetchNotes: (userId: string) => Promise<void>;
  createNote: (userId: string, input: NoteInput) => Promise<boolean>;
  updateNote: (noteId: string, input: NoteInput) => Promise<boolean>;
  deleteNote: (noteId: string) => Promise<boolean>;
  clearNotes: () => void;
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  loading: false,
  error: null,
  fetchRequestId: 0,

  fetchNotes: async (userId: string) => {
    const requestId = get().fetchRequestId + 1;
    set({ loading: true, error: null, fetchRequestId: requestId });

    try {
      const notes = await notesService.fetchNotes(userId);
      if (get().fetchRequestId !== requestId) {
        return;
      }
      set({ notes, loading: false });
    } catch (err) {
      if (get().fetchRequestId !== requestId) {
        return;
      }
      set({ loading: false, error: getErrorMessage(err, 'Impossible de charger les notes.') });
    }
  },

  createNote: async (userId: string, input: NoteInput) => {
    set({ error: null });

    try {
      const note = await notesService.createNote(userId, input);
      set({ notes: [note, ...get().notes] });
      return true;
    } catch (err) {
      set({ error: getErrorMessage(err, 'Impossible de créer la note.') });
      return false;
    }
  },

  updateNote: async (noteId: string, input: NoteInput) => {
    set({ error: null });

    try {
      const updated = await notesService.updateNote(noteId, input);
      set({
        notes: get().notes.map((note) => (note.id === noteId ? updated : note)),
      });
      return true;
    } catch (err) {
      set({ error: getErrorMessage(err, 'Impossible de modifier la note.') });
      return false;
    }
  },

  deleteNote: async (noteId: string) => {
    set({ error: null });

    try {
      await notesService.deleteNote(noteId);
      set({ notes: get().notes.filter((note) => note.id !== noteId) });
      return true;
    } catch (err) {
      set({ error: getErrorMessage(err, 'Impossible de supprimer la note.') });
      return false;
    }
  },

  clearNotes: () => {
    set((state) => ({
      notes: [],
      loading: false,
      error: null,
      fetchRequestId: state.fetchRequestId + 1,
    }));
  },
}));
