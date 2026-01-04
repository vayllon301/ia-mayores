"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const redirectTo = searchParams.get("redirect") || "/chatbot";
  
  // Si el usuario ya está autenticado, redirigir inmediatamente
  useEffect(() => {
    if (user) {
      router.push(redirectTo);
      router.refresh();
    }
  }, [user, redirectTo, router]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden. Por favor, escríbelas de nuevo.");
      setLoading(false);
      return;
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      setLoading(false);
      return;
    }

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        // Mensajes de error amigables para personas mayores
        if (authError.message.includes("already registered")) {
          setError("Este correo ya está registrado. ¿Quizás ya tienes una cuenta?");
        } else if (authError.message.includes("valid email")) {
          setError("Por favor, escribe un correo electrónico válido.");
        } else {
          setError("Ha ocurrido un error. Por favor, inténtalo de nuevo.");
        }
        setLoading(false);
        return;
      }

      if (data.user) {
        setSuccess(true);
      }
    } catch (err) {
      setError("Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.");
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
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

  // Pantalla de éxito
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 py-12" style={{ background: 'var(--color-bg-secondary)' }}>
        <div className="w-full max-w-lg text-center">
          <div className="card">
            <div className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center text-5xl" style={{ background: '#dcfce7' }}>
              ✅
            </div>
            <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
              ¡Registro completado!
            </h1>
            <p className="text-xl mb-8" style={{ color: 'var(--color-text-secondary)' }}>
              Hemos enviado un correo a <strong>{email}</strong>. 
              <br /><br />
              Por favor, revisa tu bandeja de entrada y haz clic en el enlace para confirmar tu cuenta.
            </p>
            <Link 
              href="/auth/login"
              className="btn btn-primary text-xl w-full"
            >
              Ir a iniciar sesión
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12" style={{ background: 'var(--color-bg-secondary)' }}>
      <div className="w-full max-w-lg">
        {/* Logo y título */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl" style={{ background: 'var(--color-primary)' }}>
              💬
            </div>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
            Crea tu cuenta
          </h1>
          <p className="text-xl" style={{ color: 'var(--color-text-secondary)' }}>
            Es gratis y solo toma un minuto
          </p>
        </div>

        {/* Formulario */}
        <div className="card">
          <form onSubmit={handleRegister} className="space-y-6">
            {/* Mensaje de error */}
            {error && (
              <div 
                className="p-4 rounded-lg text-lg"
                style={{ background: '#fef2f2', border: '2px solid var(--color-error)', color: 'var(--color-error)' }}
                role="alert"
                aria-live="polite"
              >
                ⚠️ {error}
              </div>
            )}

            {/* Campo de email */}
            <div>
              <label htmlFor="email" className="label text-lg">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="tucorreo@ejemplo.com"
                required
                autoComplete="email"
              />
              <p className="mt-2 text-base" style={{ color: 'var(--color-text-muted)' }}>
                Usarás este correo para iniciar sesión
              </p>
            </div>

            {/* Campo de contraseña */}
            <div>
              <label htmlFor="password" className="label text-lg">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="Mínimo 6 caracteres"
                required
                autoComplete="new-password"
                minLength={6}
              />
              <p className="mt-2 text-base" style={{ color: 'var(--color-text-muted)' }}>
                Elige una contraseña fácil de recordar
              </p>
            </div>

            {/* Confirmar contraseña */}
            <div>
              <label htmlFor="confirmPassword" className="label text-lg">
                Repite la contraseña
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input"
                placeholder="Escribe la misma contraseña"
                required
                autoComplete="new-password"
                minLength={6}
              />
            </div>

            {/* Botón de envío */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full text-xl py-5"
              style={{ minHeight: '64px' }}
            >
              {loading ? (
                <span className="flex items-center gap-3">
                  <span className="animate-pulse">⏳</span>
                  Creando cuenta...
                </span>
              ) : (
                "Crear mi cuenta"
              )}
            </button>

            {/* Separador */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center" style={{ borderTopWidth: '1px', borderTopColor: 'var(--color-border)' }}></div>
              <div className="relative flex justify-center text-lg" style={{ background: 'var(--color-bg-card)' }}>
                <span style={{ padding: '0 1rem', color: 'var(--color-text-muted)', background: 'var(--color-bg-card)' }}>
                  O
                </span>
              </div>
            </div>

            {/* Botón de Google */}
            <button
              type="button"
              onClick={handleGoogleSignUp}
              disabled={loading}
              className="btn w-full text-xl py-5 flex items-center justify-center gap-3"
              style={{ 
                minHeight: '64px',
                background: 'white',
                color: 'var(--color-text-primary)',
                border: '2px solid var(--color-border)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Registrarse con Google
            </button>
          </form>

          {/* Enlace a login */}
          <div className="mt-8 pt-6 text-center" style={{ borderTop: '1px solid var(--color-border)' }}>
            <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
              ¿Ya tienes una cuenta?
            </p>
            <Link 
              href="/auth/login"
              className="inline-block mt-3 text-xl font-semibold underline"
              style={{ color: 'var(--color-primary)' }}
            >
              Iniciar sesión
            </Link>
          </div>
        </div>

        {/* Enlace para volver */}
        <div className="text-center mt-8">
          <Link 
            href="/"
            className="text-lg inline-flex items-center gap-2"
            style={{ color: 'var(--color-text-muted)' }}
          >
            ← Volver a la página principal
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center px-6 py-12" style={{ background: 'var(--color-bg-secondary)' }}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl animate-pulse" style={{ background: 'var(--color-primary)' }}>
            ⏳
          </div>
          <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
            Cargando...
          </p>
        </div>
      </div>
    }>
      <RegisterContent />
    </Suspense>
  );
}
