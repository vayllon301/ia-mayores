"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
        // Redirigir al chatbot después del login exitoso
        router.push("/chatbot");
        router.refresh();
      }
    } catch (err) {
      setError("Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.");
      setLoading(false);
    }
  };

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
            ¡Bienvenido de nuevo!
          </h1>
          <p className="text-xl" style={{ color: 'var(--color-text-secondary)' }}>
            Inicia sesión para hablar con tu asistente
          </p>
        </div>

        {/* Formulario */}
        <div className="card">
          <form onSubmit={handleLogin} className="space-y-6">
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
                aria-describedby="email-help"
              />
              <p id="email-help" className="mt-2 text-base" style={{ color: 'var(--color-text-muted)' }}>
                El correo con el que te registraste
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
              className="btn btn-primary w-full text-xl py-5"
              style={{ minHeight: '64px' }}
            >
              {loading ? (
                <span className="flex items-center gap-3">
                  <span className="animate-pulse">⏳</span>
                  Iniciando sesión...
                </span>
              ) : (
                "Iniciar sesión"
              )}
            </button>
          </form>

          {/* Enlace a registro */}
          <div className="mt-8 pt-6 text-center" style={{ borderTop: '1px solid var(--color-border)' }}>
            <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
              ¿No tienes cuenta todavía?
            </p>
            <Link 
              href="/auth/register"
              className="inline-block mt-3 text-xl font-semibold underline"
              style={{ color: 'var(--color-primary)' }}
            >
              Crear una cuenta nueva
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
