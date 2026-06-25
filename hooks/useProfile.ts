import { useCallback, useState } from 'react';

import { mapAuthError } from '@/lib/errors';
import { useAuth } from '@/providers/AuthProvider';
import { useNotesStore } from '@/store/notesStore';

interface UseProfileResult {
  email: string;
  isSigningOut: boolean;
  errorMessage: string | null;
  signOut: () => Promise<void>;
}

export function useProfile(): UseProfileResult {
  const { user, signOut: authSignOut } = useAuth();
  const clearNotes = useNotesStore((state) => state.clearNotes);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const signOut = useCallback(async () => {
    setIsSigningOut(true);
    setErrorMessage(null);

    const { error } = await authSignOut();

    if (!error) {
      clearNotes();
    }

    setIsSigningOut(false);

    if (error) {
      setErrorMessage(mapAuthError(error));
    }
  }, [authSignOut, clearNotes]);

  return {
    email: user?.email ?? 'Non connecté',
    isSigningOut,
    errorMessage,
    signOut,
  };
}
