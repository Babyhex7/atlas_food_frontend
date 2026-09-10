"use client";

import React, { useState, useEffect, useRef } from "react";
import { useChatSessions, useChatMessages, useSendMessage } from "../../internal/domain/ai/hooks/useNutriChat";
import { FaRobot, FaPaperPlane, FaPlus, FaComments } from "react-icons/fa";
import { showXPToast } from "../../internal/components/gamification/XPToast";
import ReactMarkdown from "react-markdown";
import { useChatStore } from "../../internal/domain/ai/store/chatStore";

export default function AiChatPage() {
  const { activeSessionId, setActiveSessionId } = useChatStore();
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

  // When clicking new chat, just clear active session and local messages
  const handleNewChat = () => {
    setActiveSessionId(null);
    setLocalMessages([]);
  };

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
          showXPToast(data.xp_earned, "Sesi Chat NutriBot");
        }
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-white overflow-hidden pt-16">
      {/* Sidebar for Sessions */}
      <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col hidden md:flex">
        <div className="p-4 border-b border-gray-200">
          <button 
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-2.5 rounded-xl font-medium shadow-sm transition-colors"
          >
            <FaPlus className="text-sm" /> Chat Baru
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">Riwayat Percakapan</h3>
          
          {loadingSessions ? (
            <div className="flex justify-center p-4"><div className="animate-spin w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full"></div></div>
          ) : sessions && sessions.length > 0 ? (
            <div className="flex flex-col gap-1">
              {sessions.map(sess => (
                <button
                  key={sess.id}
                  onClick={() => setActiveSessionId(sess.id)}
                  className={`flex items-start gap-3 p-3 rounded-xl text-left transition-colors ${
                    activeSessionId === sess.id 
                      ? "bg-indigo-50 text-indigo-700 border border-indigo-100" 
                      : "hover:bg-white hover:shadow-sm text-gray-700 border border-transparent"
                  }`}
                >
                  <FaComments className={`mt-1 flex-shrink-0 ${activeSessionId === sess.id ? "text-indigo-500" : "text-gray-400"}`} />
                  <div className="flex-1 overflow-hidden">
                    <p className="font-medium text-sm truncate">{sess.title}</p>
                    <p className="text-xs opacity-60 mt-0.5">{new Date(sess.created_at).toLocaleDateString()}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 text-sm py-4">Belum ada riwayat</p>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative bg-white">
        {/* Mobile Header (Only visible on small screens) */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-2 text-indigo-600 font-bold">
            <FaRobot className="text-xl" />
            <span>NutriBot</span>
          </div>
          <button 
            onClick={handleNewChat}
            className="text-sm bg-gray-100 px-3 py-1.5 rounded-full text-gray-700 font-medium"
          >
            Chat Baru
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col gap-6">
          {(!localMessages || localMessages.length === 0) && !loadingMessages && (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500 max-w-lg mx-auto">
              <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                <FaRobot className="text-5xl text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Bantu saya dengan Gizi & Pangan</h2>
              <p className="mb-8">Tanyakan apa saja seputar nutrisi makanan, kalori, atau rekomendasi menu sehat untuk mahasiswa.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                <button 
                  onClick={() => setInputMsg("Berapa kalori satu porsi Nasi Goreng Spesial?")}
                  className="bg-white border border-gray-200 hover:border-indigo-300 hover:shadow-md p-4 rounded-xl text-left transition-all"
                >
                  <p className="text-sm font-semibold text-gray-800 mb-1">Cek Kalori</p>
                  <p className="text-xs text-gray-500">Berapa kalori satu porsi Nasi Goreng Spesial?</p>
                </button>
                <button 
                  onClick={() => setInputMsg("Apa rekomendasi sarapan sehat di bawah 15 ribu yang tinggi protein?")}
                  className="bg-white border border-gray-200 hover:border-indigo-300 hover:shadow-md p-4 rounded-xl text-left transition-all"
                >
                  <p className="text-sm font-semibold text-gray-800 mb-1">Rekomendasi Menu</p>
                  <p className="text-xs text-gray-500">Sarapan sehat di bawah 15 ribu yang tinggi protein?</p>
                </button>
              </div>
            </div>
          )}

          {localMessages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} w-full`}>
              <div className={`flex max-w-[85%] md:max-w-2xl gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white ${
                  msg.role === 'user' ? 'bg-gray-800' : 'bg-gradient-to-br from-indigo-500 to-purple-600'
                }`}>
                  {msg.role === 'user' ? <span className="font-bold">U</span> : <FaRobot className="text-lg" />}
                </div>
                
                <div className={`p-4 rounded-2xl ${
                  msg.role === 'user' 
                    ? 'bg-gray-100 text-gray-800 rounded-tr-none' 
                    : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'
                }`}>
                  {msg.role === 'assistant' ? (
                    <div className="prose prose-indigo max-w-none text-sm md:text-base">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm md:text-base whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {sendMessageMutation.isPending && (
            <div className="flex justify-start w-full">
              <div className="flex max-w-[85%] gap-3">
                <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white bg-gradient-to-br from-indigo-500 to-purple-600">
                  <FaRobot className="text-lg" />
                </div>
                <div className="bg-white border border-gray-200 p-4 rounded-2xl rounded-tl-none flex items-center gap-1.5 h-12 shadow-sm">
                  <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} className="h-4" />
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-6 bg-white border-t border-gray-100">
          <div className="max-w-3xl mx-auto flex items-end gap-3 bg-gray-50 p-2 rounded-2xl border border-gray-300 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-50 transition-all">
            <textarea 
              className="flex-1 bg-transparent border-none resize-none focus:outline-none focus:ring-0 text-gray-700 p-2 max-h-32"
              placeholder="Tanya NutriBot..."
              rows={1}
              value={inputMsg}
              onChange={(e) => {
                setInputMsg(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={sendMessageMutation.isPending}
            />
            <button 
              onClick={handleSend}
              disabled={!inputMsg.trim() || sendMessageMutation.isPending}
              className="w-10 h-10 mb-1 flex-shrink-0 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
            >
              <FaPaperPlane className="text-sm mr-0.5" />
            </button>
          </div>
          <p className="text-center text-xs text-gray-400 mt-3">NutriBot dapat melakukan kesalahan. Harap periksa kembali informasinya.</p>
        </div>
      </div>
    </div>
  );
}
