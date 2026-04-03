"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { getUserProfile, getTutorProfile, getUserMemory, type UserProfile, type TutorProfile, type UserMemory } from "@/lib/profile";
import { fetchUnreadNotifications, dismissReminder, snoozeReminder, markNotificationRead, fetchReminders, createReminder, type Notification, type Reminder } from "@/lib/notifications";

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
      <circle cx="19.5" cy="20.5" r="1.5" fill="#6b5870"/>
      <circle cx="24" cy="20.5" r="1.5" fill="#6b5870"/>
      <circle cx="28.5" cy="20.5" r="1.5" fill="#6b5870"/>
      <defs>
        <linearGradient id="logo-chat" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#191919"/><stop offset="1" stopColor="#6b5870"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

function BotAvatar() {
  return (
    <div
      className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
      style={{ background: 'linear-gradient(135deg, #191919, #6b5870)', boxShadow: '0 2px 8px rgba(25, 25, 25, 0.25)' }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M12 2c-4.4 0-8 3.2-8 7.2 0 2.4 1.2 4.5 3 5.8.2.1.2.3.2.5l-.4 2.5c-.1.4.3.7.7.5l2.6-1.2c.2-.1.3-.1.5 0 .5.1 1 .2 1.4.2 4.4 0 8-3.2 8-7.2S16.4 2 12 2z" fill="white" opacity="0.95"/>
        <circle cx="9" cy="9" r="1.2" fill="#6b5870"/>
        <circle cx="12" cy="9" r="1.2" fill="#6b5870"/>
        <circle cx="15" cy="9" r="1.2" fill="#6b5870"/>
      </svg>
    </div>
  );
}

function UserAvatar({ email }: { email: string | null }) {
  const initial = email ? email.charAt(0).toUpperCase() : "U";
  return (
    <div
      className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 text-sm font-bold text-white"
      style={{ background: 'linear-gradient(135deg, #6b5870, #5a4a5e)', boxShadow: '0 2px 8px rgba(107, 88, 112, 0.25)' }}
    >
      {initial}
    </div>
  );
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Madrid" });
}

const SUGGESTIONS = [
  { text: "¿Qué tiempo hace hoy?", icon: "sun" },
  { text: "Cuéntame un dato curioso", icon: "bulb" },
  { text: "¿Cómo puedo dormir mejor?", icon: "moon" },
  { text: "Recomiéndame una receta", icon: "chef" },
  { text: "Estoy aburrido", icon: "bored" },
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
    case "bored":
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <circle cx="6.5" cy="7.5" r="1" fill="currentColor"/>
          <circle cx="11.5" cy="7.5" r="1" fill="currentColor"/>
          <path d="M6 12h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
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
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [voicePhase, setVoicePhase] = useState<"idle" | "transcribing" | "thinking" | "speaking">("idle");
  const [isStreaming, setIsStreaming] = useState(false);
  const [alertStatus, setAlertStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tutorProfile, setTutorProfile] = useState<TutorProfile | null>(null);
  const [userMemory, setUserMemory] = useState<UserMemory | null>(null);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [sessionUserMessageCount, setSessionUserMessageCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showReminders, setShowReminders] = useState(false);
  const [newReminderMessage, setNewReminderMessage] = useState("");
  const [newReminderDate, setNewReminderDate] = useState("");
  const [newReminderTime, setNewReminderTime] = useState("");
  const [creatingReminder, setCreatingReminder] = useState(false);
  const prevNotifIdsRef = useRef<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRafRef = useRef<number>(0);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;
  const sessionCountRef = useRef(sessionUserMessageCount);
  sessionCountRef.current = sessionUserMessageCount;
  const userLocationRef = useRef<{ latitude: number; longitude: number } | null>(null);
  const MAX_TEXTAREA_HEIGHT = 140;
  const userEmail = user?.email ?? null;

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
    getTutorProfile(user.id).then((tp) => setTutorProfile(tp));
    getUserMemory(user.id).then((mem) => setUserMemory(mem));
  }, [user, authLoading, router]);

  const playNotificationSound = useCallback(() => {
    try {
      const ctx = new AudioContext();
      // Two-tone chime: friendly, clear, not alarming
      const play = (freq: number, start: number, dur: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.3, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + start + dur);
        osc.connect(gain).connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + dur);
      };
      play(587, 0, 0.25);    // D5
      play(880, 0.2, 0.35);  // A5
    } catch {
      // AudioContext not available — silent fallback
    }
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    const poll = async () => {
      const notifs = await fetchUnreadNotifications(user.id);
      const newIds = new Set(notifs.map((n) => n.id));
      const hasNew = notifs.some((n) => !prevNotifIdsRef.current.has(n.id));
      if (hasNew && prevNotifIdsRef.current.size > 0) {
        playNotificationSound();
      }
      prevNotifIdsRef.current = newIds;
      setNotifications(notifs);
    };

    poll();
    const interval = setInterval(poll, 15000);
    return () => clearInterval(interval);
  }, [user?.id, playNotificationSound]);

  const loadReminders = useCallback(async () => {
    if (!user?.id) return;
    const list = await fetchReminders(user.id);
    setReminders(list);
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    loadReminders();
  }, [user?.id, loadReminders]);

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      console.warn("[MenteViva] Geolocation API not available in this browser");
      return;
    }

    console.log("[MenteViva] Requesting GPS location...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        console.log("[MenteViva] GPS location obtained:", coords);
        userLocationRef.current = coords;
        setUserLocation(coords);
      },
      (error) => {
        console.warn("[MenteViva] GPS location failed, will use profile city as fallback:", error.message);
        userLocationRef.current = null;
        setUserLocation(null);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  }, []);

  const handleCreateReminder = async () => {
    if (!user?.id || !newReminderMessage.trim() || !newReminderDate || !newReminderTime) return;
    setCreatingReminder(true);
    const remindAt = new Date(`${newReminderDate}T${newReminderTime}`).toISOString();
    const result = await createReminder(user.id, newReminderMessage.trim(), remindAt);
    if (result) {
      setNewReminderMessage("");
      setNewReminderDate("");
      setNewReminderTime("");
      await loadReminders();
    }
    setCreatingReminder(false);
  };

  const handleDismissReminder = async (reminderId: string) => {
    await dismissReminder(reminderId);
    setReminders((prev) => prev.filter((r) => r.id !== reminderId));
  };

  const scrollToBottom = () => {
    cancelAnimationFrame(scrollRafRef.current);
    scrollRafRef.current = requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });
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
    const sendMemorySummary = async () => {
      if (sessionCountRef.current <= 2) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;
      const currentMessages = messagesRef.current;
      const payload = JSON.stringify({
        messages: currentMessages.map((m) => ({ role: m.role, content: m.content })),
        access_token: session.access_token,
      });
      navigator.sendBeacon(
        "/api/memory/summarize",
        new Blob([payload], { type: "application/json" })
      );
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") sendMemorySummary();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", sendMemorySummary);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", sendMemorySummary);
    };
  }, []);

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
        body: JSON.stringify({
          to: tutorProfile?.number || undefined,
          user: userEmail,
          timestamp: new Date().toISOString(),
        }),
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

  const buildChatPayload = (text: string) => {
    // Use ref for GPS coords — it updates synchronously and avoids the
    // race condition where React state hasn't re-rendered yet.
    const loc = userLocationRef.current ?? userLocation;
    return {
      message: text,
      history: messages.map((m) => ({ role: m.role, content: m.content })),
      user_id: user?.id || null,
      user_profile: profile ? {
        name: profile.name, number: profile.number,
        description: profile.description, interests: profile.interests, city: profile.city,
      } : null,
      tutor_profile: tutorProfile ? {
        name: tutorProfile.name, number: tutorProfile.number,
        description: tutorProfile.description, instagram: tutorProfile.instagram,
        facebook: tutorProfile.facebook, relationship: tutorProfile.relationship,
        factors: tutorProfile.factors,
      } : null,
      user_memory: userMemory ? { facts: userMemory.facts, narrative: userMemory.narrative } : null,
      latitude: loc?.latitude ?? null,
      longitude: loc?.longitude ?? null,
    };
  };

  const readSSEStream = async (
    response: Response,
    messageId: string,
    onToken?: (fullText: string) => void,
  ): Promise<string> => {
    const reader = response.body?.getReader();
    if (!reader) throw new Error("No se pudo leer la respuesta del servidor");

    const decoder = new TextDecoder();
    let buffer = "";
    let fullText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data: ")) continue;
        const data = trimmed.slice(6);
        if (data === "[DONE]") continue;
        try {
          const parsed = JSON.parse(data);
          if (parsed.token) {
            fullText += parsed.token;
            const captured = fullText;
            setMessages((prev) =>
              prev.map((m) => m.id === messageId ? { ...m, content: captured } : m)
            );
            onToken?.(captured);
          }
          if (parsed.error) throw new Error(parsed.error);
        } catch (parseErr) {
          if (parseErr instanceof Error && parseErr.message.startsWith("Error")) throw parseErr;
        }
      }
    }
    return fullText;
  };

  const BORED_PROMPT = "Estoy aburrido/a y no sé qué hacer. Basándote en mi perfil, mis intereses y mi ciudad, recomiéndame alguna actividad o entretenimiento que pueda disfrutar ahora mismo.";

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    // Show the original text to the user, but send the detailed prompt to the backend
    const displayText = messageText;
    const backendText = messageText === "Estoy aburrido" ? BORED_PROMPT : messageText;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: displayText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setSessionUserMessageCount((c) => c + 1);
    setInput("");
    setIsLoading(true);

    await sendTextMessage(backendText);
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
      // --- Phase 1: Transcribe audio (fast, ~1-2s) ---
      setVoicePhase("transcribing");
      const formData = new FormData();
      formData.append("audio", audioBlob, "voice-message.webm");

      const transcribeResponse = await fetch("/api/voice/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!transcribeResponse.ok) {
        throw new Error(`Error transcribiendo: ${transcribeResponse.status}`);
      }

      const transcribeData = await transcribeResponse.json();
      const transcribedText = transcribeData.text || "";

      if (!transcribedText) {
        throw new Error("No se pudo transcribir el audio");
      }

      // Show user message immediately after transcription
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: transcribedText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setSessionUserMessageCount((c) => c + 1);

      // --- Phase 2: Get chatbot response (with full context, streamed) ---
      setVoicePhase("thinking");
      const voiceAssistantId = (Date.now() + 1).toString();

      // Add empty assistant message for streaming
      setMessages((prev) => [
        ...prev,
        { id: voiceAssistantId, role: "assistant", content: "", timestamp: new Date() },
      ]);

      const chatResponse = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildChatPayload(transcribedText)),
      });

      if (!chatResponse.ok) {
        throw new Error(`Error del chatbot: ${chatResponse.status}`);
      }

      const chatbotResponseText = await readSSEStream(chatResponse, voiceAssistantId);

      // --- Phase 3: Generate and play audio (in background, non-blocking) ---
      setVoicePhase("speaking");
      fetch("/api/voice/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: chatbotResponseText }),
      })
        .then((res) => res.ok ? res.json() : null)
        .then((ttsData) => {
          if (ttsData?.audio && ttsData?.audioType) {
            const audioBytes = Uint8Array.from(atob(ttsData.audio), c => c.charCodeAt(0));
            const ttsBlob = new Blob([audioBytes], { type: ttsData.audioType });
            const audioUrl = URL.createObjectURL(ttsBlob);
            const audio = new Audio(audioUrl);
            audio.play().catch((err) => console.error("Error playing audio:", err));
            audio.onended = () => URL.revokeObjectURL(audioUrl);
          }
        })
        .catch((err) => console.error("Error generating TTS:", err))
        .finally(() => setVoicePhase("idle"));

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
      setVoicePhase("idle");
    } finally {
      setIsLoading(false);
    }
  };

  const sendTextMessage = async (text: string) => {
    const assistantMessageId = (Date.now() + 1).toString();

    // Add an empty assistant message that we'll fill with streamed tokens
    setMessages((prev) => [
      ...prev,
      {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
      },
    ]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildChatPayload(text)),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      setIsStreaming(true);
      await readSSEStream(response, assistantMessageId);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessageId && !m.content
            ? { ...m, content: "No hay respuesta del servidor" }
            : m
        )
      );
      setIsStreaming(false);
    } catch (error) {
      console.error("Error al conectar con el servidor:", error);
      setIsStreaming(false);
      // Update the placeholder message with the error instead of adding a new one
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessageId
            ? {
                ...m,
                content: error instanceof Error
                  ? `Error: ${error.message}`
                  : "Lo siento, no pude conectar con el servidor. Intenta de nuevo.",
              }
            : m
        )
      );
    }
  };

  const handleDismissNotification = async (notif: Notification) => {
    await dismissReminder(notif.reminder_id);
    await markNotificationRead(notif.id);
    setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
  };

  const handleSnoozeNotification = async (notif: Notification) => {
    await snoozeReminder(notif.reminder_id, 10);
    await markNotificationRead(notif.id);
    setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
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
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-sm">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4"
              style={{ animation: 'slideDown 0.3s ease-out' }}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">⏰</span>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-lg">Recordatorio</p>
                  <p className="text-gray-700 mt-1">{notif.message}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleDismissNotification(notif)}
                  className="flex-1 px-4 py-2 rounded-xl text-white font-medium"
                  style={{ background: 'linear-gradient(135deg, #191919, #6b5870)' }}
                >
                  Entendido
                </button>
                <button
                  onClick={() => handleSnoozeNotification(notif)}
                  className="flex-1 px-4 py-2 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
                >
                  10 min más
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Reminders panel */}
      {showReminders && (
        <>
          <div
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.3)' }}
            onClick={() => setShowReminders(false)}
          />
          <div
            className="fixed right-4 top-16 z-50 w-full max-w-sm rounded-2xl overflow-hidden"
            style={{
              background: 'var(--color-bg-card)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
              border: '1px solid var(--color-border)',
              maxHeight: 'calc(100vh - 100px)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Panel header */}
            <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--color-border)' }}>
              <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
                Mis recordatorios
              </h2>
              <button
                onClick={() => setShowReminders(false)}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                style={{ color: 'var(--color-text-muted)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-bg-secondary)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                aria-label="Cerrar panel de recordatorios"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            {/* Add new reminder form */}
            <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
              <p className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
                Nuevo recordatorio
              </p>
              <input
                type="text"
                value={newReminderMessage}
                onChange={(e) => setNewReminderMessage(e.target.value)}
                placeholder="Ej: Tomar la medicación"
                className="w-full px-4 py-3 rounded-xl text-base mb-3 outline-none transition-colors"
                style={{
                  background: 'var(--color-bg-secondary)',
                  color: 'var(--color-text-primary)',
                  border: '1px solid var(--color-border)',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary-light)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; }}
              />
              <div className="flex gap-2 mb-3">
                <input
                  type="date"
                  value={newReminderDate}
                  onChange={(e) => setNewReminderDate(e.target.value)}
                  className="flex-1 px-3 py-3 rounded-xl text-sm outline-none transition-colors"
                  style={{
                    background: 'var(--color-bg-secondary)',
                    color: 'var(--color-text-primary)',
                    border: '1px solid var(--color-border)',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary-light)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; }}
                />
                <input
                  type="time"
                  value={newReminderTime}
                  onChange={(e) => setNewReminderTime(e.target.value)}
                  className="flex-1 px-3 py-3 rounded-xl text-sm outline-none transition-colors"
                  style={{
                    background: 'var(--color-bg-secondary)',
                    color: 'var(--color-text-primary)',
                    border: '1px solid var(--color-border)',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary-light)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; }}
                />
              </div>
              <button
                onClick={handleCreateReminder}
                disabled={creatingReminder || !newReminderMessage.trim() || !newReminderDate || !newReminderTime}
                className="w-full px-4 py-3 rounded-xl text-white font-semibold text-base transition-all duration-200"
                style={{
                  background: (creatingReminder || !newReminderMessage.trim() || !newReminderDate || !newReminderTime)
                    ? 'var(--color-text-muted)'
                    : 'linear-gradient(135deg, #191919, #6b5870)',
                  opacity: (creatingReminder || !newReminderMessage.trim() || !newReminderDate || !newReminderTime) ? 0.5 : 1,
                  cursor: (creatingReminder || !newReminderMessage.trim() || !newReminderDate || !newReminderTime) ? 'not-allowed' : 'pointer',
                }}
              >
                {creatingReminder ? "Creando..." : "Crear recordatorio"}
              </button>
            </div>

            {/* Reminders list */}
            <div className="flex-1 overflow-y-auto px-5 py-4" style={{ maxHeight: '320px' }}>
              {reminders.length === 0 ? (
                <div className="text-center py-8">
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="mx-auto mb-3" style={{ opacity: 0.3 }}>
                    <path d="M20 4a12 12 0 00-12 12v7l-3 5h30l-3-5v-7A12 12 0 0020 4z" stroke="currentColor" strokeWidth="2" fill="none" style={{ color: 'var(--color-text-muted)' }}/>
                    <path d="M15 28v1a5 5 0 0010 0v-1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: 'var(--color-text-muted)' }}/>
                  </svg>
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    No tienes recordatorios activos
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reminders.map((reminder) => {
                    const remindDate = new Date(reminder.remind_at);
                    const isPast = remindDate < new Date();
                    return (
                      <div
                        key={reminder.id}
                        className="p-4 rounded-xl transition-colors"
                        style={{
                          background: isPast ? 'rgba(229, 62, 62, 0.05)' : 'var(--color-bg-secondary)',
                          border: isPast ? '1px solid rgba(229, 62, 62, 0.2)' : '1px solid var(--color-border)',
                        }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-base" style={{ color: 'var(--color-text-primary)' }}>
                              {reminder.message}
                            </p>
                            <p className="text-sm mt-1" style={{ color: isPast ? '#c53030' : 'var(--color-text-muted)' }}>
                              {remindDate.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short", timeZone: "Europe/Madrid" })}
                              {" a las "}
                              {remindDate.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Madrid" })}
                              {isPast && " (vencido)"}
                            </p>
                            {reminder.recurrence && (
                              <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                                Recurrente
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => handleDismissReminder(reminder.id)}
                            className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                            style={{ color: 'var(--color-text-muted)' }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(229, 62, 62, 0.1)'; e.currentTarget.style.color = '#c53030'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}
                            aria-label="Eliminar recordatorio"
                            title="Eliminar"
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Header with gradient accent line */}
      <div className="shrink-0">
        <div className="h-1 gradient-warm" />
        <header
          className="py-3 px-4 md:px-6 flex items-center justify-between"
          style={{
            background: 'var(--color-bg-card)',
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
                <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8l3.5 3.5L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
                  <path d="M8 1.5a5 5 0 00-5 5v3l-1.5 2H14.5L13 9.5v-3a5 5 0 00-5-5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
                  <path d="M6.5 13.5a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              )}
              <span className="hidden sm:inline">
                {alertStatus === "sending" ? "Enviando..." : alertStatus === "sent" ? "¡Alerta enviada!" : alertStatus === "error" ? "Error, reintentar" : "Alerta"}
              </span>
            </button>

            {/* Online indicator */}
            <div
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
              style={{ background: 'rgba(56, 161, 105, 0.1)', color: '#38a169' }}
            >
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#38a169' }} />
              En línea
            </div>

            {/* Reminders button */}
            <button
              onClick={() => { setShowReminders(!showReminders); if (!showReminders) loadReminders(); }}
              className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200"
              style={{
                color: showReminders ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                background: showReminders ? 'var(--color-primary-muted)' : 'var(--color-bg-secondary)',
                border: showReminders ? '1px solid var(--color-primary-light)' : '1px solid var(--color-border)',
              }}
              onMouseEnter={(e) => { if (!showReminders) { e.currentTarget.style.background = 'var(--color-primary-muted)'; e.currentTarget.style.color = 'var(--color-primary)'; e.currentTarget.style.borderColor = 'var(--color-primary-light)'; }}}
              onMouseLeave={(e) => { if (!showReminders) { e.currentTarget.style.background = 'var(--color-bg-secondary)'; e.currentTarget.style.color = 'var(--color-text-secondary)'; e.currentTarget.style.borderColor = 'var(--color-border)'; }}}
              aria-label="Ver recordatorios"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 2a6 6 0 00-6 6v3.5L2.5 14h15L16 11.5V8a6 6 0 00-6-6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
                <path d="M7.5 14v.5a2.5 2.5 0 005 0V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span className="hidden sm:inline">Recordatorios</span>
              {reminders.length > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center text-white"
                  style={{ background: 'linear-gradient(135deg, #6b5870, #5a4a5e)' }}
                >
                  {reminders.length}
                </span>
              )}
            </button>

            {/* Settings button */}
            <button
              onClick={() => router.push("/settings")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200"
              style={{
                color: 'var(--color-text-secondary)',
                background: 'var(--color-bg-secondary)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-primary-muted)'; e.currentTarget.style.color = 'var(--color-primary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--color-bg-secondary)'; e.currentTarget.style.color = 'var(--color-text-secondary)'; }}
              aria-label="Ajustes de apariencia"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <path d="M10 1.5v2M10 16.5v2M1.5 10h2M16.5 10h2M4.1 4.1l1.4 1.4M14.5 14.5l1.4 1.4M4.1 15.9l1.4-1.4M14.5 5.5l1.4-1.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span className="hidden sm:inline">Ajustes</span>
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
              <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
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
              <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
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
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(25, 25, 25, 0.03) 1px, transparent 0)',
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
                  style={{ background: 'linear-gradient(135deg, #191919, #6b5870)', boxShadow: '0 8px 24px rgba(25, 25, 25, 0.3)' }}
                >
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2c-4.4 0-8 3.2-8 7.2 0 2.4 1.2 4.5 3 5.8.2.1.2.3.2.5l-.4 2.5c-.1.4.3.7.7.5l2.6-1.2c.2-.1.3-.1.5 0 .5.1 1 .2 1.4.2 4.4 0 8-3.2 8-7.2S16.4 2 12 2z" fill="white" opacity="0.95"/>
                    <circle cx="9" cy="9" r="1.2" fill="#6b5870"/>
                    <circle cx="12" cy="9" r="1.2" fill="#6b5870"/>
                    <circle cx="15" cy="9" r="1.2" fill="#6b5870"/>
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
            {messages.map((message) => {
              // Hide empty placeholder messages — the typing indicator covers this state
              if (message.role === "assistant" && !message.content) return null;

              return (
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
              );
            })}

            {/* Typing / voice phase indicator (hidden once tokens start streaming) */}
            {((isLoading && !isStreaming) || voicePhase !== "idle") && (
              <div className="flex gap-3 justify-start animate-fade-in">
                <div className="shrink-0 mt-1">
                  <BotAvatar />
                </div>
                <div className="message-bot px-5 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                      {voicePhase === "transcribing" ? "Escuchando" :
                       voicePhase === "thinking" ? "Pensando" :
                       voicePhase === "speaking" ? "Preparando audio" :
                       "Pensando"}
                    </span>
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
      <footer className="shrink-0" style={{ background: 'var(--color-bg-card)' }}>
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

          {/* Bored button - always visible */}
          {!isWelcomeOnly && (
            <div className="mb-3 flex justify-center">
              <button
                onClick={() => handleSend("Estoy aburrido")}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200"
                style={{
                  background: 'var(--color-bg-card)',
                  color: 'var(--color-text-primary)',
                  border: '1px solid var(--color-border)',
                  boxShadow: 'var(--shadow-sm)',
                  opacity: isLoading ? 0.5 : 1,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                }}
                onMouseEnter={(e) => { if (!isLoading) { e.currentTarget.style.borderColor = 'var(--color-primary-light)'; e.currentTarget.style.background = 'var(--color-primary-muted)'; e.currentTarget.style.color = 'var(--color-primary)'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.background = 'var(--color-bg-card)'; e.currentTarget.style.color = 'var(--color-text-primary)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
                aria-label="Estoy aburrido - pedir recomendación"
              >
                <SuggestionIcon type="bored" />
                Estoy aburrido
              </button>
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
