/** JWT авторизация из проекта Musik-grupp-JWT. Access остаётся только в памяти. */
const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'https://inai-col3.fishrungames.com/api')
  .replace(/\/+$/, '');

interface AccessResponse { access: string }
export interface ChatUser { username: string }

let accessToken: string | null = null;
let refreshInFlight: Promise<string> | null = null;
let sessionEpoch = 0;

export class SessionExpiredError extends Error {
  constructor() {
    super('Сессия истекла. Войдите снова.');
    this.name = 'SessionExpiredError';
  }
}

function getErrorMessage(payload: unknown, code: number): string {
  if (payload && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>;
    if (typeof obj.detail === 'string') return obj.detail;
    if (typeof obj.message === 'string') return obj.message;
    for (const [field, value] of Object.entries(obj)) {
      if (typeof value === 'string') return `${field}: ${value}`;
      if (Array.isArray(value)) return `${field}: ${value.map(String).join(', ')}`;
    }
  }
  return typeof payload === 'string' && payload ? payload : `Ошибка API (${code})`;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const raw = await response.text();
  let payload: unknown = null;
  try { payload = raw ? JSON.parse(raw) : null; } catch { payload = raw; }
  if (!response.ok) throw new Error(getErrorMessage(payload, response.status));
  return payload as T;
}

function extractAccess(data: AccessResponse): string {
  if (typeof data?.access !== 'string' || !data.access.trim()) {
    throw new Error('API не вернул access-токен.');
  }
  return data.access;
}

function decodeClaims(token: string): Record<string, unknown> | null {
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    const base64 = part.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(part.length / 4) * 4, '=');
    const result: unknown = JSON.parse(atob(base64));
    return result && typeof result === 'object' ? result as Record<string, unknown> : null;
  } catch { return null; }
}

function expiresSoon(token: string): boolean {
  const exp = decodeClaims(token)?.exp;
  return typeof exp !== 'number' || exp * 1000 - Date.now() <= 30_000;
}

function usernameFromToken(token: string): string {
  const username = decodeClaims(token)?.username;
  return typeof username === 'string' && username.trim() ? username : 'Участник';
}

async function credentialsRequest(endpoint: '/login/' | '/register/', username: string, password: string): Promise<ChatUser> {
  const epoch = ++sessionEpoch;
  accessToken = null;
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const token = extractAccess(await parseResponse<AccessResponse>(response));
  if (epoch !== sessionEpoch) throw new SessionExpiredError();
  accessToken = token;
  return { username: usernameFromToken(token) === 'Участник' ? username : usernameFromToken(token) };
}

function refreshAccess(): Promise<string> {
  if (refreshInFlight) return refreshInFlight;
  const epoch = sessionEpoch;
  const request = (async () => {
    const response = await fetch(`${API_BASE}/token/refresh/`, {
      method: 'POST',
      credentials: 'include',
    });
    const token = extractAccess(await parseResponse<AccessResponse>(response));
    if (epoch !== sessionEpoch) throw new SessionExpiredError();
    accessToken = token;
    return token;
  })();
  refreshInFlight = request;
  void request.finally(() => {
    if (refreshInFlight === request) refreshInFlight = null;
  }).catch(() => {});
  return request;
}

export async function getAccessToken(forceRefresh = false): Promise<string> {
  if (forceRefresh || !accessToken || expiresSoon(accessToken)) {
    try { return await refreshAccess(); }
    catch { accessToken = null; throw new SessionExpiredError(); }
  }
  return accessToken;
}

export async function restoreSession(): Promise<ChatUser | null> {
  try {
    const token = await refreshAccess();
    return { username: usernameFromToken(token) };
  } catch {
    accessToken = null;
    return null;
  }
}

export function login(username: string, password: string): Promise<ChatUser> {
  return credentialsRequest('/login/', username, password);
}

export function register(username: string, password: string): Promise<ChatUser> {
  return credentialsRequest('/register/', username, password);
}

export async function logout(): Promise<void> {
  // Отключаем локальную сессию ДО запроса, даже если сервер недоступен.
  const lastToken = accessToken;
  ++sessionEpoch;
  accessToken = null;
  const response = await fetch(`${API_BASE}/logout/`, {
    method: 'POST',
    credentials: 'include',
    headers: lastToken ? { Authorization: `Bearer ${lastToken}` } : {},
  });
  await parseResponse<unknown>(response);
}
