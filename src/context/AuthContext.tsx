import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { clearSession, loadSession, saveSession } from "../lib/authStorage";
import { getMe, loginUser, logoutUser, registerUser, type LoginPayload, type RegisterPayload } from "../lib/authApi";
import type { AuthUser, SessionState } from "../types/auth";

type AuthContextValue = {
  user: AuthUser | null;
  sessionToken: string;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string;
  login: (payload: LoginPayload) => Promise<boolean>;
  register: (payload: RegisterPayload) => Promise<boolean>;
  logout: () => Promise<void>;
  clearAuthError: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionState | null>(() => loadSession());
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    const savedSession = loadSession();

    if (!savedSession) {
      return;
    }

    setIsLoading(true);

    getMe(savedSession.sessionToken).then((response) => {
      if (response.ok) {
        const refreshedSession = {
          ...savedSession,
          user: response.data.user,
        };

        setSession(refreshedSession);
        saveSession(refreshedSession);
      } else {
        clearSession();
        setSession(null);
      }

      setIsLoading(false);
    });
  }, []);

  async function login(payload: LoginPayload) {
    setIsLoading(true);
    setAuthError("");

    const response = await loginUser(payload);

    setIsLoading(false);

    if (!response.ok) {
      setAuthError(response.error.message);
      return false;
    }

    const nextSession: SessionState = {
      sessionToken: response.data.sessionToken,
      user: response.data.user,
      expiresAt: response.data.expiresAt,
    };

    setSession(nextSession);
    saveSession(nextSession);
    return true;
  }

  async function register(payload: RegisterPayload) {
    setIsLoading(true);
    setAuthError("");

    const response = await registerUser(payload);

    setIsLoading(false);

    if (!response.ok) {
      setAuthError(response.error.message);
      return false;
    }

    const nextSession: SessionState = {
      sessionToken: response.data.sessionToken,
      user: response.data.user,
      expiresAt: response.data.expiresAt,
    };

    setSession(nextSession);
    saveSession(nextSession);
    return true;
  }

  async function logout() {
    if (session?.sessionToken) {
      await logoutUser(session.sessionToken);
    }

    clearSession();
    setSession(null);
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      sessionToken: session?.sessionToken ?? "",
      isAuthenticated: Boolean(session?.sessionToken),
      isLoading,
      authError,
      login,
      register,
      logout,
      clearAuthError: () => setAuthError(""),
    }),
    [authError, isLoading, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
