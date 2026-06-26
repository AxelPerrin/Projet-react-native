import { mapSupabaseError } from '@/lib/errors';
import { supabase } from '@/lib/supabase';
import type { Note, NoteInput } from '@/types/note';

function mapNoteInput(input: NoteInput) {
  return {
    title: input.title.trim(),
    description: input.description?.trim() || null,
    category: input.category ?? 'homework',
    due_date: input.due_date ?? null,
    completed: input.completed ?? false,
  };
}

export async function fetchNotes(userId: string): Promise<Note[]> {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(mapSupabaseError(error));
  }

  return (data ?? []).map((note) => ({
    ...note,
    category: note.category ?? 'homework',
    due_date: note.due_date ?? null,
    completed: note.completed ?? false,
  }));
}

export async function createNote(userId: string, input: NoteInput): Promise<Note> {
  const payload = mapNoteInput(input);

  const { data, error } = await supabase
    .from('notes')
    .insert({
      ...payload,
      user_id: userId,
    })
    .select()
    .single();

  if (error) {
    throw new Error(mapSupabaseError(error));
  }

  return data;
}

export async function updateNote(noteId: string, input: NoteInput): Promise<Note> {
  const payload = mapNoteInput(input);

  const { data, error } = await supabase
    .from('notes')
    .update(payload)
    .eq('id', noteId)
    .select()
    .single();

  if (error) {
    throw new Error(mapSupabaseError(error));
  }

  return data;
}

export async function toggleNoteCompleted(noteId: string, completed: boolean): Promise<Note> {
  const { data, error } = await supabase
    .from('notes')
    .update({ completed })
    .eq('id', noteId)
    .select()
    .single();

  if (error) {
    throw new Error(mapSupabaseError(error));
  }

  return data;
}

export async function deleteNote(noteId: string): Promise<void> {
  const { error } = await supabase.from('notes').delete().eq('id', noteId);

  if (error) {
    throw new Error(mapSupabaseError(error));
  }
}
