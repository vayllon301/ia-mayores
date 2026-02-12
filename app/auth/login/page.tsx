"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";

function LogoIcon({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="24" fill="url(#logo-login)" />
      <path d="M24 12c-5.5 0-10 4-10 9 0 3 1.5 5.6 3.8 7.2.2.2.2.4.2.7l-.5 3.1c-.1.5.4.9.8.7l3.3-1.5c.2-.1.4-.1.6 0 .6.1 1.2.2 1.8.2 5.5 0 10-4 10-9s-4.5-9-10-9z" fill="white" opacity="0.95"/>
      <circle cx="19.5" cy="20.5" r="1.5" fill="#1a7a6d"/>
      <circle cx="24" cy="20.5" r="1.5" fill="#1a7a6d"/>
      <circle cx="28.5" cy="20.5" r="1.5" fill="#1a7a6d"/>
      <defs>
        <linearGradient id="logo-login" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1a7a6d"/><stop offset="1" stopColor="#22a196"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const redirectTo = searchParams.get("redirect") || "/chatbot";

  useEffect(() => {
    if (user) {
      router.push(redirectTo);
      router.refresh();
    }
  }, [user, redirectTo, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        if (authError.message.includes("Invalid login")) {
          setError("El correo o la contraseña no son correctos. Por favor, revísalos.");
        } else if (authError.message.includes("Email not confirmed")) {
          setError("Necesitas confirmar tu correo electrónico. Revisa tu bandeja de entrada.");
        } else {
          setError("Ha ocurrido un error. Por favor, inténtalo de nuevo.");
        }
        setLoading(false);
        return;
      }

      if (data.session) {
        setTimeout(() => {
          router.push(redirectTo);
          router.refresh();
        }, 100);
      }
    } catch (err) {
      setError("Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.");
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (authError) {
        setError("Ha ocurrido un error con Google. Por favor, inténtalo de nuevo.");
        setLoading(false);
      }
    } catch (err) {
      setError("Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--color-bg-main)' }}>
      {/* Left decorative panel — hidden on mobile */}
      <div className="hidden lg:flex lg:w-[45%] gradient-warm relative overflow-hidden items-center justify-center p-12">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10" style={{ background: 'white', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10" style={{ background: 'white', transform: 'translate(-30%, 30%)' }} />
        <div className="absolute top-1/2 left-1/4 w-20 h-20 rounded-full opacity-5" style={{ background: 'white' }} />

        <div className="relative z-10 text-center max-w-md">
          <div className="mb-8 animate-float">
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="60" cy="60" r="56" stroke="white" strokeWidth="2" opacity="0.3" fill="none"/>
              <circle cx="60" cy="60" r="40" fill="white" opacity="0.15"/>
              <path d="M60 30c-14 0-25 10-25 22.5 0 7.5 3.8 14 9.5 18 .5.5.5 1 .5 1.8l-1.3 7.7c-.3 1.3 1 2.3 2 1.8l8.3-3.8c.5-.3 1-.3 1.5 0 1.5.3 3 .5 4.5.5 14 0 25-10 25-22.5S74 30 60 30z" fill="white" opacity="0.9"/>
              <circle cx="50" cy="51" r="3" fill="#1a7a6d"/>
              <circle cx="60" cy="51" r="3" fill="#1a7a6d"/>
              <circle cx="70" cy="51" r="3" fill="#1a7a6d"/>
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Bienvenido de vuelta
          </h2>
          <p className="text-lg text-white opacity-80 leading-relaxed">
            Tu compañero inteligente te espera para seguir ayudándote en lo que necesites.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-3 mb-6">
              <LogoIcon className="w-12 h-12" />
              <span className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>MenteViva</span>
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              ¡Hola de nuevo!
            </h1>
            <p className="text-base" style={{ color: 'var(--color-text-secondary)' }}>
              Inicia sesión para continuar
            </p>
          </div>

          {/* Form Card */}
          <div className="card" style={{ padding: '2rem' }}>
            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <div
                  className="p-4 rounded-lg flex items-start gap-3 animate-fade-in"
                  style={{ background: '#fef2f2', border: '1px solid #fecaca', color: 'var(--color-error)' }}
                  role="alert"
                  aria-live="polite"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="flex-shrink-0 mt-0.5">
                    <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" fill="none"/>
                    <path d="M10 6v4m0 4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <span className="text-sm font-medium">{error}</span>
                </div>
              )}

              <div>
                <label htmlFor="email" className="label">
                  Correo electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  placeholder="correo@ejemplo.com"
                  required
                  autoComplete="email"
                  aria-describedby="email-help"
                />
              </div>

              <div>
                <label htmlFor="password" className="label">
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                  placeholder="Tu contraseña"
                  required
                  autoComplete="current-password"
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.3" fill="none"/>
                      <path d="M12 2a10 10 0 019.5 6.8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none"/>
                    </svg>
                    Entrando...
                  </span>
                ) : (
                  "Iniciar sesión"
                )}
              </button>

              {/* Divider */}
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full" style={{ borderTopWidth: '1px', borderTopColor: 'var(--color-border)', borderTopStyle: 'solid' }}></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 text-sm font-medium" style={{ color: 'var(--color-text-muted)', background: 'var(--color-bg-card)' }}>
                    o continúa con
                  </span>
                </div>
              </div>

              {/* Google */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="btn w-full flex items-center justify-center gap-3"
                style={{
                  background: 'var(--color-bg-card)',
                  color: 'var(--color-text-primary)',
                  border: '2px solid var(--color-border)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary-light)'; e.currentTarget.style.background = 'var(--color-primary-muted)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.background = 'var(--color-bg-card)'; }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continuar con Google
              </button>
            </form>

            {/* Register link */}
            <div className="mt-6 pt-5 text-center" style={{ borderTop: '1px solid var(--color-border)' }}>
              <p className="text-base" style={{ color: 'var(--color-text-secondary)' }}>
                ¿No tienes cuenta?{" "}
                <Link
                  href="/auth/register"
                  className="font-bold underline underline-offset-2"
                  style={{ color: 'var(--color-primary)' }}
                >
                  Crear cuenta gratis
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg-main)' }}>
        <div className="text-center">
          <LogoIcon className="w-14 h-14 mx-auto mb-4 animate-pulse" />
          <p className="text-base" style={{ color: 'var(--color-text-secondary)' }}>
            Cargando...
          </p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
