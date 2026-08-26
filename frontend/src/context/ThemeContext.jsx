import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";
import { updateMyPreferencesApi } from "../api/profile.api";

const STORAGE_KEY = "trove.theme";
const ThemeContext = createContext(null);

function resolveEffective(theme) {
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return theme;
}

function applyTheme(effective) {
  document.documentElement.classList.toggle("dark", effective === "dark");
}

export function ThemeProvider({ children }) {
  const { user, isAuthenticated } = useAuth();

  const [theme, setThemeState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || "light";
    } catch {
      return "light";
    }
  });

  // Apply immediately on every theme change (and on first mount).
  useEffect(() => {
    applyTheme(resolveEffective(theme));
  }, [theme]);

  // Track OS-level changes while "system" is selected.
  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme(resolveEffective("system"));
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);

  // Once the logged-in user's own saved preference loads, adopt it as the
  // source of truth (overriding whatever localStorage had, e.g. after
  // logging in on a new device/browser).
  useEffect(() => {
    const savedTheme = user?.preferences?.theme;
    if (isAuthenticated && savedTheme && savedTheme !== theme) {
      setThemeState(savedTheme);
      try {
        localStorage.setItem(STORAGE_KEY, savedTheme);
      } catch {
        // ignore
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.preferences?.theme, isAuthenticated]);

  const setTheme = useCallback(
    (next) => {
      setThemeState(next);
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // ignore — still applies for this tab/session
      }
      if (isAuthenticated) {
        // Best-effort: persist to the user's account so it follows them to
        // their next login. Never blocks the immediate visual change above.
        updateMyPreferencesApi({ theme: next }).catch(() => {});
      }
    },
    [isAuthenticated]
  );

  const toggleTheme = useCallback(() => {
    setTheme(resolveEffective(theme) === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  const value = useMemo(
    () => ({ theme, effectiveTheme: resolveEffective(theme), setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
