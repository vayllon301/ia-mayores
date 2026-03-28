"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { getUserSettings, updateUserSettings, type UserSettings } from "@/lib/settings";

interface SettingsContextType {
  settings: UserSettings | null;
  loading: boolean;
  updateSettings: (updates: Partial<Omit<UserSettings, "id">>) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: null,
  loading: true,
  updateSettings: async () => {},
});

const DARK_VARS: Record<string, string> = {
  "--surface": "#1a1a1e",
  "--surface-container-lowest": "#141417",
  "--surface-container-low": "#1e1e22",
  "--surface-container": "#232328",
  "--surface-container-high": "#2d2d32",
  "--surface-container-highest": "#38383d",
  "--surface-variant": "#2a2a2f",
  "--primary": "#f0ece7",
  "--primary-container": "#8a7590",
  "--on-primary": "#191919",
  "--secondary": "#c4a5cb",
  "--secondary-container": "#3d2d42",
  "--secondary-fixed-dim": "#2d2233",
  "--on-secondary-container": "#f1d8f4",
  "--outline": "#8a8590",
  "--color-primary": "#c4a5cb",
  "--color-primary-dark": "#d4b5db",
  "--color-primary-light": "#a88aae",
  "--color-primary-muted": "rgba(196, 165, 203, 0.1)",
  "--color-accent": "#c4a5cb",
  "--color-accent-dark": "#d4b5db",
  "--color-accent-light": "#3d2d42",
  "--color-bg-main": "#1a1a1e",
  "--color-bg-secondary": "#232328",
  "--color-bg-card": "#2d2d32",
  "--color-text-primary": "#f0ece7",
  "--color-text-secondary": "#b5b0b8",
  "--color-text-muted": "#8a8590",
  "--color-success": "#68d391",
  "--color-error": "#fc8181",
  "--color-warning": "#f6ad55",
  "--color-border": "rgba(180, 175, 185, 0.12)",
  "--color-border-focus": "#c4a5cb",
  "--shadow-sm": "0 4px 12px rgba(0, 0, 0, 0.2)",
  "--shadow-md": "0 8px 24px rgba(0, 0, 0, 0.25)",
  "--shadow-lg": "0 12px 32px rgba(0, 0, 0, 0.3)",
  "--shadow-xl": "0 20px 40px rgba(0, 0, 0, 0.35)",
};

const FONT_SIZES: Record<string, string> = {
  normal: "18px",
  large: "20px",
  xlarge: "22px",
};

function applySettings(settings: UserSettings | null) {
  const html = document.documentElement;

  // Font size — set directly as inline style for max specificity
  const size = FONT_SIZES[settings?.font_size || "normal"] || "18px";
  html.style.fontSize = size;

  // Theme — set CSS custom properties directly on html element
  if (settings?.theme === "dark") {
    html.classList.add("dark");
    html.dataset.theme = "dark";
    html.style.colorScheme = "dark";
    for (const [prop, val] of Object.entries(DARK_VARS)) {
      html.style.setProperty(prop, val);
    }
  } else {
    html.classList.remove("dark");
    html.dataset.theme = "light";
    html.style.colorScheme = "light";
    for (const prop of Object.keys(DARK_VARS)) {
      html.style.removeProperty(prop);
    }
  }
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setSettings(null);
      setLoading(false);
      return;
    }

    getUserSettings(user.id).then((s) => {
      setSettings(s);
      setLoading(false);
    });
  }, [user, authLoading]);

  // Apply settings to DOM whenever they change
  useEffect(() => {
    applySettings(settings);
  }, [settings]);

  const handleUpdate = useCallback(
    async (updates: Partial<Omit<UserSettings, "id">>) => {
      if (!user) return;
      setSettings((prev) => {
        const base = prev || { id: user.id, font_size: "normal" as const, theme: "light" as const };
        const next = { ...base, ...updates } as UserSettings;
        // Apply immediately for instant feedback
        applySettings(next);
        return next;
      });
      await updateUserSettings(user.id, updates);
    },
    [user]
  );

  return (
    <SettingsContext.Provider value={{ settings, loading, updateSettings: handleUpdate }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
