"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { getUserProfile, type UserProfile } from "@/lib/profile";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

function LogoIcon({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="24" fill="url(#logo-chat)" />
      <path d="M24 12c-5.5 0-10 4-10 9 0 3 1.5 5.6 3.8 7.2.2.2.2.4.2.7l-.5 3.1c-.1.5.4.9.8.7l3.3-1.5c.2-.1.4-.1.6 0 .6.1 1.2.2 1.8.2 5.5 0 10-4 10-9s-4.5-9-10-9z" fill="white" opacity="0.95"/>
      <circle cx="19.5" cy="20.5" r="1.5" fill="#1a7a6d"/>
      <circle cx="24" cy="20.5" r="1.5" fill="#1a7a6d"/>
      <circle cx="28.5" cy="20.5" r="1.5" fill="#1a7a6d"/>
      <defs>
        <linearGradient id="logo-chat" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1a7a6d"/><stop offset="1" stopColor="#22a196"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

function BotAvatar() {
  return (
    <div
      className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
      style={{ background: 'linear-gradient(135deg, #1a7a6d, #22a196)', boxShadow: '0 2px 8px rgba(26, 122, 109, 0.25)' }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M12 2c-4.4 0-8 3.2-8 7.2 0 2.4 1.2 4.5 3 5.8.2.1.2.3.2.5l-.4 2.5c-.1.4.3.7.7.5l2.6-1.2c.2-.1.3-.1.5 0 .5.1 1 .2 1.4.2 4.4 0 8-3.2 8-7.2S16.4 2 12 2z" fill="white" opacity="0.95"/>
        <circle cx="9" cy="9" r="1.2" fill="#1a7a6d"/>
        <circle cx="12" cy="9" r="1.2" fill="#1a7a6d"/>
        <circle cx="15" cy="9" r="1.2" fill="#1a7a6d"/>
      </svg>
    </div>
  );
}

function UserAvatar({ email }: { email: string | null }) {
  const initial = email ? email.charAt(0).toUpperCase() : "U";
  return (
    <div
      className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 text-sm font-bold text-white"
      style={{ background: 'linear-gradient(135deg, #e8985e, #d07a3e)', boxShadow: '0 2px 8px rgba(232, 152, 94, 0.25)' }}
    >
      {initial}
    </div>
  );
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}

const SUGGESTIONS = [
  { text: "¿Qué tiempo hace hoy?", icon: "sun" },
  { text: "Cuéntame un dato curioso", icon: "bulb" },
  { text: "¿Cómo puedo dormir mejor?", icon: "moon" },
  { text: "Recomiéndame una receta", icon: "chef" },
];

function SuggestionIcon({ type }: { type: string }) {
  switch (type) {
    case "sun":
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <circle cx="9" cy="9" r="4" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <path d="M9 1v2M9 15v2M1 9h2M15 9h2M3.3 3.3l1.4 1.4M13.3 13.3l1.4 1.4M3.3 14.7l1.4-1.4M13.3 4.7l1.4-1.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      );
    case "bulb":
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M7 14h4M7.5 16h3M9 2a5 5 0 00-2 9.6V13h4v-1.4A5 5 0 009 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </svg>
      );
    case "moon":
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M16 10.3A7 7 0 117.7 2a5.5 5.5 0 008.3 8.3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </svg>
      );
    case "chef":
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M5 15h8M4 9c-1.1 0-2-.9-2-2a2 2 0 013-1.7A3 3 0 019 2a3 3 0 014 3.3A2 2 0 0114 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          <path d="M5 9v4a2 2 0 002 2h4a2 2 0 002-2V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        </svg>
      );
    default:
      return null;
  }
}

export default function ChatbotPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "¡Hola! Soy tu asistente de MenteViva. Estoy aquí para ayudarte en lo que necesites. ¿En qué puedo ayudarte hoy?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [alertStatus, setAlertStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const MAX_TEXTAREA_HEIGHT = 140;

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      const currentPath = window.location.pathname;
      router.push(`/auth/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }
    getUserProfile(user.id).then((p) => {
      if (!p) {
        router.push("/auth/profile");
      } else {
        setProfile(p);
      }
    });
  }, [user, authLoading, router]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const adjustTextareaHeight = () => {
    const textarea = inputRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    const newHeight = Math.min(textarea.scrollHeight, MAX_TEXTAREA_HEIGHT);
    textarea.style.height = `${newHeight}px`;
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (user) {
      setUserEmail(user.email ?? null);
    }
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const handleAlert = async () => {
    if (alertStatus === "sending") return;
    setAlertStatus("sending");
    try {
      const response = await fetch("/api/alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: userEmail, timestamp: new Date().toISOString() }),
      });
      if (!response.ok) throw new Error(`Error ${response.status}`);
      setAlertStatus("sent");
      setTimeout(() => setAlertStatus("idle"), 4000);
    } catch (error) {
      console.error("Error al enviar alerta:", error);
      setAlertStatus("error");
      setTimeout(() => setAlertStatus("idle"), 4000);
    }
  };

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    await sendTextMessage(messageText);
    setIsLoading(false);
    inputRef.current?.focus();
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: "audio/webm" });
        await sendVoiceMessage(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setAudioChunks(chunks);
      setIsRecording(true);
    } catch (error) {
      console.error("Error al acceder al micrófono:", error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "No se pudo acceder al micrófono. Por favor, verifica los permisos.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const sendVoiceMessage = async (audioBlob: Blob) => {
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "voice-message.webm");

      const response = await fetch("/api/voice", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const transcribedText = data.text || data.transcription || "";
      const chatbotResponseText = data.response || "";

      if (transcribedText) {
        const userMessage: Message = {
          id: Date.now().toString(),
          role: "user",
          content: `🎤 ${transcribedText}`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMessage]);

        if (chatbotResponseText && chatbotResponseText.trim()) {
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: `🔊 ${chatbotResponseText}`,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, assistantMessage]);

          if (data.audio && data.audioType) {
            try {
              const audioBytes = Uint8Array.from(atob(data.audio), c => c.charCodeAt(0));
              const audioBlob = new Blob([audioBytes], { type: data.audioType });
              const audioUrl = URL.createObjectURL(audioBlob);

              const audio = new Audio(audioUrl);
              audio.play().catch((err) => {
                console.error("Error playing audio:", err);
              });

              audio.onended = () => {
                URL.revokeObjectURL(audioUrl);
              };
            } catch (audioError) {
              console.error("Error processing audio response:", audioError);
            }
          }
        } else {
          await sendTextMessage(transcribedText);
        }
      } else {
        throw new Error("No se pudo transcribir el audio");
      }
    } catch (error) {
      console.error("Error al procesar el mensaje de voz:", error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: error instanceof Error
          ? `Error: ${error.message}`
          : "Lo siento, no pude procesar tu mensaje de voz. Intenta de nuevo.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendTextMessage = async (text: string) => {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
          history: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          user_profile: profile ? {
            name: profile.name,
            number: profile.number,
            description: profile.description,
            interests: profile.interests,
            city: profile.city,
          } : null,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || data.message || "No hay respuesta del servidor",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error al conectar con el servidor:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: error instanceof Error
          ? `Error: ${error.message}`
          : "Lo siento, no pude conectar con el servidor. Intenta de nuevo.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const handleVoiceClick = () => {
    if (isRecording) {
      stopRecording();
    } else if (!isLoading) {
      startRecording();
    }
  };

  const isWelcomeOnly = messages.length === 1 && messages[0].id === "welcome";

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg-main)' }}>
        <div className="text-center animate-fade-in">
          <LogoIcon className="w-16 h-16 mx-auto mb-6 animate-pulse" />
          <p className="text-lg font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            Verificando sesión...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col" style={{ background: 'var(--color-bg-secondary)' }}>
      {/* Header with gradient accent line */}
      <div className="shrink-0">
        <div className="h-1 gradient-warm" />
        <header
          className="py-3 px-4 md:px-6 flex items-center justify-between"
          style={{
            background: 'var(--color-bg-card)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <div className="flex items-center gap-3">
            <LogoIcon className="w-10 h-10" />
            <div>
              <h1 className="text-lg font-bold leading-tight" style={{ color: 'var(--color-primary)' }}>
                MenteViva
              </h1>
              {userEmail && (
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {userEmail}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Online indicator */}
            <div
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
              style={{ background: 'rgba(56, 161, 105, 0.1)', color: '#38a169' }}
            >
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#38a169' }} />
              En línea
            </div>

            {/* Alert button */}
            <button
              onClick={handleAlert}
              disabled={alertStatus === "sending"}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200"
              style={{
                background: alertStatus === "sent"
                  ? 'rgba(56, 161, 105, 0.12)'
                  : alertStatus === "error"
                  ? 'rgba(229, 62, 62, 0.08)'
                  : 'rgba(229, 62, 62, 0.1)',
                color: alertStatus === "sent"
                  ? '#276749'
                  : alertStatus === "error"
                  ? '#c53030'
                  : '#c53030',
                border: alertStatus === "sent"
                  ? '1.5px solid rgba(56, 161, 105, 0.3)'
                  : '1.5px solid rgba(229, 62, 62, 0.3)',
                boxShadow: alertStatus === "sending" ? 'none' : '0 0 0 0 rgba(229, 62, 62, 0)',
                opacity: alertStatus === "sending" ? 0.7 : 1,
                cursor: alertStatus === "sending" ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={(e) => {
                if (alertStatus === "idle") {
                  e.currentTarget.style.background = 'rgba(229, 62, 62, 0.18)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(229, 62, 62, 0.15)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = alertStatus === "sent"
                  ? 'rgba(56, 161, 105, 0.12)'
                  : 'rgba(229, 62, 62, 0.1)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              aria-label="Enviar alerta de emergencia"
            >
              {alertStatus === "sending" ? (
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.3" fill="none"/>
                  <path d="M12 2a10 10 0 019.5 6.8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none"/>
                </svg>
              ) : alertStatus === "sent" ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8l3.5 3.5L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 1.5a5 5 0 00-5 5v3l-1.5 2H14.5L13 9.5v-3a5 5 0 00-5-5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
                  <path d="M6.5 13.5a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              )}
              <span className="hidden sm:inline">
                {alertStatus === "sending" ? "Enviando..." : alertStatus === "sent" ? "¡Alerta enviada!" : alertStatus === "error" ? "Error, reintentar" : "Alerta"}
              </span>
            </button>

            {/* Profile button */}
            <button
              onClick={() => router.push("/auth/profile?edit=true")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200"
              style={{
                color: 'var(--color-text-secondary)',
                background: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-primary-muted)'; e.currentTarget.style.color = 'var(--color-primary)'; e.currentTarget.style.borderColor = 'var(--color-primary-light)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--color-bg-secondary)'; e.currentTarget.style.color = 'var(--color-text-secondary)'; e.currentTarget.style.borderColor = 'var(--color-border)'; }}
              aria-label="Editar perfil"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
              </svg>
              <span className="hidden sm:inline">Perfil</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200"
              style={{
                color: 'var(--color-text-secondary)',
                background: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-primary-muted)'; e.currentTarget.style.color = 'var(--color-primary)'; e.currentTarget.style.borderColor = 'var(--color-primary-light)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--color-bg-secondary)'; e.currentTarget.style.color = 'var(--color-text-secondary)'; e.currentTarget.style.borderColor = 'var(--color-border)'; }}
              aria-label="Cerrar sesión"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 14H3a1 1 0 01-1-1V3a1 1 0 011-1h3M11 11l3-3-3-3M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Salir
            </button>
          </div>
        </header>
      </div>

      {/* Messages area */}
      <main
        id="main-content"
        className="flex-1 overflow-y-auto px-4 py-6"
        aria-label="Conversación con el asistente"
        role="log"
        aria-live="polite"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(26, 122, 109, 0.03) 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      >
        <div className="max-w-3xl mx-auto">
          {/* Welcome screen */}
          {isWelcomeOnly && (
            <div className="text-center py-8 animate-fade-in">
              <div className="mb-6">
                <div
                  className="w-20 h-20 rounded-3xl mx-auto flex items-center justify-center animate-float"
                  style={{ background: 'linear-gradient(135deg, #1a7a6d, #22a196)', boxShadow: '0 8px 24px rgba(26, 122, 109, 0.3)' }}
                >
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2c-4.4 0-8 3.2-8 7.2 0 2.4 1.2 4.5 3 5.8.2.1.2.3.2.5l-.4 2.5c-.1.4.3.7.7.5l2.6-1.2c.2-.1.3-.1.5 0 .5.1 1 .2 1.4.2 4.4 0 8-3.2 8-7.2S16.4 2 12 2z" fill="white" opacity="0.95"/>
                    <circle cx="9" cy="9" r="1.2" fill="#1a7a6d"/>
                    <circle cx="12" cy="9" r="1.2" fill="#1a7a6d"/>
                    <circle cx="15" cy="9" r="1.2" fill="#1a7a6d"/>
                  </svg>
                </div>
              </div>

              <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                ¡Hola! Soy tu asistente
              </h2>
              <p className="text-base mb-8 max-w-md mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
                Estoy aquí para ayudarte en lo que necesites. Puedes escribirme o hablarme con tu voz.
              </p>

              {/* Suggestion chips */}
              <div className="flex flex-wrap justify-center gap-3 max-w-lg mx-auto">
                {SUGGESTIONS.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(suggestion.text)}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200"
                    style={{
                      background: 'var(--color-bg-card)',
                      color: 'var(--color-text-primary)',
                      border: '1px solid var(--color-border)',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary-light)'; e.currentTarget.style.background = 'var(--color-primary-muted)'; e.currentTarget.style.color = 'var(--color-primary)'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.background = 'var(--color-bg-card)'; e.currentTarget.style.color = 'var(--color-text-primary)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
                  >
                    <span style={{ color: 'var(--color-accent)' }}>
                      <SuggestionIcon type={suggestion.icon} />
                    </span>
                    {suggestion.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message list (skip welcome when showing welcome screen) */}
          <div className={`space-y-4 ${isWelcomeOnly ? 'hidden' : ''}`}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
              >
                {/* Bot avatar */}
                {message.role === "assistant" && (
                  <div className="shrink-0 mt-1">
                    <BotAvatar />
                  </div>
                )}

                {/* Message content */}
                <div className={`max-w-[80%] md:max-w-[70%] ${message.role === "user" ? "order-first" : ""}`}>
                  <div
                    className={`px-5 py-4 ${
                      message.role === "user" ? "message-user" : "message-bot"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <p className="text-xs font-bold mb-1" style={{ color: 'var(--color-primary)', opacity: 0.8 }}>
                        MenteViva
                      </p>
                    )}
                    <p className="text-base leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </div>
                  {/* Timestamp */}
                  <p
                    className={`text-xs mt-1.5 px-2 ${message.role === "user" ? "text-right" : "text-left"}`}
                    style={{ color: 'var(--color-text-muted)', opacity: 0.7 }}
                  >
                    {formatTime(message.timestamp)}
                  </p>
                </div>

                {/* User avatar */}
                {message.role === "user" && (
                  <div className="shrink-0 mt-1">
                    <UserAvatar email={userEmail} />
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex gap-3 justify-start animate-fade-in">
                <div className="shrink-0 mt-1">
                  <BotAvatar />
                </div>
                <div className="message-bot px-5 py-4">
                  <p className="text-xs font-bold mb-2" style={{ color: 'var(--color-primary)', opacity: 0.8 }}>
                    MenteViva
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Pensando</span>
                    <span className="flex gap-1">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ background: 'var(--color-primary)', animation: 'bounce-dot 1.4s infinite ease-in-out', animationDelay: '0ms' }}
                      />
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ background: 'var(--color-primary)', animation: 'bounce-dot 1.4s infinite ease-in-out', animationDelay: '200ms' }}
                      />
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ background: 'var(--color-primary)', animation: 'bounce-dot 1.4s infinite ease-in-out', animationDelay: '400ms' }}
                      />
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </main>

      {/* Input area */}
      <footer className="shrink-0" style={{ background: 'var(--color-bg-card)', borderTop: '1px solid var(--color-border)' }}>
        <div className="max-w-3xl mx-auto px-4 py-4">
          {/* Recording indicator */}
          {isRecording && (
            <div
              className="mb-3 px-4 py-3 rounded-2xl flex items-center gap-3 animate-scale-in"
              style={{ background: 'rgba(229, 62, 62, 0.06)', border: '1.5px solid rgba(229, 62, 62, 0.15)' }}
            >
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ background: '#e53e3e', animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
              />
              <span className="font-semibold text-sm" style={{ color: '#c53030' }}>
                Grabando...
              </span>
              <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Pulsa detener cuando termines
              </span>
            </div>
          )}

          <div className="chat-input-wrapper">
            <div className="flex-1 min-w-0">
              <label htmlFor="message-input" className="sr-only">
                Escribe tu mensaje
              </label>
              <textarea
                ref={inputRef}
                id="message-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe tu mensaje aquí..."
                className="chat-input-textarea"
                rows={1}
                disabled={isLoading}
                aria-label="Escribe tu mensaje"
              />
            </div>

            {/* Voice button */}
            <button
              type="button"
              onClick={handleVoiceClick}
              disabled={isLoading && !isRecording}
              className="chat-input-icon"
              aria-label={isRecording ? "Detener grabación" : "Grabar mensaje de voz"}
              style={isRecording ? {
                background: '#e53e3e',
                color: 'white',
                animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                boxShadow: '0 0 0 4px rgba(229, 62, 62, 0.15)',
              } : {}}
            >
              {isRecording ? (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect x="5" y="5" width="10" height="10" rx="2" fill="currentColor"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect x="7" y="2" width="6" height="10" rx="3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  <path d="M4 10c0 3.3 2.7 6 6 6s6-2.7 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                  <line x1="10" y1="16" x2="10" y2="19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              )}
            </button>

            {/* Send button */}
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="chat-send-button"
              aria-label="Enviar mensaje"
            >
              {isLoading ? (
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.3" fill="none"/>
                  <path d="M12 2a10 10 0 019.5 6.8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 16V4m0 0l-5 5m5-5l5 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          </div>

          <p className="text-center mt-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {isRecording
              ? "Pulsa el botón de detener para enviar tu mensaje de voz"
              : "Enter para enviar · Shift+Enter para nueva línea · Micrófono para hablar"
            }
          </p>
        </div>
      </footer>
    </div>
  );
}
