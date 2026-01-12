"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Obtener la URL de redirección desde los parámetros de búsqueda
  const redirectTo = searchParams.get("redirect") || "/chatbot";
  
  // Si el usuario ya está autenticado, redirigir inmediatamente
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
        // Mensajes de error amigables para personas mayores
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
        // Esperar un momento para asegurar que la sesión esté establecida
        // antes de redirigir a la URL especificada o al chatbot por defecto
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
      // Si no hay error, el usuario será redirigido automáticamente a Google
      // y luego a nuestro callback
    } catch (err) {
      setError("Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.");
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center px-6 py-4 overflow-y-auto" style={{ background: 'var(--color-bg-secondary)' }}>
      <div className="w-full max-w-lg flex flex-col">
        {/* Logo y título */}
        <div className="text-center mb-4 shrink-0">
          <Link href="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl" style={{ background: 'var(--color-primary)' }}>
              💬
            </div>
          </Link>
          <h1 className="text-xl md:text-2xl font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
            ¡Bienvenido!
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Inicia sesión
          </p>
        </div>

        {/* Formulario */}
        <div className="card shrink-0">
          <form onSubmit={handleLogin} className="space-y-3">
            {/* Mensaje de error */}
            {error && (
              <div 
                className="p-2 rounded text-xs"
                style={{ background: '#fef2f2', border: '1px solid var(--color-error)', color: 'var(--color-error)' }}
                role="alert"
                aria-live="polite"
              >
                ⚠️ {error}
              </div>
            )}

            {/* Campo de email */}
            <div>
              <label htmlFor="email" className="label text-sm">
                Correo
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
              <p id="email-help" className="text-xs hidden" style={{ color: 'var(--color-text-muted)' }}>
                El correo con el que te registraste
              </p>
            </div>

            {/* Campo de contraseña */}
            <div>
              <label htmlFor="password" className="label text-sm">
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

            {/* Botón de envío */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full text-sm py-2"
              style={{ minHeight: '40px' }}
            >
              {loading ? (
                <span className="flex items-center gap-1 text-xs">
                  <span className="animate-pulse">⏳</span>
                </span>
              ) : (
                "Iniciar sesión"
              )}
            </button>

            {/* Separador */}
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center" style={{ borderTopWidth: '1px', borderTopColor: 'var(--color-border)' }}></div>
              <div className="relative flex justify-center text-xs" style={{ background: 'var(--color-bg-card)' }}>
                <span style={{ padding: '0 0.5rem', color: 'var(--color-text-muted)', background: 'var(--color-bg-card)' }}>
                  O
                </span>
              </div>
            </div>

            {/* Botón de Google */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="btn w-full text-sm py-2 flex items-center justify-center gap-1"
              style={{ 
                minHeight: '40px',
                background: 'white',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
          </form>

          {/* Enlace a registro */}
          <div className="mt-3 pt-2 text-center hidden md:block" style={{ borderTop: '1px solid var(--color-border)' }}>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              ¿No tienes cuenta?
            </p>
            <Link 
              href="/auth/register"
              className="inline-block text-xs font-semibold underline"
              style={{ color: 'var(--color-primary)' }}
            >
              Crear cuenta
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center px-6 py-4" style={{ background: 'var(--color-bg-secondary)' }}>
        <div className="text-center">
          <div className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center text-2xl animate-pulse" style={{ background: 'var(--color-primary)' }}>
            ⏳
          </div>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Cargando...
          </p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
