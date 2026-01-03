"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

// Tipo para los mensajes del chat
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function ChatbotPage() {
  const router = useRouter();
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Scroll automático al final de los mensajes
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Obtener información del usuario
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email ?? null);
      }
    };
    getUser();
  }, []);

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
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Error en la respuesta");
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Lo siento, ha ocurrido un error. Por favor, inténtalo de nuevo en unos momentos.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  // Manejar Enter para enviar
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

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
                <p className="text-lg leading-relaxed whitespace-pre-wrap">
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
          <div className="flex gap-4 items-end">
            <div className="flex-1">
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
                className="input resize-none"
                style={{ minHeight: '64px', maxHeight: '150px' }}
                rows={2}
                disabled={isLoading}
                aria-label="Escribe tu mensaje"
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="btn btn-primary px-8"
              style={{ minHeight: '64px', minWidth: '120px' }}
              aria-label="Enviar mensaje"
            >
              {isLoading ? (
                <span className="animate-pulse">⏳</span>
              ) : (
                <span className="flex items-center gap-2">
                  Enviar
                  <span className="text-xl">→</span>
                </span>
              )}
            </button>
          </div>
          <p className="text-center mt-3 text-base" style={{ color: 'var(--color-text-muted)' }}>
            Pulsa Enter para enviar o usa el botón
          </p>
        </div>
      </footer>
    </div>
  );
}
