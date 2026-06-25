export interface Note {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  user_id: string;
}

export interface NoteInput {
  title: string;
  description?: string | null;
}
