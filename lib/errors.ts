const GENERIC_AUTH_ERROR = 'Une erreur est survenue. Veuillez réessayer.';

const SERVER_AUTH_ERROR =
  'Erreur serveur d\'authentification. Vérifiez vos identifiants ou recréez le compte depuis le tableau de bord Supabase.';

export type AuthErrorLike = {
  message?: string;
  code?: string;
  status?: number;
};

function looksLikeRawAuthResponse(message: string): boolean {
  const trimmed = message.trim();

  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    return true;
  }

  return (
    trimmed.includes('supabase.co/auth/v1') ||
    trimmed.includes('"unexpected_failure"') ||
    trimmed.includes('x-sb-error-code') ||
    trimmed.includes('grant_type=password')
  );
}

function looksLikeTechnicalMessage(message: string): boolean {
  const lower = message.toLowerCase();

  return (
    looksLikeRawAuthResponse(message) ||
    lower.includes('http://') ||
    lower.includes('https://') ||
    /\bstatus\s*[:=]\s*\d{3}\b/.test(lower) ||
    lower.includes('fetch failed') ||
    lower.includes('network request failed')
  );
}

function parseJsonAuthMessage(message: string): AuthErrorLike | null {
  const trimmed = message.trim();

  if (!trimmed.startsWith('{')) {
    return null;
  }

  try {
    const parsed = JSON.parse(trimmed) as Record<string, unknown>;
    const nestedError =
      parsed.error && typeof parsed.error === 'object'
        ? (parsed.error as Record<string, unknown>)
        : null;

    return {
      message:
        (typeof parsed.msg === 'string' && parsed.msg) ||
        (typeof parsed.message === 'string' && parsed.message) ||
        (typeof nestedError?.message === 'string' && nestedError.message) ||
        message,
      code:
        (typeof parsed.code === 'string' && parsed.code) ||
        (typeof parsed.error_code === 'string' && parsed.error_code) ||
        (typeof nestedError?.code === 'string' && nestedError.code) ||
        undefined,
      status:
        (typeof parsed.status === 'number' && parsed.status) ||
        (typeof parsed.statusCode === 'number' && parsed.statusCode) ||
        undefined,
    };
  } catch {
    return null;
  }
}

function normalizeAuthErrorInput(error: unknown): AuthErrorLike {
  if (typeof error === 'string') {
    return parseJsonAuthMessage(error) ?? { message: error };
  }

  if (error instanceof Error) {
    const parsed = parseJsonAuthMessage(error.message);
    if (parsed) return parsed;

    // Supabase AuthError extends Error and carries `code` and `status` — preserve them.
    const asAuthLike = error as unknown as AuthErrorLike;
    return {
      message: error.message,
      code: typeof asAuthLike.code === 'string' ? asAuthLike.code : undefined,
      status: typeof asAuthLike.status === 'number' ? asAuthLike.status : undefined,
    };
  }

  if (error && typeof error === 'object') {
    const candidate = error as AuthErrorLike;
    const message = typeof candidate.message === 'string' ? candidate.message : '';
    return parseJsonAuthMessage(message) ?? candidate;
  }

  return { message: '' };
}

export function mapSupabaseError(error: { message: string; code?: string }): string {
  if (error.code === '23505') {
    return 'Cette entrée existe déjà.';
  }
  if (error.code === '42501') {
    return 'Accès refusé.';
  }
  return error.message || GENERIC_AUTH_ERROR;
}

export type AuthErrorDetails = {
  message: string;
  retryAfterSeconds?: number;
};

function parseRetryAfterSeconds(message: string): number | null {
  const match = message.match(/after\s+(\d+)\s+seconds?/i);
  if (!match) {
    return null;
  }

  const seconds = Number.parseInt(match[1], 10);
  return Number.isFinite(seconds) && seconds > 0 ? seconds : null;
}

export function formatAuthRetryMessage(seconds: number): string {
  if (seconds <= 1) {
    return 'Pour des raisons de sécurité, veuillez patienter 1 seconde avant de réessayer.';
  }

  return `Pour des raisons de sécurité, veuillez patienter ${seconds} secondes avant de réessayer.`;
}

function isSecurityCooldownError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes('for security purposes') ||
    lower.includes('you can only request this')
  );
}

/**
 * Maps Supabase Auth errors to French UI messages.
 *
 * Never surfaces raw JSON, URLs, or HTTP details to the user.
 *
 * Supabase free tier limits auth e-mails (~2 per hour). For local dev, disable
 * "Confirm email" in Dashboard → Authentication → Providers → Email.
 *
 * Do not create auth users via SQL with crypt() — GoTrue expects its own hash
 * format. Use Dashboard → Authentication → Users → Add user (Auto Confirm).
 */
export function mapAuthErrorDetails(error: unknown): AuthErrorDetails {
  const authError = normalizeAuthErrorInput(error);
  const message = (authError.message ?? '').toLowerCase();
  const code = (authError.code ?? '').toLowerCase();
  const rawMessage = authError.message?.trim() ?? '';

  if (
    authError.status === 500 ||
    code === 'unexpected_failure' ||
    message.includes('unexpected_failure') ||
    message.includes('internal server error')
  ) {
    return { message: SERVER_AUTH_ERROR };
  }

  if (isSecurityCooldownError(rawMessage)) {
    const seconds = parseRetryAfterSeconds(rawMessage) ?? 60;
    return {
      message: formatAuthRetryMessage(seconds),
      retryAfterSeconds: seconds,
    };
  }

  if (
    code === 'over_email_send_rate_limit' ||
    message.includes('email rate limit exceeded')
  ) {
    return {
      message:
        'Limite d’envoi d’e-mails atteinte (environ 2 par heure avec l’e-mail Supabase). Attendez quelques minutes, ou désactivez la confirmation par e-mail pour le développement.',
    };
  }

  if (code === 'over_request_rate_limit') {
    return {
      message: 'Trop de requêtes depuis cette connexion. Veuillez patienter quelques minutes avant de réessayer.',
    };
  }

  if (
    code === 'invalid_credentials' ||
    message.includes('invalid login credentials') ||
    message.includes('invalid_credentials')
  ) {
    return { message: 'E-mail ou mot de passe incorrect.' };
  }

  if (message.includes('email not confirmed')) {
    return { message: 'Confirmez votre e-mail avant de vous connecter.' };
  }

  if (message.includes('user already registered')) {
    return { message: 'Un compte existe déjà avec cet e-mail.' };
  }

  if (
    code === 'invalid_email' ||
    message.includes('unable to validate email address') ||
    message.includes('invalid email')
  ) {
    return { message: 'Adresse e-mail invalide. Vérifiez votre saisie.' };
  }

  if (!rawMessage || looksLikeTechnicalMessage(rawMessage)) {
    return { message: GENERIC_AUTH_ERROR };
  }

  return { message: rawMessage };
}

export function mapAuthError(error: unknown): string {
  return mapAuthErrorDetails(error).message;
}

export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    const mapped = mapAuthError(error);
    return mapped === GENERIC_AUTH_ERROR ? fallback : mapped;
  }

  return fallback;
}
