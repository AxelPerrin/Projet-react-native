import { mapSupabaseError } from '@/lib/errors';
import { supabase } from '@/lib/supabase';
import type { Note, NoteInput } from '@/types/note';

export async function fetchNotes(userId: string): Promise<Note[]> {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(mapSupabaseError(error));
  }

  return data ?? [];
}

export async function createNote(userId: string, input: NoteInput): Promise<Note> {
  const { data, error } = await supabase
    .from('notes')
    .insert({
      title: input.title.trim(),
      description: input.description?.trim() || null,
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
  const { data, error } = await supabase
    .from('notes')
    .update({
      title: input.title.trim(),
      description: input.description?.trim() || null,
    })
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
