"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  X,
  Send,
  RotateCcw,
  CheckCircle2,
  Bot,
  User,
  Info,
  ChevronRight,
  MessageSquare,
} from "lucide-react";
import { useAssistant } from "../hooks/useAssistant";
import type { AssistantStep, AvailablePortion } from "../types/ai";

interface AIAssistantSidebarProps {
  step: AssistantStep;
  foodName?: string;
  mealType?: string;
  availablePortions?: AvailablePortion[];
  contextFoods?: string[];
  onSelectPortion?: (label: string, gram?: number) => void;
  onAddSuggestedFood?: (foodName: string) => void;
}

export function AIAssistantSidebar({
  step,
  foodName,
  mealType,
  availablePortions = [],
  contextFoods = [],
  onSelectPortion,
  onAddSuggestedFood,
}: AIAssistantSidebarProps) {
  const {
    isOpen,
    setIsOpen,
    toggleOpen,
    messages,
    isLoading,
    sendMessage,
    resetChat,
  } = useAssistant({
    step,
    foodName,
    mealType,
    availablePortions,
    contextFoods,
  });

  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll ke bawah saat ada pesan baru
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Focus input saat sidebar dibuka
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput("");
  };

  const handleQuickReply = (text: string) => {
    sendMessage(text);
  };

  return (
    <>
      {/* ─── Floating Action Button (FAB) ─── */}
      {!isOpen && (
        <button
          onClick={toggleOpen}
          aria-label="Buka Asisten AI"
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 px-4 py-3 text-white shadow-xl shadow-red-500/25 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/35 focus:outline-none focus:ring-4 focus:ring-red-500/30 active:scale-95 group"
        >
          <div className="relative flex items-center justify-center">
            <Sparkles className="h-5 w-5 animate-pulse text-amber-200" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-300 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400"></span>
            </span>
          </div>
          <span className="text-sm font-semibold tracking-wide">
            {step === "portion" ? "Tanya AI Porsi" : "Asisten AI"}
          </span>
        </button>
      )}

      {/* ─── Backdrop Overlay (Mobile) ─── */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-xs transition-opacity duration-300 md:hidden"
        />
      )}

      {/* ─── Slide-Over Drawer ─── */}
      <aside
        className={`fixed top-0 right-0 z-50 flex h-full w-full flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out sm:w-[400px] border-l border-slate-200 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Panel Asisten AI Atlas"
      >
        {/* Drawer Header */}
        <header className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-4 py-3.5 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-amber-500 shadow-md shadow-red-500/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold tracking-tight">Atlas AI Assistant</h3>
                <span className="rounded-full bg-amber-400/20 px-1.5 py-0.5 text-[10px] font-semibold text-amber-300 border border-amber-400/30">
                  URT Kemenkes
                </span>
              </div>
              <p className="text-[11px] text-slate-300 line-clamp-1">
                {foodName ? `Konteks: ${foodName}` : "Panduan Estimasi Porsi & URT"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={resetChat}
              title="Mulai Ulang Chat"
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              title="Tutup Panel"
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Info Banner Konteks Makanan */}
        {foodName && step === "portion" && (
          <div className="flex items-center justify-between bg-amber-50/80 px-4 py-2 text-xs border-b border-amber-100 text-amber-900">
            <div className="flex items-center gap-1.5 font-medium line-clamp-1">
              <span className="text-amber-600 font-bold">Makanan:</span>
              <span className="font-semibold">{foodName}</span>
            </div>
            {availablePortions.length > 0 && (
              <span className="text-[11px] text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-full shrink-0 font-medium">
                {availablePortions.length} Foto Porsi
              </span>
            )}
          </div>
        )}

        {/* Chat History Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {messages.map((msg) => {
            const isUser = msg.sender === "user";
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <div className="flex h-7 w-7 shrink-0 select-none items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-xs">
                    <Bot className="h-4 w-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-xs transition-all ${
                    isUser
                      ? "bg-red-600 text-white rounded-tr-xs"
                      : "bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs"
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>

                  {/* ─── Smart Action Chip: Pilih Porsi Otomatis (1-Click) ─── */}
                  {!isUser && msg.response?.recommended_label && onSelectPortion && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100">
                      <button
                        onClick={() =>
                          onSelectPortion(
                            msg.response!.recommended_label!,
                            msg.response!.recommended_gram
                          )
                        }
                        className="group flex w-full items-center justify-between gap-2 rounded-xl bg-gradient-to-r from-red-50 to-amber-50 px-3 py-2 text-xs font-semibold text-red-700 border border-red-200/80 transition-all hover:bg-gradient-to-r hover:from-red-600 hover:to-rose-600 hover:text-white hover:border-transparent hover:shadow-md hover:shadow-red-500/20 active:scale-98"
                      >
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 group-hover:text-white" />
                          <span>
                            Pilih Porsi {msg.response.recommended_label}
                            {msg.response.recommended_gram
                              ? ` (${msg.response.recommended_gram}g)`
                              : ""}
                          </span>
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  )}

                  {/* ─── Suggested Foods Chips (Step 2 / Step 4) ─── */}
                  {!isUser &&
                    msg.response?.suggested_foods &&
                    msg.response.suggested_foods.length > 0 &&
                    onAddSuggestedFood && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100">
                        <p className="text-[10px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                          Makanan Terkait:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.response.suggested_foods.map((food, idx) => (
                            <button
                              key={idx}
                              onClick={() => onAddSuggestedFood(food)}
                              className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-red-50 hover:text-red-700 hover:border-red-200 border border-slate-200 transition-colors"
                            >
                              <span>+</span> {food}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                </div>

                {isUser && (
                  <div className="flex h-7 w-7 shrink-0 select-none items-center justify-center rounded-lg bg-slate-200 text-slate-700">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-2.5 items-center text-slate-500 text-xs py-1">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-rose-600 text-white">
                <Bot className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-1.5 bg-white border border-slate-200/80 rounded-2xl rounded-tl-xs px-3 py-2 shadow-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-red-600 animate-bounce [animation-delay:-0.3s]"></span>
                <span className="h-1.5 w-1.5 rounded-full bg-red-600 animate-bounce [animation-delay:-0.15s]"></span>
                <span className="h-1.5 w-1.5 rounded-full bg-red-600 animate-bounce"></span>
                <span className="text-[11px] text-slate-500 ml-1.5">Menganalisis porsi...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompt Pills (jika ada di respon terakhir) */}
        {(() => {
          const lastMsg = messages[messages.length - 1];
          const quickReplies = lastMsg?.response?.quick_replies;
          if (!quickReplies || quickReplies.length === 0 || isLoading) return null;

          return (
            <div className="px-3 py-2 bg-white border-t border-slate-100 overflow-x-auto no-scrollbar flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              {quickReplies.map((reply, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickReply(reply)}
                  className="shrink-0 rounded-full bg-slate-100 hover:bg-red-50 hover:text-red-700 hover:border-red-200 border border-slate-200 px-2.5 py-1 text-[11px] text-slate-600 transition-colors"
                >
                  {reply}
                </button>
              ))}
            </div>
          );
        })()}

        {/* Input Bar */}
        <footer className="border-t border-slate-200 bg-white p-3">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                step === "portion"
                  ? "Tanya porsi (mis. 2 potong sedang)..."
                  : "Ketik pertanyaan Anda..."
              }
              disabled={isLoading}
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-red-600 text-white shadow-xs transition-all hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/30 disabled:opacity-40 disabled:hover:bg-red-600"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>

          <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <Info className="h-3 w-3 text-slate-400" />
              Gizi dihitung akurat dari TKPI 2020
            </span>
            <span>Didukung Groq AI</span>
          </div>
        </footer>
      </aside>
    </>
  );
}
