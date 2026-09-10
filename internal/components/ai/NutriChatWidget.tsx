"use client";

import React, { useState, useEffect, useRef } from "react";
import { useChatStore } from "../../domain/ai/store/chatStore";
import { useChatSessions, useChatMessages, useSendMessage } from "../../domain/ai/hooks/useNutriChat";
import { FaRobot, FaTimes, FaPaperPlane, FaChevronDown } from "react-icons/fa";
import { showXPToast } from "../gamification/XPToast";
import ReactMarkdown from "react-markdown";

export const NutriChatWidget: React.FC = () => {
  const { isOpen, toggleOpen, activeSessionId, setActiveSessionId } = useChatStore();
  
  const [inputMsg, setInputMsg] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: sessions, isLoading: loadingSessions } = useChatSessions();
  const { data: messages, isLoading: loadingMessages } = useChatMessages(activeSessionId);
  const sendMessageMutation = useSendMessage();

  const [localMessages, setLocalMessages] = useState<any[]>([]);

  useEffect(() => {
    if (messages) {
      setLocalMessages(messages);
      scrollToBottom();
    }
  }, [messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleSend = () => {
    if (!inputMsg.trim() || sendMessageMutation.isPending) return;

    const newMsg = {
      id: Date.now().toString(),
      role: "user",
      content: inputMsg,
      created_at: new Date().toISOString()
    };
    
    setLocalMessages(prev => [...prev, newMsg]);
    scrollToBottom();
    
    const requestData = {
      message: inputMsg,
      session_id: activeSessionId || undefined
    };
    
    setInputMsg("");

    sendMessageMutation.mutate(requestData, {
      onSuccess: (data) => {
        if (!activeSessionId) {
          setActiveSessionId(data.session_id);
        }
        
        const botMsg = {
          id: Date.now().toString(),
          role: "assistant",
          content: data.reply,
          created_at: new Date().toISOString()
        };
        setLocalMessages(prev => [...prev, botMsg]);
        scrollToBottom();

        if (data.xp_earned > 0) {
          showXPToast(data.xp_earned, "Memulai sesi chat dengan NutriBot");
        }
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={toggleOpen}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-[0_10px_25px_-5px_rgba(79,70,229,0.5)] flex items-center justify-center hover:scale-110 transition-transform z-50"
      >
        <FaRobot className="text-3xl" />
        <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-full max-w-sm h-[600px] max-h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 border border-gray-100 flex-shrink-0 animate-in fade-in slide-in-from-bottom-10">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <FaRobot className="text-xl" />
          </div>
          <div>
            <h3 className="font-bold text-lg">NutriBot</h3>
            <p className="text-xs text-indigo-100 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-400"></span>
              Online
            </p>
          </div>
        </div>
        <button onClick={toggleOpen} className="text-white/80 hover:text-white transition-colors p-1">
          <FaChevronDown className="text-xl" />
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-gray-50 p-4 overflow-y-auto flex flex-col gap-4">
        {(!localMessages || localMessages.length === 0) && !loadingMessages && (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 p-6">
            <FaRobot className="text-5xl text-gray-300 mb-4" />
            <p className="text-sm font-medium text-gray-600">Halo! Saya NutriBot.</p>
            <p className="text-xs mt-2">Tanya saya tentang kalori, gizi makanan, atau rekomendasi menu sehat hari ini!</p>
            
            <div className="mt-6 flex flex-col gap-2 w-full">
              <button onClick={() => setInputMsg("Berapa kalori satu porsi nasi padang?")} className="text-xs bg-white border border-gray-200 text-indigo-600 p-2 rounded-xl text-left hover:bg-indigo-50 transition-colors">
                Berapa kalori satu porsi nasi padang?
              </button>
              <button onClick={() => setInputMsg("Rekomendasi sarapan tinggi protein murah")} className="text-xs bg-white border border-gray-200 text-indigo-600 p-2 rounded-xl text-left hover:bg-indigo-50 transition-colors">
                Rekomendasi sarapan tinggi protein murah
              </button>
            </div>
          </div>
        )}

        {localMessages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-3 ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-br-none shadow-sm' 
                : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none shadow-sm'
            }`}>
              {msg.role === 'assistant' ? (
                <div className="text-sm prose prose-sm prose-indigo prose-p:my-1 prose-ul:my-1 max-w-none">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm">{msg.content}</p>
              )}
            </div>
          </div>
        ))}
        
        {sendMessageMutation.isPending && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-bl-none shadow-sm p-4 flex gap-2">
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white border-t border-gray-100">
        <div className="flex items-center gap-2 bg-gray-50 rounded-full p-1 pl-4 border border-gray-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-200 transition-all">
          <input 
            type="text" 
            placeholder="Ketik pesan..." 
            className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-sm py-2"
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={sendMessageMutation.isPending}
          />
          <button 
            onClick={handleSend}
            disabled={!inputMsg.trim() || sendMessageMutation.isPending}
            className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors flex-shrink-0 shadow-sm"
          >
            <FaPaperPlane className="text-sm mr-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
