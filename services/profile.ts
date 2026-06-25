import { mapSupabaseError } from '@/lib/errors';
import { supabase } from '@/lib/supabase';

export async function upsertExpoPushToken(userId: string, token: string): Promise<void> {
  const { error } = await supabase.from('profiles').upsert(
    {
      id: userId,
      expo_push_token: token,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' },
  );

  if (error) {
    throw new Error(mapSupabaseError(error));
  }
}
