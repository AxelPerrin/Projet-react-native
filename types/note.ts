export type NoteCategory = 'course' | 'homework' | 'exam';

export interface Note {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  user_id: string;
  category: NoteCategory;
  due_date: string | null;
  completed: boolean;
}

export interface NoteInput {
  title: string;
  description?: string | null;
  category?: NoteCategory;
  due_date?: string | null;
  completed?: boolean;
}
