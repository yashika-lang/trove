import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getCurrentUserApi, loginApi, logoutApi } from "../api/auth.api";

const STORAGE_KEY = "trove.auth.user";

const AuthContext = createContext(null);

// The backend sets the real access/refresh tokens as httpOnly cookies
// (backend/src/controllers/auth.controller.js) — JS never reads or stores
// those directly. We only cache the last-known user object client-side so
// the UI can render immediately; every real permission check still happens
// server-side via the cookie on each request.
function readCachedUser() {
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY) ?? sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeCachedUser(user, rememberMe) {
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
  if (!user) return;
  const store = rememberMe ? localStorage : sessionStorage;
  store.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readCachedUser);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    // On app load, verify the cached user against the real session
    // (GET /api/v1/auth/current-user, protected by verifyJWT). If the
    // cookie is missing/expired, this clears the stale cached user.
    getCurrentUserApi()
      .then((freshUser) => {
        setUser(freshUser);
        writeCachedUser(freshUser, Boolean(localStorage.getItem(STORAGE_KEY)));
      })
      .catch(() => {
        setUser(null);
        writeCachedUser(null, false);
      })
      .finally(() => setIsBootstrapping(false));
  }, []);

  const login = useCallback(async ({ email, password, rememberMe }) => {
    const result = await loginApi({ email, password });
    setUser(result.user);
    writeCachedUser(result.user, Boolean(rememberMe));
    return result.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } finally {
      setUser(null);
      writeCachedUser(null, false);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isBootstrapping,
      login,
      logout,
    }),
    [user, isBootstrapping, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
