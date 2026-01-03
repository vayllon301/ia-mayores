"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
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
