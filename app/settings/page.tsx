"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useSettings } from "@/lib/settings-context";

function LogoIcon({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="24" fill="url(#logo-settings)" />
      <path d="M24 12c-5.5 0-10 4-10 9 0 3 1.5 5.6 3.8 7.2.2.2.2.4.2.7l-.5 3.1c-.1.5.4.9.8.7l3.3-1.5c.2-.1.4-.1.6 0 .6.1 1.2.2 1.8.2 5.5 0 10-4 10-9s-4.5-9-10-9z" fill="white" opacity="0.95"/>
      <circle cx="19.5" cy="20.5" r="1.5" fill="#6b5870"/>
      <circle cx="24" cy="20.5" r="1.5" fill="#6b5870"/>
      <circle cx="28.5" cy="20.5" r="1.5" fill="#6b5870"/>
      <defs>
        <linearGradient id="logo-settings" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#191919"/><stop offset="1" stopColor="#6b5870"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

const FONT_SIZES = [
  {
    value: "normal" as const,
    label: "Normal",
    sublabel: "Tamaño estándar (18px)",
    preview: "Así se ve el texto con este tamaño",
    fontSize: "1rem",
  },
  {
    value: "large" as const,
    label: "Grande",
    sublabel: "Texto más grande (20px)",
    preview: "Así se ve el texto con este tamaño",
    fontSize: "1.11rem",
  },
  {
    value: "xlarge" as const,
    label: "Muy grande",
    sublabel: "Texto extra grande (22px)",
    preview: "Así se ve el texto con este tamaño",
    fontSize: "1.22rem",
  },
];

const THEMES = [
  {
    value: "light" as const,
    label: "Claro",
    sublabel: "Fondo claro, texto oscuro",
    bg: "#fbf9f4",
    surface: "#e5e2dd",
    accent: "#f1d8f4",
    text: "#191919",
  },
  {
    value: "dark" as const,
    label: "Oscuro",
    sublabel: "Fondo oscuro, texto claro",
    bg: "#1a1a1e",
    surface: "#38383d",
    accent: "#3d2d42",
    text: "#f0ece7",
  },
];

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { settings, loading: settingsLoading, updateSettings } = useSettings();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, authLoading, router]);

  if (authLoading || settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--color-bg-main)" }}>
        <div className="text-center">
          <LogoIcon className="w-14 h-14 mx-auto mb-4 animate-pulse" />
          <p className="text-base" style={{ color: "var(--color-text-secondary)" }}>
            Cargando...
          </p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const currentFontSize = settings?.font_size || "normal";
  const currentTheme = settings?.theme || "light";

  return (
    <div className="min-h-screen" style={{ background: "var(--color-bg-main)" }}>
      {/* Header */}
      <header className="py-4 px-6 md:px-12" style={{ background: "var(--color-bg-card)" }}>
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/chatbot" className="flex items-center gap-3">
            <LogoIcon className="w-10 h-10" />
            <span className="text-lg font-bold" style={{ color: "var(--color-primary)" }}>
              MenteViva
            </span>
          </Link>
          <Link
            href="/chatbot"
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-base transition-all"
            style={{ color: "var(--color-text-secondary)", background: "var(--color-bg-secondary)" }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12 4l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Volver al chat
          </Link>
        </div>
      </header>

      <main id="main-content" className="px-6 md:px-12 py-10">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--color-text-primary)" }}>
            Ajustes de apariencia
          </h1>
          <p className="text-lg mb-10" style={{ color: "var(--color-text-secondary)" }}>
            Personaliza cómo se ve MenteViva para ti
          </p>

          {/* Font Size Section */}
          <section className="mb-12">
            <h2 className="text-xl font-bold mb-2" style={{ color: "var(--color-text-primary)" }}>
              Tamaño del texto
            </h2>
            <p className="text-base mb-6" style={{ color: "var(--color-text-secondary)" }}>
              Elige el tamaño que te resulte más cómodo para leer
            </p>

            <div className="space-y-4">
              {FONT_SIZES.map((option) => {
                const isActive = currentFontSize === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => updateSettings({ font_size: option.value })}
                    className="w-full text-left p-6 rounded-xl transition-all duration-200"
                    style={{
                      background: isActive ? "var(--secondary-container)" : "var(--color-bg-card)",
                      boxShadow: isActive ? "var(--shadow-md)" : "var(--shadow-sm)",
                    }}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-bold text-lg" style={{ color: "var(--color-text-primary)" }}>
                          {option.label}
                        </p>
                        <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                          {option.sublabel}
                        </p>
                      </div>
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                        style={{
                          background: isActive ? "var(--secondary)" : "var(--surface-container-high)",
                        }}
                      >
                        {isActive && (
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M3 8l4 4 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                    </div>
                    {/* Preview */}
                    <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--color-border)" }}>
                      <p style={{ color: "var(--color-text-muted)", fontSize: option.fontSize }}>
                        {option.preview}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Theme Section */}
          <section className="mb-12">
            <h2 className="text-xl font-bold mb-2" style={{ color: "var(--color-text-primary)" }}>
              Tema de colores
            </h2>
            <p className="text-base mb-6" style={{ color: "var(--color-text-secondary)" }}>
              Elige entre un fondo claro o un fondo oscuro
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {THEMES.map((option) => {
                const isActive = currentTheme === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => updateSettings({ theme: option.value })}
                    className="text-left p-6 rounded-xl transition-all duration-200"
                    style={{
                      background: isActive ? "var(--secondary-container)" : "var(--color-bg-card)",
                      boxShadow: isActive ? "var(--shadow-md)" : "var(--shadow-sm)",
                    }}
                  >
                    {/* Theme preview swatch */}
                    <div
                      className="w-full h-24 rounded-lg mb-5 flex flex-col items-center justify-center gap-2 overflow-hidden"
                      style={{ background: option.bg }}
                    >
                      <div className="flex gap-2">
                        <div className="w-20 h-3 rounded-full" style={{ background: option.surface }} />
                        <div className="w-10 h-3 rounded-full" style={{ background: option.accent }} />
                      </div>
                      <div className="flex gap-2">
                        <div className="w-12 h-3 rounded-full" style={{ background: option.accent }} />
                        <div className="w-16 h-3 rounded-full" style={{ background: option.surface }} />
                      </div>
                      <p className="text-xs font-medium mt-1" style={{ color: option.text }}>
                        Hola, ¿en qué te ayudo?
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-bold text-lg" style={{ color: "var(--color-text-primary)" }}>
                          {option.label}
                        </p>
                        <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                          {option.sublabel}
                        </p>
                      </div>
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                        style={{
                          background: isActive ? "var(--secondary)" : "var(--surface-container-high)",
                        }}
                      >
                        {isActive && (
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M3 8l4 4 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Info note */}
          <div
            className="p-5 rounded-xl"
            style={{ background: "var(--secondary-container)" }}
          >
            <p className="text-sm font-medium" style={{ color: "var(--on-secondary-container)" }}>
              Los cambios se aplican automáticamente y se guardan en tu cuenta.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
