import { mapSupabaseError } from '@/lib/errors';
import { supabase } from '@/lib/supabase';

const AVATARS_BUCKET = 'avatars';

function avatarStoragePath(userId: string): string {
  return `${userId}/avatar.jpg`;
}

export async function fetchProfileAvatarUrl(userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('avatar_url')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(mapSupabaseError(error));
  }

  return data?.avatar_url ?? null;
}

export async function uploadProfileAvatar(userId: string, localUri: string): Promise<string> {
  const path = avatarStoragePath(userId);
  const response = await fetch(localUri);

  if (!response.ok) {
    throw new Error('Impossible de lire la photo.');
  }

  const arrayBuffer = await response.arrayBuffer();
  const contentType = response.headers.get('Content-Type') ?? 'image/jpeg';

  const { error: uploadError } = await supabase.storage.from(AVATARS_BUCKET).upload(path, arrayBuffer, {
    contentType,
    upsert: true,
  });

  if (uploadError) {
    throw new Error(mapSupabaseError(uploadError));
  }

  const { data: publicUrlData } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(path);
  const avatarUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;

  const { error: profileError } = await supabase.from('profiles').upsert(
    {
      id: userId,
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' },
  );

  if (profileError) {
    throw new Error(mapSupabaseError(profileError));
  }

  return avatarUrl;
}

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
