import { formatDaySectionLabel } from '@/lib/format';
import type { Note, NoteCategory } from '@/types/note';

export interface DayGroup {
  key: string;
  label: string;
  date: Date;
  isOverdue: boolean;
  notes: Note[];
}

export type NoteFilter = 'all' | 'todo' | 'overdue' | 'week' | 'completed';

export const NOTE_CATEGORY_LABELS: Record<NoteCategory, string> = {
  course: 'Cours',
  homework: 'Devoir',
  exam: 'Examen',
};

export const NOTE_FILTER_LABELS: Record<NoteFilter, string> = {
  all: 'Tous',
  todo: 'À faire',
  overdue: 'En retard',
  week: 'Cette semaine',
  completed: 'Terminés',
};

export const NOTE_FILTERS: NoteFilter[] = ['all', 'todo', 'overdue', 'week', 'completed'];

export function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function parseDueDate(iso: string | null): Date | null {
  if (!iso) {
    return null;
  }

  const parsed = new Date(iso.includes('T') ? iso : `${iso}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : startOfDay(parsed);
}

export function toIsoDateOnly(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isOverdue(note: Note): boolean {
  if (note.completed || !note.due_date) {
    return false;
  }

  const due = parseDueDate(note.due_date);
  if (!due) {
    return false;
  }

  return due < startOfDay(new Date());
}

export function isDueThisWeek(note: Note): boolean {
  if (!note.due_date) {
    return false;
  }

  const due = parseDueDate(note.due_date);
  if (!due) {
    return false;
  }

  const today = startOfDay(new Date());
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() + mondayOffset);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  return due >= weekStart && due <= weekEnd;
}

export function filterNotes(notes: Note[], filter: NoteFilter): Note[] {
  switch (filter) {
    case 'all':
      return notes;
    case 'todo':
      return notes.filter((note) => !note.completed);
    case 'overdue':
      return notes.filter(isOverdue);
    case 'week':
      return notes.filter((note) => !note.completed && isDueThisWeek(note));
    case 'completed':
      return notes.filter((note) => note.completed);
    default:
      return notes;
  }
}

export function sortNotes(notes: Note[]): Note[] {
  return [...notes].sort((a, b) => {
    const aDue = parseDueDate(a.due_date);
    const bDue = parseDueDate(b.due_date);

    if (aDue && bDue) {
      const diff = aDue.getTime() - bDue.getTime();
      if (diff !== 0) {
        return diff;
      }
    } else if (aDue) {
      return -1;
    } else if (bDue) {
      return 1;
    }

    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

export function getCurrentWeekBounds(): { weekStart: Date; weekEnd: Date } {
  const today = startOfDay(new Date());
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() + mondayOffset);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  return { weekStart, weekEnd };
}

export function getUpcomingWeekNotes(notes: Note[]): Note[] {
  return notes.filter(
    (note) => !note.completed && note.due_date && (isOverdue(note) || isDueThisWeek(note)),
  );
}

export function groupNotesByDay(notes: Note[]): DayGroup[] {
  const today = startOfDay(new Date());
  const upcoming = sortNotes(getUpcomingWeekNotes(notes));
  const groups = new Map<string, DayGroup>();

  for (const note of upcoming) {
    const due = parseDueDate(note.due_date);
    if (!due) {
      continue;
    }

    const key = toIsoDateOnly(due);
    const existing = groups.get(key);

    if (existing) {
      existing.notes.push(note);
      continue;
    }

    groups.set(key, {
      key,
      label: formatDaySectionLabel(due, today),
      date: due,
      isOverdue: due < today,
      notes: [note],
    });
  }

  return Array.from(groups.values()).sort((a, b) => a.date.getTime() - b.date.getTime());
}

export function getCategoryColors(category: NoteCategory) {
  switch (category) {
    case 'course':
      return {
        background: '#EFF6FF',
        text: '#2563EB',
        border: '#BFDBFE',
      };
    case 'homework':
      return {
        background: '#FFFBEB',
        text: '#D97706',
        border: '#FDE68A',
      };
    case 'exam':
      return {
        background: '#FEF2F2',
        text: '#DC2626',
        border: '#FECACA',
      };
  }
}
