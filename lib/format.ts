export function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatDueDate(isoDate: string): string {
  const date = new Date(isoDate.includes('T') ? isoDate : `${isoDate}T00:00:00`);
  return date.toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

export function formatDaySectionLabel(date: Date, today: Date): string {
  const startToday = new Date(today);
  startToday.setHours(0, 0, 0, 0);
  const startDate = new Date(date);
  startDate.setHours(0, 0, 0, 0);
  const diff = Math.round((startDate.getTime() - startToday.getTime()) / (1000 * 60 * 60 * 24));

  if (diff === 0) {
    return "Aujourd'hui";
  }
  if (diff === 1) {
    return 'Demain';
  }

  const formatted = date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  if (diff < 0) {
    return `${formatted} · En retard`;
  }

  return formatted;
}

export function formatWeekRange(weekStart: Date, weekEnd: Date): string {
  const sameMonth = weekStart.getMonth() === weekEnd.getMonth();
  const sameYear = weekStart.getFullYear() === weekEnd.getFullYear();

  const start = weekStart.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: sameMonth ? undefined : 'short',
  });

  const end = weekEnd.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: sameYear ? undefined : 'numeric',
  });

  return `${start} – ${end}`;
}
