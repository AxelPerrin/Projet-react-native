import type { AuthError, Session, User } from '@supabase/supabase-js';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { sessionAccessToken } from '@/lib/auth';
import { mapAuthError } from '@/lib/errors';
import { supabase } from '@/lib/supabase';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const sessionTokenRef = useRef<string | null>(null);
  const signUpInFlightRef = useRef(false);
  const authTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (!mounted) {
        return;
      }

      sessionTokenRef.current = sessionAccessToken(currentSession);
      setSession(currentSession);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      // Defer state updates to avoid Supabase auth deadlocks (see Supabase RN docs).
      const timeoutId = setTimeout(() => {
        authTimeoutsRef.current = authTimeoutsRef.current.filter((id) => id !== timeoutId);

        if (!mounted) {
          return;
        }

        const nextToken = sessionAccessToken(nextSession);
        if (sessionTokenRef.current !== nextToken) {
          sessionTokenRef.current = nextToken;
          setSession(nextSession);
        }

        setLoading(false);
      }, 0);
      authTimeoutsRef.current.push(timeoutId);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
      authTimeoutsRef.current.forEach(clearTimeout);
      authTimeoutsRef.current = [];
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error ? mapAuthError(error) : null };
    } catch (err) {
      return { error: mapAuthError(err) };
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    if (signUpInFlightRef.current) {
      return { error: 'Inscription déjà en cours.' };
    }

    signUpInFlightRef.current = true;

    try {
      const { data, error } = await supabase.auth.signUp({ email, password });

      if (error) {
        return { error: mapAuthError(error) };
      }

      // Prevent redirect loops: discard unconfirmed sessions after signup.
      if (data.session && !data.user?.email_confirmed_at) {
        await supabase.auth.signOut({ scope: 'local' });
      }

      return { error: null };
    } catch (err) {
      return { error: mapAuthError(err) };
    } finally {
      signUpInFlightRef.current = false;
    }
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      signIn,
      signUp,
      signOut,
    }),
    [session, loading, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider.');
  }

  return context;
}
