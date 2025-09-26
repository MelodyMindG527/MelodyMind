export const apiUrl = process.env.REACT_APP_API_BASE || 'http://localhost:8000';

function getStoredToken(): string | null {
  try {
    return localStorage.getItem('token');
  } catch (_e) {
    return null;
  }
}

export function buildAuthHeaders(extra?: HeadersInit): HeadersInit {
  const token = getStoredToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return { ...headers, ...(extra || {}) };
}

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const url = path.startsWith('http') ? path : `${apiUrl}${path}`;
  const token = getStoredToken();

  const defaultHeaders: Record<string, string> = {};
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const merged: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
    },
  };

  return fetch(url, merged);
}


