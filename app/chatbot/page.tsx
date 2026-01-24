"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";

// Tipo para los mensajes del chat
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function ChatbotPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "¡Hola! 👋 Soy tu asistente personal. Estoy aquí para ayudarte en lo que necesites. ¿En qué puedo ayudarte hoy?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const MAX_TEXTAREA_HEIGHT = 140;

  // Verificar autenticación y redirigir si no está autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      const currentPath = window.location.pathname;
      router.push(`/auth/login?redirect=${encodeURIComponent(currentPath)}`);
    }
  }, [user, authLoading, router]);

  // Scroll automático al final de los mensajes
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

  // Obtener información del usuario
  useEffect(() => {
    if (user) {
      setUserEmail(user.email ?? null);
    }
  }, [user]);

  // Cerrar sesión
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  // Enviar mensaje
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageText = input.trim();
    setInput("");
    setIsLoading(true);

    await sendTextMessage(messageText);
    setIsLoading(false);
    inputRef.current?.focus();
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  // Manejar Enter para enviar
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Iniciar grabación de voz
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
        
        // Detener todos los tracks del stream
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

  // Detener grabación de voz
  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  // Enviar mensaje de voz al servidor
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

      if (transcribedText) {
        // Agregar el mensaje transcrito como mensaje del usuario con icono de micrófono
        const userMessage: Message = {
          id: Date.now().toString(),
          role: "user",
          content: `🎤 ${transcribedText}`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMessage]);

        // Si la API de voz también devuelve una respuesta completa, agregarla
        if (data.response && typeof data.response === "string" && data.response.trim()) {
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: data.response,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, assistantMessage]);
        } else {
          // Si no hay respuesta directa de la API de voz, enviar el texto transcrito al chat normal para obtener una respuesta del asistente
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

  // Enviar mensaje de texto (extraído de handleSend para reutilizar)
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

  // Manejar clic en el botón de voz
  const handleVoiceClick = () => {
    if (isRecording) {
      stopRecording();
    } else if (!isLoading) {
      startRecording();
    }
  };

  // Mostrar loading mientras se verifica la autenticación
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg-secondary)' }}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl animate-pulse" style={{ background: 'var(--color-primary)' }}>
            ⏳
          </div>
          <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
            Verificando sesión...
          </p>
        </div>
      </div>
    );
  }

  // Si no hay usuario, no mostrar nada (ya se está redirigiendo)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-bg-secondary)' }}>
      {/* Cabecera */}
      <header 
        className="py-4 px-6 flex items-center justify-between"
        style={{ background: 'var(--color-bg-card)', borderBottom: '1px solid var(--color-border)' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl" style={{ background: 'var(--color-primary)' }}>
            💬
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              Tu Asistente
            </h1>
            {userEmail && (
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                {userEmail}
              </p>
            )}
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="btn btn-secondary text-base px-6"
          aria-label="Cerrar sesión"
        >
          Salir
        </button>
      </header>

      {/* Área de mensajes */}
      <main 
        id="main-content"
        className="flex-1 overflow-y-auto px-4 py-6"
        style={{ maxHeight: 'calc(100vh - 180px)' }}
        aria-label="Conversación con el asistente"
        role="log"
        aria-live="polite"
      >
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
            >
              <div
                className={`max-w-[85%] md:max-w-[75%] p-5 ${
                  message.role === "user" ? "message-user" : "message-bot"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">🤖</span>
                    <span className="font-semibold text-base" style={{ color: 'var(--color-primary)' }}>
                      Asistente
                    </span>
                  </div>
                )}
                <p className="text-lg leading-relaxed whitespace-pre-wrap ">
                  {message.content}
                </p>
              </div>
            </div>
          ))}

          {/* Indicador de escritura */}
          {isLoading && (
            <div className="flex justify-start animate-fade-in">
              <div className="message-bot p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🤖</span>
                  <span className="font-semibold text-base" style={{ color: 'var(--color-primary)' }}>
                    Asistente
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">Escribiendo</span>
                  <span className="flex gap-1">
                    <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--color-primary)', animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--color-primary)', animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--color-primary)', animationDelay: '300ms' }}></span>
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Área de entrada */}
      <footer 
        className="p-4"
        style={{ background: 'var(--color-bg-card)', borderTop: '1px solid var(--color-border)' }}
      >
        <div className="max-w-3xl mx-auto">
          {/* Indicador de grabación */}
          {isRecording && (
            <div className="mb-3 p-3 rounded-lg flex items-center gap-3 animate-fade-in" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444' }}>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full animate-pulse" style={{ background: '#ef4444' }}></span>
                <span className="font-semibold" style={{ color: '#ef4444' }}>
                  Grabando...
                </span>
              </div>
              <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Haz clic en el botón de detener cuando termines
              </span>
            </div>
          )}
          <div className="chat-input-wrapper">
            <button
              type="button"
              className="chat-input-quick-action"
              aria-label="Adjuntar contenido"
            >
              <span aria-hidden="true">+</span>
            </button>
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
            <button
              type="button"
              onClick={handleVoiceClick}
              disabled={isLoading}
              className={`chat-input-icon ${isRecording ? 'recording' : ''}`}
              aria-label={isRecording ? "Detener grabación" : "Grabar mensaje de voz"}
              style={isRecording ? { 
                background: '#ef4444', 
                animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite' 
              } : {}}
            >
              <span className="text-lg" aria-hidden="true">
                {isRecording ? '⏹️' : '🎤'}
              </span>
            </button>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="chat-send-button"
              aria-label="Enviar mensaje"
            >
              {isLoading ? (
                <span className="animate-pulse text-2xl">⏳</span>
              ) : (
                <span className="text-2xl" aria-hidden="true">
                  ↑
                </span>
              )}
            </button>
          </div>
          <p className="text-center mt-3 text-base" style={{ color: 'var(--color-text-muted)' }}>
            {isRecording 
              ? "Pulsa el botón de detener para enviar tu mensaje de voz" 
              : "Pulsa Enter para enviar, usa el botón o graba un mensaje de voz"
            }
          </p>
        </div>
      </footer>
    </div>
  );
}
