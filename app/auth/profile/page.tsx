"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { getUserProfile } from "@/lib/profile";

function LogoIcon({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="24" fill="url(#logo-profile)" />
      <path d="M24 12c-5.5 0-10 4-10 9 0 3 1.5 5.6 3.8 7.2.2.2.2.4.2.7l-.5 3.1c-.1.5.4.9.8.7l3.3-1.5c.2-.1.4-.1.6 0 .6.1 1.2.2 1.8.2 5.5 0 10-4 10-9s-4.5-9-10-9z" fill="white" opacity="0.95"/>
      <circle cx="19.5" cy="20.5" r="1.5" fill="#1a7a6d"/>
      <circle cx="24" cy="20.5" r="1.5" fill="#1a7a6d"/>
      <circle cx="28.5" cy="20.5" r="1.5" fill="#1a7a6d"/>
      <defs>
        <linearGradient id="logo-profile" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1a7a6d"/><stop offset="1" stopColor="#22a196"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  // edit mode when coming from chatbot with ?edit=true
  const isEditMode = searchParams.get("edit") === "true";

  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [description, setDescription] = useState("");
  const [interests, setInterests] = useState("");
  const [city, setCity] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [hasExistingProfile, setHasExistingProfile] = useState(false);

  // Auth guard + profile check
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/auth/login");
      return;
    }

    getUserProfile(user.id).then((profile) => {
      if (profile) {
        if (isEditMode) {
          // Populate form with existing data
          setName(profile.name);
          setNumber(profile.number || "");
          setDescription(profile.description || "");
          setInterests(profile.interests || "");
          setCity(profile.city || "");
          setHasExistingProfile(true);
          setCheckingProfile(false);
        } else {
          // Profile exists and not editing — go to chatbot
          router.push("/chatbot");
        }
      } else {
        // No profile — show create form
        setCheckingProfile(false);
      }
    });
  }, [user, authLoading, router, isEditMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!name.trim()) {
      setError("Por favor, escribe tu nombre.");
      setLoading(false);
      return;
    }

    if (!user) {
      setError("No se ha encontrado tu sesión. Por favor, inicia sesión de nuevo.");
      setLoading(false);
      return;
    }

    const profileData = {
      id: user.id,
      name: name.trim(),
      number: number.trim() || null,
      description: description.trim() || null,
      interests: interests.trim() || null,
      city: city.trim() || null,
    };

    try {
      let dbError;

      if (hasExistingProfile) {
        const { error: updateError } = await supabase
          .from("user_profile")
          .update({
            name: profileData.name,
            number: profileData.number,
            description: profileData.description,
            interests: profileData.interests,
            city: profileData.city,
          })
          .eq("id", user.id);
        dbError = updateError;
      } else {
        const { error: insertError } = await supabase
          .from("user_profile")
          .insert(profileData);
        dbError = insertError;
      }

      if (dbError) {
        if (dbError.message.includes("duplicate")) {
          router.push("/chatbot");
          return;
        }
        setError("Ha ocurrido un error al guardar tu perfil. Por favor, inténtalo de nuevo.");
        setLoading(false);
        return;
      }

      router.push("/chatbot");
      router.refresh();
    } catch (err) {
      setError("Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.");
      setLoading(false);
    }
  };

  // Show loading while checking auth or profile
  if (authLoading || checkingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg-main)' }}>
        <div className="text-center">
          <LogoIcon className="w-14 h-14 mx-auto mb-4 animate-pulse" />
          <p className="text-base" style={{ color: 'var(--color-text-secondary)' }}>
            Cargando...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--color-bg-main)' }}>
      {/* Left decorative panel — hidden on mobile */}
      <div className="hidden lg:flex lg:w-[45%] gradient-warm relative overflow-hidden items-center justify-center p-12">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10" style={{ background: 'white', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10" style={{ background: 'white', transform: 'translate(-30%, 30%)' }} />
        <div className="absolute top-1/3 left-1/5 w-16 h-16 rounded-full opacity-5" style={{ background: 'white' }} />

        <div className="relative z-10 text-center max-w-md">
          <div className="mb-8 animate-float">
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="60" cy="60" r="56" stroke="white" strokeWidth="2" opacity="0.3" fill="none"/>
              <circle cx="60" cy="60" r="40" fill="white" opacity="0.15"/>
              <circle cx="60" cy="42" r="14" stroke="white" strokeWidth="3" fill="none" opacity="0.9"/>
              <path d="M36 82c0-13.3 10.7-24 24-24s24 10.7 24 24" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.9"/>
              {hasExistingProfile ? (
                <>
                  {/* Pencil icon for edit mode */}
                  <circle cx="78" cy="72" r="12" fill="white" opacity="0.9"/>
                  <path d="M74 76l8-8 2 2-8 8-3 1 1-3z" stroke="#1a7a6d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                </>
              ) : (
                <>
                  {/* Checkmark for create mode */}
                  <circle cx="78" cy="72" r="12" fill="white" opacity="0.9"/>
                  <path d="M73 72l3.5 3.5 7-7" stroke="#1a7a6d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </>
              )}
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            {hasExistingProfile ? "Edita tu perfil" : "Completa tu perfil"}
          </h2>
          <p className="text-lg text-white opacity-80 leading-relaxed">
            {hasExistingProfile
              ? "Actualiza tus datos para que podamos ayudarte mejor."
              : "Queremos conocerte mejor para ofrecerte la mejor experiencia posible."}
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-8 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-3 mb-6">
              <LogoIcon className="w-12 h-12" />
              <span className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>MenteViva</span>
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              {hasExistingProfile ? "Tu perfil" : "Cuéntanos sobre ti"}
            </h1>
            <p className="text-base" style={{ color: 'var(--color-text-secondary)' }}>
              {hasExistingProfile ? "Modifica tus datos cuando quieras" : "Solo necesitamos unos datos para empezar"}
            </p>
          </div>

          {/* Form Card */}
          <div className="card" style={{ padding: '2rem' }}>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div
                  className="p-4 rounded-lg flex items-start gap-3 animate-fade-in"
                  style={{ background: '#fef2f2', border: '1px solid #fecaca', color: 'var(--color-error)' }}
                  role="alert"
                  aria-live="polite"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0 mt-0.5">
                    <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" fill="none"/>
                    <path d="M10 6v4m0 4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <span className="text-sm font-medium">{error}</span>
                </div>
              )}

              <div>
                <label htmlFor="name" className="label">
                  Nombre *
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input"
                  placeholder="¿Cómo te llamas?"
                  required
                  autoComplete="name"
                  autoFocus
                />
              </div>

              <div>
                <label htmlFor="number" className="label">
                  Teléfono
                </label>
                <input
                  id="number"
                  type="tel"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  className="input"
                  placeholder="Ej: 612 345 678"
                  autoComplete="tel"
                />
              </div>

              <div>
                <label htmlFor="description" className="label">
                  Cuéntanos sobre ti
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input"
                  placeholder="Ej: Soy jubilado, me gusta pasear y leer..."
                  rows={3}
                  style={{ resize: 'vertical', minHeight: '80px' }}
                />
              </div>

              <div>
                <label htmlFor="interests" className="label">
                  Intereses
                </label>
                <input
                  id="interests"
                  type="text"
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  className="input"
                  placeholder="Ej: Cocina, jardinería, música, viajes..."
                />
              </div>

              <div>
                <label htmlFor="city" className="label">
                  Ciudad
                </label>
                <input
                  id="city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="input"
                  placeholder="¿Dónde vives?"
                  autoComplete="address-level2"
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
                    Guardando...
                  </span>
                ) : (
                  hasExistingProfile ? "Guardar cambios" : "Empezar a usar MenteViva"
                )}
              </button>
            </form>

            {hasExistingProfile && (
              <div className="mt-5 pt-5 text-center" style={{ borderTop: '1px solid var(--color-border)' }}>
                <Link
                  href="/chatbot"
                  className="font-medium text-base underline underline-offset-2"
                  style={{ color: 'var(--color-primary)' }}
                >
                  Volver al chat
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
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
      <ProfileContent />
    </Suspense>
  );
}
