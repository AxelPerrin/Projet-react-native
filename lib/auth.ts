import type { Session } from '@supabase/supabase-js';

export function isAuthenticated(session: Session | null): boolean {
  if (!session?.user) {
    return false;
  }

  // With "Confirm email" ON, Supabase may briefly issue a session before confirmation.
  return Boolean(session.user.email_confirmed_at);
}

export function sessionAccessToken(session: Session | null): string | null {
  return session?.access_token ?? null;
}
