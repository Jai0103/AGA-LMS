import type { SessionState } from "../types/auth";

const STORAGE_KEY = "aga_lms_session";

export function saveSession(session: SessionState): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function loadSession(): SessionState | null {
  const rawValue = window.localStorage.getItem(STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as SessionState;
  } catch {
    clearSession();
    return null;
  }
}

export function clearSession(): void {
  window.localStorage.removeItem(STORAGE_KEY);
}
