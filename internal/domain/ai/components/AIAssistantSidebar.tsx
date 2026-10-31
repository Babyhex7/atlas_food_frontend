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
  onSelectMeal?: (mealType: string, time?: string) => void;
}

export function AIAssistantSidebar({
  step,
  foodName,
  mealType,
  availablePortions = [],
  contextFoods = [],
  onSelectPortion,
  onAddSuggestedFood,
  onSelectMeal,
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

  const getFabLabel = () => {
    switch (step) {
      case "meal":
        return "Asisten Waktu Makan";
      case "food":
        return "AI Cari Makanan";
      case "portion":
        return "Tanya AI Porsi";
      case "additional":
        return "Asisten Pelengkap";
      case "review":
        return "Audit Terlewat";
      default:
        return "Asisten AI";
    }
  };

  return (
    <>
      {/* ─── Floating Action Button (FAB) ─── */}
      {!isOpen && (
        <button
          onClick={toggleOpen}
          aria-label="Buka Asisten AI"
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-white hover:bg-slate-50 text-slate-800 px-3.5 py-2 shadow-lg border border-slate-200/90 transition-all duration-150 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-red-500/30 active:scale-95"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-50 text-red-600">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <span className="text-xs font-semibold text-slate-700 tracking-tight">
            {getFabLabel()}
          </span>
        </button>
      )}

      {/* ─── Backdrop Overlay (Mobile) ─── */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-xs transition-opacity duration-200 md:hidden"
        />
      )}

      {/* ─── Slide-Over Drawer ─── */}
      <aside
        className={`fixed top-0 right-0 z-50 flex h-full w-full flex-col bg-white shadow-2xl transition-transform duration-200 ease-in-out sm:w-[380px] border-l border-slate-200 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Panel Asisten AI Atlas"
      >
        {/* Drawer Header */}
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 border border-red-100">
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-bold text-slate-900">Asisten Recall</h3>
                <span className="rounded px-1.5 py-0.2 text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                  URT Standar
                </span>
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-1">
                {foodName ? `Konteks: ${foodName}` : "Panduan Estimasi & Porsi"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={resetChat}
              title="Mulai Ulang Chat"
              className="rounded-md p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              title="Tutup Panel"
              className="rounded-md p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Info Banner Konteks Makanan */}
        {foodName && step === "portion" && (
          <div className="flex items-center justify-between bg-slate-50 px-4 py-2 text-xs border-b border-slate-200 text-slate-700">
            <div className="flex items-center gap-1.5 font-medium line-clamp-1">
              <span className="text-slate-500">Makanan:</span>
              <span className="font-semibold text-slate-900">{foodName}</span>
            </div>
            {availablePortions.length > 0 && (
              <span className="text-[10px] text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-full shrink-0 font-medium">
                {availablePortions.length} Foto Porsi
              </span>
            )}
          </div>
        )}

        {/* Chat History Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/40">
          {messages.map((msg) => {
            const isUser = msg.sender === "user";
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <div className="flex h-6 w-6 shrink-0 select-none items-center justify-center rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed shadow-xs transition-all ${
                    isUser
                      ? "bg-slate-900 text-white rounded-tr-xs"
                      : "bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs"
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
                        className="flex w-full items-center justify-between gap-2 rounded-lg bg-red-50 hover:bg-red-600 hover:text-white text-red-700 border border-red-200 px-3 py-2 text-xs font-medium transition-colors group"
                      >
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-red-600 group-hover:text-white" />
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

                  {/* ─── Smart Action Chip: Pilih Waktu Makan (Step 1) ─── */}
                  {!isUser && step === "meal" && onSelectMeal && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100">
                      <p className="text-[10px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                        Pilih Sesi Makan:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { name: "Sarapan", time: "07:00" },
                          { name: "Snack Pagi", time: "10:00" },
                          { name: "Makan Siang", time: "12:30" },
                          { name: "Snack Sore", time: "16:00" },
                          { name: "Makan Malam", time: "19:00" },
                          { name: "Snack Malam", time: "21:30" },
                        ].map((m) => (
                          <button
                            key={m.name}
                            onClick={() => onSelectMeal(m.name, m.time)}
                            className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-medium border transition-colors ${
                              mealType === m.name
                                ? "bg-slate-900 text-white border-slate-900"
                                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                            }`}
                          >
                            <span>{m.name} ({m.time})</span>
                          </button>
                        ))}
                      </div>
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
                              className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50 hover:text-red-700 hover:border-red-200 border border-slate-200 transition-colors"
                            >
                              <span className="text-slate-400 font-bold">+</span> {food}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                </div>

                {isUser && (
                  <div className="flex h-6 w-6 shrink-0 select-none items-center justify-center rounded-md bg-red-100 text-red-700 border border-red-200">
                    <User className="h-3.5 w-3.5" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-2 items-center text-slate-500 text-xs py-1">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500 border border-slate-200">
                <Bot className="h-3.5 w-3.5" />
              </div>
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl rounded-tl-xs px-3 py-2 shadow-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-pulse"></span>
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-pulse [animation-delay:200ms]"></span>
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-pulse [animation-delay:400ms]"></span>
                <span className="text-[11px] text-slate-500 ml-1">Menganalisis porsi URT...</span>
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
              <MessageSquare className="h-3 w-3 text-slate-400 shrink-0" />
              {quickReplies.map((reply, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickReply(reply)}
                  className="shrink-0 rounded-md bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 text-[11px] transition-colors"
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
                  : "Tanyakan bantuan recall..."
              }
              disabled={isLoading}
              className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-red-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-600 text-white transition-colors hover:bg-red-700 focus:outline-none disabled:opacity-40"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>

          <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <Info className="h-3 w-3 text-slate-400" />
              Standar URT Kemenkes & TKPI
            </span>
            <span>Asisten AI</span>
          </div>
        </footer>
      </aside>
    </>
  );
}

