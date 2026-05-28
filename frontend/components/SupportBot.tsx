"use client";

import { useState, useEffect, useRef } from "react";
import { sendSupportMessage } from "../app/api/upload";
import Link from "next/link";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function SupportBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize with welcome message
  useEffect(() => {
    setMessages([
      {
        role: "assistant",
        content: "¡Hola! Soy **DocuBot** 🤖, tu asistente inteligente de soporte técnico. ¿En qué herramienta o plan puedo ayudarte hoy?",
      },
    ]);
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  // Alert unread message if closed
  useEffect(() => {
    if (!isOpen && messages.length > 1) {
      setUnread(true);
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend ?? input).trim();
    if (!text) return;

    if (!textToSend) setInput("");
    setLoading(true);

    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);

    const cleanHistory = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const res = await sendSupportMessage(text, cleanHistory);
      if (res?.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: res.reply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Lo siento, he tenido problemas al contactar al servidor. Por favor, intenta de nuevo en unos momentos.",
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Ha ocurrido un error de red. Verifica tu conexión e intenta nuevamente.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) setUnread(false);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        type="button"
        onClick={handleToggle}
        title={isOpen ? "Cerrar soporte" : "Abrir soporte inteligente"}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full btn-gradient text-white flex items-center justify-center shadow-2xl transition-all duration-300 transform active:scale-95 ${
          isOpen ? "rotate-90 scale-95" : "hover:scale-105"
        }`}
      >
        {isOpen ? (
          <span className="text-xl">✕</span>
        ) : (
          <div className="relative">
            <span className="text-2xl">💬</span>
            {unread && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 border-2 border-white rounded-full animate-pulse" />
            )}
          </div>
        )}
      </button>

      {/* Chat Window Drawer */}
      <div
        className={`fixed bottom-24 right-6 z-50 w-80 sm:w-96 h-[480px] rounded-3xl border border-gray-100 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ease-out transform ${
          isOpen
            ? "translate-y-0 opacity-100 scale-100 pointer-events-auto"
            : "translate-y-12 opacity-0 scale-95 pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-900 dark:to-indigo-900 px-5 py-4 flex items-center gap-3 text-white">
          <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center text-lg">🤖</div>
          <div className="flex-1">
            <h3 className="text-sm font-black leading-none">Asistente Inteligente</h3>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              <span className="text-[10px] text-white/70 font-medium">DocuBot en línea</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="text-white/60 hover:text-white text-xs"
            title="Minimizar"
          >
            ✕
          </button>
        </div>

        {/* Messages list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth bg-gray-50/50 dark:bg-gray-950/20" ref={scrollRef}>
          {messages.map((m, idx) => {
            const isUser = m.role === "user";
            return (
              <div key={idx} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                    isUser
                      ? "bg-blue-600 text-white rounded-tr-none font-medium"
                      : "bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 text-gray-800 dark:text-gray-200 rounded-tl-none"
                  }`}
                >
                  {/* Simple bold formatter for assistant messages */}
                  {isUser ? (
                    m.content
                  ) : (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: m.content
                          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                          .replace(/\*(.*?)\*/g, "<em>$1</em>")
                          .replace(/\n/g, "<br/>"),
                      }}
                    />
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
        </div>

        {/* Quick Helper Actions */}
        <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 flex flex-wrap gap-1.5">
          <Link
            href="/editor"
            onClick={() => setIsOpen(false)}
            className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/20 hover:bg-blue-100 text-blue-600 dark:text-blue-400 rounded-lg text-[10px] font-bold border border-blue-100/50 dark:border-blue-900/30 transition-colors"
          >
            ✏️ Editor PDF
          </Link>
          <Link
            href="/converter"
            onClick={() => setIsOpen(false)}
            className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-100 text-emerald-600 dark:text-emerald-400 rounded-lg text-[10px] font-bold border border-emerald-100/50 dark:border-emerald-900/30 transition-colors"
          >
            🔄 Convertidor
          </Link>
          <Link
            href="/pricing"
            onClick={() => setIsOpen(false)}
            className="px-2.5 py-1 bg-yellow-50 dark:bg-yellow-950/20 hover:bg-yellow-100 text-yellow-600 dark:text-yellow-400 rounded-lg text-[10px] font-bold border border-yellow-100/50 dark:border-yellow-900/30 transition-colors"
          >
            👑 Ver Premium
          </Link>
          <button
            type="button"
            onClick={() => handleSend("¿Cuáles son los límites de uso diario?")}
            className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-600 dark:text-gray-400 rounded-lg text-[10px] font-bold border border-gray-200/50 dark:border-gray-700/30 transition-colors"
          >
            📋 Ver límites
          </button>
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder="Pregúntame lo que quieras..."
            aria-label="Mensaje para el soporte"
            className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-850 border border-gray-150 dark:border-gray-700 rounded-2xl text-xs outline-none focus:border-blue-500 dark:focus:border-blue-400 text-gray-900 dark:text-white transition-colors"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-4 py-2 btn-gradient text-white text-xs font-bold rounded-2xl shadow hover:scale-102 active:scale-98 transition-all disabled:opacity-50 disabled:scale-100"
          >
            Enviar
          </button>
        </form>
      </div>
    </>
  );
}
