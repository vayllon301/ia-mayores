"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { getUserProfile, getTutorProfile, getFriendProfile } from "@/lib/profile";
import { createReminder, fetchReminders, dismissReminder, type Reminder } from "@/lib/notifications";

function LogoIcon({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="24" fill="url(#logo-profile)" />
      <path d="M24 12c-5.5 0-10 4-10 9 0 3 1.5 5.6 3.8 7.2.2.2.2.4.2.7l-.5 3.1c-.1.5.4.9.8.7l3.3-1.5c.2-.1.4-.1.6 0 .6.1 1.2.2 1.8.2 5.5 0 10-4 10-9s-4.5-9-10-9z" fill="white" opacity="0.95"/>
      <circle cx="19.5" cy="20.5" r="1.5" fill="#6b5870"/>
      <circle cx="24" cy="20.5" r="1.5" fill="#6b5870"/>
      <circle cx="28.5" cy="20.5" r="1.5" fill="#6b5870"/>
      <defs>
        <linearGradient id="logo-profile" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#191919"/><stop offset="1" stopColor="#6b5870"/>
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

  // Profile mode toggle
  const [profileMode, setProfileMode] = useState<"user" | "tutor" | "friend">("user");

  // Tutor profile fields
  const [tutorName, setTutorName] = useState("");
  const [tutorNumber, setTutorNumber] = useState("");
  const [tutorDescription, setTutorDescription] = useState("");
  const [tutorInstagram, setTutorInstagram] = useState("");
  const [tutorFacebook, setTutorFacebook] = useState("");
  const [tutorRelationship, setTutorRelationship] = useState("");
  const [tutorFactors, setTutorFactors] = useState("");
  const [hasExistingTutorProfile, setHasExistingTutorProfile] = useState(false);

  // Friend profile fields
  const [friendName, setFriendName] = useState("");
  const [friendNumber, setFriendNumber] = useState("");
  const [friendDescription, setFriendDescription] = useState("");
  const [friendInstagram, setFriendInstagram] = useState("");
  const [friendFacebook, setFriendFacebook] = useState("");
  const [friendRelationship, setFriendRelationship] = useState("");
  const [friendFactors, setFriendFactors] = useState("");
  const [hasExistingFriendProfile, setHasExistingFriendProfile] = useState(false);

  // Reminder creation state
  const [reminderMessage, setReminderMessage] = useState("");
  const [reminderDate, setReminderDate] = useState("");
  const [reminderTime, setReminderTime] = useState("");
  const [reminderRecurrence, setReminderRecurrence] = useState("");
  const [reminderLoading, setReminderLoading] = useState(false);
  const [reminderSuccess, setReminderSuccess] = useState("");
  const [reminderError, setReminderError] = useState("");
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [remindersLoading, setRemindersLoading] = useState(false);

  // Instagram linking state
  const [igLinkMode, setIgLinkMode] = useState(false);
  const [igInput, setIgInput] = useState("");
  const [igLinking, setIgLinking] = useState(false);
  const [igError, setIgError] = useState("");

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTarget, setRecordingTarget] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startVoiceInput = async (target: string, setter: (v: string) => void, current: string) => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setIsRecording(false);
        setRecordingTarget(null);
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const formData = new FormData();
        formData.append("audio", blob, "recording.webm");
        try {
          const res = await fetch("/api/voice", { method: "POST", body: formData });
          const data = await res.json();
          if (data.text) setter(current ? current + " " + data.text : data.text);
        } catch { /* ignore transcription errors silently */ }
      };
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTarget(target);
    } catch { /* microphone permission denied */ }
  };

  const handleInstagramLink = async () => {
    if (!igInput.trim()) {
      setIgError("Introduce un nombre de usuario o enlace de Instagram.");
      return;
    }
    setIgLinking(true);
    setIgError("");
    try {
      const res = await fetch("/api/tutor/instagram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: igInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setIgError(data.error || "Error al vincular Instagram.");
        setIgLinking(false);
        return;
      }
      setTutorInstagram(data.username);
      setIgLinkMode(false);
      setIgInput("");
      setIgError("");
    } catch {
      setIgError("No se pudo conectar con el servidor.");
    }
    setIgLinking(false);
  };

  const handleInstagramUnlink = () => {
    setTutorInstagram("");
    setIgLinkMode(false);
    setIgInput("");
    setIgError("");
  };

  const handleCreateReminder = async () => {
    if (!reminderMessage.trim()) {
      setReminderError("Escribe un mensaje para el recordatorio.");
      return;
    }
    if (!reminderDate || !reminderTime) {
      setReminderError("Selecciona fecha y hora.");
      return;
    }
    if (!user) return;

    setReminderLoading(true);
    setReminderError("");
    setReminderSuccess("");

    const remindAt = new Date(`${reminderDate}T${reminderTime}`).toISOString();
    const createdBy = profileMode as "tutor" | "friend";
    const result = await createReminder(user.id, reminderMessage.trim(), remindAt, reminderRecurrence || undefined, createdBy);

    if (result) {
      setReminderSuccess("Recordatorio creado correctamente.");
      setReminderMessage("");
      setReminderDate("");
      setReminderTime("");
      setReminderRecurrence("");
      setReminders((prev) => [...prev, result]);
      setTimeout(() => setReminderSuccess(""), 3000);
    } else {
      setReminderError("No se pudo crear el recordatorio.");
    }
    setReminderLoading(false);
  };

  const handleDismissReminder = async (reminderId: string) => {
    const ok = await dismissReminder(reminderId);
    if (ok) {
      setReminders((prev) => prev.filter((r) => r.id !== reminderId));
    }
  };

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

    getTutorProfile(user.id).then((tutorProfile) => {
      if (tutorProfile) {
        setTutorName(tutorProfile.name);
        setTutorNumber(tutorProfile.number || "");
        setTutorDescription(tutorProfile.description || "");
        setTutorInstagram(tutorProfile.instagram || "");
        setTutorFacebook(tutorProfile.facebook || "");
        setTutorRelationship(tutorProfile.relationship || "");
        setTutorFactors(tutorProfile.factors || "");
        setHasExistingTutorProfile(true);
      }
    });

    getFriendProfile(user.id).then((friendProfile) => {
      if (friendProfile) {
        setFriendName(friendProfile.name);
        setFriendNumber(friendProfile.number || "");
        setFriendDescription(friendProfile.description || "");
        setFriendInstagram(friendProfile.instagram || "");
        setFriendFacebook(friendProfile.facebook || "");
        setFriendRelationship(friendProfile.relationship || "");
        setFriendFactors(friendProfile.factors || "");
        setHasExistingFriendProfile(true);
      }
    });

    // Load existing reminders
    setRemindersLoading(true);
    fetchReminders(user.id).then((r) => {
      setReminders(r);
      setRemindersLoading(false);
    });
  }, [user, authLoading, router, isEditMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!user) {
      setError("No se ha encontrado tu sesión. Por favor, inicia sesión de nuevo.");
      setLoading(false);
      return;
    }

    try {
      let dbError;

      if (profileMode === "tutor") {
        if (!tutorName.trim()) {
          setError("Por favor, escribe el nombre del tutor.");
          setLoading(false);
          return;
        }

        const tutorData = {
          id: user.id,
          name: tutorName.trim(),
          number: tutorNumber.trim() || null,
          description: tutorDescription.trim() || null,
          instagram: tutorInstagram.trim() || null,
          facebook: tutorFacebook.trim() || null,
          relationship: tutorRelationship.trim() || null,
          factors: tutorFactors.trim() || null,
        };

        if (hasExistingTutorProfile) {
          const { error: updateError } = await supabase
            .from("tutor_profile")
            .update({
              name: tutorData.name,
              number: tutorData.number,
              description: tutorData.description,
              instagram: tutorData.instagram,
              facebook: tutorData.facebook,
              relationship: tutorData.relationship,
              factors: tutorData.factors,
            })
            .eq("id", user.id);
          dbError = updateError;
        } else {
          const { error: insertError } = await supabase
            .from("tutor_profile")
            .insert(tutorData);
          dbError = insertError;
        }
      } else if (profileMode === "friend") {
        if (!friendName.trim()) {
          setError("Por favor, escribe el nombre del amigo/a.");
          setLoading(false);
          return;
        }

        const friendData = {
          id: user.id,
          name: friendName.trim(),
          number: friendNumber.trim() || null,
          description: friendDescription.trim() || null,
          instagram: friendInstagram.trim() || null,
          facebook: friendFacebook.trim() || null,
          relationship: friendRelationship.trim() || null,
          factors: friendFactors.trim() || null,
        };

        if (hasExistingFriendProfile) {
          const { error: updateError } = await supabase
            .from("friend_profile")
            .update({
              name: friendData.name,
              number: friendData.number,
              description: friendData.description,
              instagram: friendData.instagram,
              facebook: friendData.facebook,
              relationship: friendData.relationship,
              factors: friendData.factors,
            })
            .eq("id", user.id);
          dbError = updateError;
        } else {
          const { error: insertError } = await supabase
            .from("friend_profile")
            .insert(friendData);
          dbError = insertError;
        }
      } else {
        // User profile mode
        if (!name.trim()) {
          setError("Por favor, escribe tu nombre.");
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
                  <path d="M74 76l8-8 2 2-8 8-3 1 1-3z" stroke="#6b5870" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                </>
              ) : (
                <>
                  {/* Checkmark for create mode */}
                  <circle cx="78" cy="72" r="12" fill="white" opacity="0.9"/>
                  <path d="M73 72l3.5 3.5 7-7" stroke="#6b5870" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
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
            <div className="flex rounded-xl overflow-hidden mb-6" style={{ border: '1px solid var(--color-border)' }}>
              <button
                type="button"
                onClick={() => setProfileMode("user")}
                className="flex-1 py-3 text-sm font-semibold transition-all duration-200"
                style={{
                  background: profileMode === "user" ? 'var(--color-primary)' : 'transparent',
                  color: profileMode === "user" ? 'white' : 'var(--color-text-secondary)',
                }}
              >
                Usuario
              </button>
              <button
                type="button"
                onClick={() => setProfileMode("tutor")}
                className="flex-1 py-3 text-sm font-semibold transition-all duration-200"
                style={{
                  background: profileMode === "tutor" ? 'var(--color-primary)' : 'transparent',
                  color: profileMode === "tutor" ? 'white' : 'var(--color-text-secondary)',
                }}
              >
                Tutor
              </button>
              <button
                type="button"
                onClick={() => setProfileMode("friend")}
                className="flex-1 py-3 text-sm font-semibold transition-all duration-200"
                style={{
                  background: profileMode === "friend" ? 'var(--color-primary)' : 'transparent',
                  color: profileMode === "friend" ? 'white' : 'var(--color-text-secondary)',
                }}
              >
                Amigo
              </button>
            </div>

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

              {profileMode === "friend" ? (
                <>
                  <div>
                    <label htmlFor="friendName" className="label">Nombre del amigo/a *</label>
                    <input id="friendName" type="text" value={friendName} onChange={(e) => setFriendName(e.target.value)} className="input" placeholder="Nombre del amigo/a" required autoComplete="name" autoFocus />
                  </div>
                  <div>
                    <label htmlFor="friendNumber" className="label">Teléfono</label>
                    <input id="friendNumber" type="tel" value={friendNumber} onChange={(e) => setFriendNumber(e.target.value)} className="input" placeholder="Ej: 612 345 678" autoComplete="tel" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label htmlFor="friendDescription" className="label" style={{ marginBottom: 0 }}>Descripción</label>
                      <button type="button" onClick={() => startVoiceInput("friendDescription", setFriendDescription, friendDescription)} aria-label={isRecording && recordingTarget === "friendDescription" ? "Detener grabación" : "Dictar descripción"} className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg transition-all" style={{ color: isRecording && recordingTarget === "friendDescription" ? 'white' : 'var(--color-primary)', background: isRecording && recordingTarget === "friendDescription" ? 'var(--color-primary)' : 'var(--color-bg-secondary)', border: '1px solid var(--color-primary)' }}>
                        {isRecording && recordingTarget === "friendDescription" ? (
                          <><span className="w-2 h-2 rounded-full bg-white animate-pulse inline-block" />Grabando...</>
                        ) : (
                          <><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><rect x="9" y="2" width="6" height="13" rx="3" fill="currentColor"/><path d="M5 10a7 7 0 0014 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="12" y1="19" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>Dictar</>
                        )}
                      </button>
                    </div>
                    <textarea id="friendDescription" value={friendDescription} onChange={(e) => setFriendDescription(e.target.value)} className="input" placeholder="Información sobre el amigo/a..." rows={3} style={{ resize: 'vertical', minHeight: '80px' }} />
                  </div>
                  <div>
                    <label htmlFor="friendRelationship" className="label">Relación con el usuario</label>
                    <input id="friendRelationship" type="text" value={friendRelationship} onChange={(e) => setFriendRelationship(e.target.value)} className="input" placeholder="Ej: Amigo/a, vecino/a, compañero/a..." />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label htmlFor="friendFactors" className="label" style={{ marginBottom: 0 }}>Factores a tener en cuenta</label>
                      <button type="button" onClick={() => startVoiceInput("friendFactors", setFriendFactors, friendFactors)} aria-label={isRecording && recordingTarget === "friendFactors" ? "Detener grabación" : "Dictar factores"} className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg transition-all" style={{ color: isRecording && recordingTarget === "friendFactors" ? 'white' : 'var(--color-primary)', background: isRecording && recordingTarget === "friendFactors" ? 'var(--color-primary)' : 'var(--color-bg-secondary)', border: '1px solid var(--color-primary)' }}>
                        {isRecording && recordingTarget === "friendFactors" ? (
                          <><span className="w-2 h-2 rounded-full bg-white animate-pulse inline-block" />Grabando...</>
                        ) : (
                          <><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><rect x="9" y="2" width="6" height="13" rx="3" fill="currentColor"/><path d="M5 10a7 7 0 0014 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="12" y1="19" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>Dictar</>
                        )}
                      </button>
                    </div>
                    <textarea id="friendFactors" value={friendFactors} onChange={(e) => setFriendFactors(e.target.value)} className="input" placeholder="Ej: Intereses compartidos, actividades juntos..." rows={3} style={{ resize: 'vertical', minHeight: '80px' }} />
                  </div>
                  <div>
                    <label htmlFor="friendInstagram" className="label">Instagram</label>
                    <input id="friendInstagram" type="text" value={friendInstagram} onChange={(e) => setFriendInstagram(e.target.value)} className="input" placeholder="@usuario" />
                  </div>
                  <div>
                    <label htmlFor="friendFacebook" className="label">Facebook</label>
                    <input id="friendFacebook" type="text" value={friendFacebook} onChange={(e) => setFriendFacebook(e.target.value)} className="input" placeholder="Enlace o nombre de perfil" />
                  </div>
                </>
              ) : profileMode === "tutor" ? (
                <>
                  <div>
                    <label htmlFor="tutorName" className="label">Nombre del tutor *</label>
                    <input id="tutorName" type="text" value={tutorName} onChange={(e) => setTutorName(e.target.value)} className="input" placeholder="Nombre del tutor" required autoComplete="name" autoFocus />
                  </div>
                  <div>
                    <label htmlFor="tutorNumber" className="label">Teléfono del tutor</label>
                    <input id="tutorNumber" type="tel" value={tutorNumber} onChange={(e) => setTutorNumber(e.target.value)} className="input" placeholder="Ej: 612 345 678" autoComplete="tel" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label htmlFor="tutorDescription" className="label" style={{ marginBottom: 0 }}>Descripción</label>
                      <button type="button" onClick={() => startVoiceInput("tutorDescription", setTutorDescription, tutorDescription)} aria-label={isRecording && recordingTarget === "tutorDescription" ? "Detener grabación" : "Dictar descripción"} className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg transition-all" style={{ color: isRecording && recordingTarget === "tutorDescription" ? 'white' : 'var(--color-primary)', background: isRecording && recordingTarget === "tutorDescription" ? 'var(--color-primary)' : 'var(--color-bg-secondary)', border: '1px solid var(--color-primary)' }}>
                        {isRecording && recordingTarget === "tutorDescription" ? (
                          <><span className="w-2 h-2 rounded-full bg-white animate-pulse inline-block" />Grabando...</>
                        ) : (
                          <><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><rect x="9" y="2" width="6" height="13" rx="3" fill="currentColor"/><path d="M5 10a7 7 0 0014 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="12" y1="19" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>Dictar</>
                        )}
                      </button>
                    </div>
                    <textarea id="tutorDescription" value={tutorDescription} onChange={(e) => setTutorDescription(e.target.value)} className="input" placeholder="Información sobre el tutor..." rows={3} style={{ resize: 'vertical', minHeight: '80px' }} />
                  </div>
                  <div>
                    <label htmlFor="tutorRelationship" className="label">Relación con el usuario</label>
                    <input id="tutorRelationship" type="text" value={tutorRelationship} onChange={(e) => setTutorRelationship(e.target.value)} className="input" placeholder="Ej: Hijo/a, cuidador/a, vecino/a..." />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label htmlFor="tutorFactors" className="label" style={{ marginBottom: 0 }}>Factores a tener en cuenta</label>
                      <button type="button" onClick={() => startVoiceInput("tutorFactors", setTutorFactors, tutorFactors)} aria-label={isRecording && recordingTarget === "tutorFactors" ? "Detener grabación" : "Dictar factores"} className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg transition-all" style={{ color: isRecording && recordingTarget === "tutorFactors" ? 'white' : 'var(--color-primary)', background: isRecording && recordingTarget === "tutorFactors" ? 'var(--color-primary)' : 'var(--color-bg-secondary)', border: '1px solid var(--color-primary)' }}>
                        {isRecording && recordingTarget === "tutorFactors" ? (
                          <><span className="w-2 h-2 rounded-full bg-white animate-pulse inline-block" />Grabando...</>
                        ) : (
                          <><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><rect x="9" y="2" width="6" height="13" rx="3" fill="currentColor"/><path d="M5 10a7 7 0 0014 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="12" y1="19" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>Dictar</>
                        )}
                      </button>
                    </div>
                    <textarea id="tutorFactors" value={tutorFactors} onChange={(e) => setTutorFactors(e.target.value)} className="input" placeholder="Ej: Problemas de movilidad, medicación..." rows={3} style={{ resize: 'vertical', minHeight: '80px' }} />
                  </div>
                  <div>
                    <label className="label">Instagram</label>
                    {tutorInstagram ? (
                      <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                          <rect x="2" y="2" width="20" height="20" rx="6" stroke="#E4405F" strokeWidth="2" fill="none"/>
                          <circle cx="12" cy="12" r="5" stroke="#E4405F" strokeWidth="2" fill="none"/>
                          <circle cx="17.5" cy="6.5" r="1.5" fill="#E4405F"/>
                        </svg>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>@{tutorInstagram}</p>
                          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Cuenta vinculada</p>
                        </div>
                        <button
                          type="button"
                          onClick={handleInstagramUnlink}
                          className="text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
                          style={{ color: 'var(--color-error)', background: '#fef2f2', border: '1px solid #fecaca' }}
                        >
                          Desvincular
                        </button>
                      </div>
                    ) : igLinkMode ? (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={igInput}
                            onChange={(e) => { setIgInput(e.target.value); setIgError(""); }}
                            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleInstagramLink(); } }}
                            className="input flex-1"
                            placeholder="@usuario o enlace de Instagram"
                            autoFocus
                            disabled={igLinking}
                          />
                          <button
                            type="button"
                            onClick={handleInstagramLink}
                            disabled={igLinking}
                            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                            style={{ background: 'var(--color-primary)', color: 'white', opacity: igLinking ? 0.6 : 1 }}
                          >
                            {igLinking ? (
                              <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.3" fill="none"/>
                                <path d="M12 2a10 10 0 019.5 6.8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none"/>
                              </svg>
                            ) : "Vincular"}
                          </button>
                        </div>
                        {igError && <p className="text-xs font-medium" style={{ color: 'var(--color-error)' }}>{igError}</p>}
                        <button
                          type="button"
                          onClick={() => { setIgLinkMode(false); setIgInput(""); setIgError(""); }}
                          className="text-xs font-medium"
                          style={{ color: 'var(--color-text-muted)' }}
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIgLinkMode(true)}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all"
                        style={{ background: 'linear-gradient(135deg, #833AB4, #E4405F, #FCAF45)', color: 'white' }}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <rect x="2" y="2" width="20" height="20" rx="6" stroke="white" strokeWidth="2" fill="none"/>
                          <circle cx="12" cy="12" r="5" stroke="white" strokeWidth="2" fill="none"/>
                          <circle cx="17.5" cy="6.5" r="1.5" fill="white"/>
                        </svg>
                        Vincular cuenta de Instagram
                      </button>
                    )}
                  </div>
                  <div>
                    <label htmlFor="tutorFacebook" className="label">Facebook</label>
                    <input id="tutorFacebook" type="text" value={tutorFacebook} onChange={(e) => setTutorFacebook(e.target.value)} className="input" placeholder="Enlace o nombre de perfil" />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label htmlFor="name" className="label">Nombre *</label>
                    <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="¿Cómo te llamas?" required autoComplete="name" autoFocus />
                  </div>
                  <div>
                    <label htmlFor="number" className="label">Teléfono</label>
                    <input id="number" type="tel" value={number} onChange={(e) => setNumber(e.target.value)} className="input" placeholder="Ej: 612 345 678" autoComplete="tel" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label htmlFor="description" className="label" style={{ marginBottom: 0 }}>Cuéntanos sobre ti</label>
                      <button type="button" onClick={() => startVoiceInput("description", setDescription, description)} aria-label={isRecording && recordingTarget === "description" ? "Detener grabación" : "Dictar descripción"} className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg transition-all" style={{ color: isRecording && recordingTarget === "description" ? 'white' : 'var(--color-primary)', background: isRecording && recordingTarget === "description" ? 'var(--color-primary)' : 'var(--color-bg-secondary)', border: '1px solid var(--color-primary)' }}>
                        {isRecording && recordingTarget === "description" ? (
                          <><span className="w-2 h-2 rounded-full bg-white animate-pulse inline-block" />Grabando...</>
                        ) : (
                          <><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><rect x="9" y="2" width="6" height="13" rx="3" fill="currentColor"/><path d="M5 10a7 7 0 0014 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="12" y1="19" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>Dictar</>
                        )}
                      </button>
                    </div>
                    <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="input" placeholder="Ej: Soy jubilado, me gusta pasear y leer..." rows={3} style={{ resize: 'vertical', minHeight: '80px' }} />
                  </div>
                  <div>
                    <label htmlFor="interests" className="label">Intereses</label>
                    <input id="interests" type="text" value={interests} onChange={(e) => setInterests(e.target.value)} className="input" placeholder="Ej: Cocina, jardinería, música, viajes..." />
                  </div>
                  <div>
                    <label htmlFor="city" className="label">Ciudad</label>
                    <input id="city" type="text" value={city} onChange={(e) => setCity(e.target.value)} className="input" placeholder="¿Dónde vives?" autoComplete="address-level2" />
                  </div>
                </>
              )}

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

          {/* Reminders section — only for tutor/friend */}
          {(profileMode === "tutor" || profileMode === "friend") && (
            <div className="card mt-6" style={{ padding: '2rem' }}>
              <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                Recordatorios para el usuario
              </h2>

              {/* Existing reminders */}
              {remindersLoading ? (
                <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>Cargando recordatorios...</p>
              ) : reminders.length > 0 ? (
                <div className="space-y-2 mb-5">
                  {reminders.map((r) => (
                    <div key={r.id} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0 mt-0.5" style={{ color: 'var(--color-primary)' }}>
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
                        <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{r.message}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                          {new Date(r.remind_at).toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "short" })}
                          {r.recurrence && ` · ${r.recurrence}`}
                          {r.created_by && <span className="ml-1 opacity-60">({r.created_by})</span>}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDismissReminder(r.id)}
                        className="text-xs font-medium px-2 py-1 rounded-lg shrink-0"
                        style={{ color: 'var(--color-error)', background: '#fef2f2', border: '1px solid #fecaca' }}
                      >
                        Eliminar
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm mb-5" style={{ color: 'var(--color-text-muted)' }}>No hay recordatorios activos.</p>
              )}

              {/* New reminder form */}
              <div className="space-y-4" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem' }}>
                <p className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Crear nuevo recordatorio</p>

                {reminderError && (
                  <p className="text-xs font-medium" style={{ color: 'var(--color-error)' }}>{reminderError}</p>
                )}
                {reminderSuccess && (
                  <p className="text-xs font-medium" style={{ color: 'var(--color-success, #16a34a)' }}>{reminderSuccess}</p>
                )}

                <div>
                  <label htmlFor="reminderMessage" className="label">Mensaje *</label>
                  <input
                    id="reminderMessage"
                    type="text"
                    value={reminderMessage}
                    onChange={(e) => setReminderMessage(e.target.value)}
                    className="input"
                    placeholder="Ej: Tomar la medicación, Llamar al médico..."
                  />
                </div>

                <div className="flex gap-3">
                  <div className="flex-1">
                    <label htmlFor="reminderDate" className="label">Fecha *</label>
                    <input
                      id="reminderDate"
                      type="date"
                      value={reminderDate}
                      onChange={(e) => setReminderDate(e.target.value)}
                      className="input"
                    />
                  </div>
                  <div className="flex-1">
                    <label htmlFor="reminderTime" className="label">Hora *</label>
                    <input
                      id="reminderTime"
                      type="time"
                      value={reminderTime}
                      onChange={(e) => setReminderTime(e.target.value)}
                      className="input"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="reminderRecurrence" className="label">Repetir</label>
                  <select
                    id="reminderRecurrence"
                    value={reminderRecurrence}
                    onChange={(e) => setReminderRecurrence(e.target.value)}
                    className="input"
                  >
                    <option value="">Sin repetición</option>
                    <option value="daily">Cada día</option>
                    <option value="weekly">Cada semana</option>
                    <option value="monthly">Cada mes</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleCreateReminder}
                  disabled={reminderLoading}
                  className="btn btn-primary w-full"
                >
                  {reminderLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.3" fill="none"/>
                        <path d="M12 2a10 10 0 019.5 6.8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none"/>
                      </svg>
                      Creando...
                    </span>
                  ) : (
                    "Crear recordatorio"
                  )}
                </button>
              </div>
            </div>
          )}
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
