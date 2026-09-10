import { apiClient } from "@/internal/lib/axios";
import type { ChatSession, ChatMessage, ChatRequest, ChatResponse } from "../types/chat";

export const chatApi = {
  sendMessage: async (req: ChatRequest): Promise<ChatResponse> => {
    const res = await apiClient.post<{ data: ChatResponse }>("/ai/chat", req);
    return res.data.data;
  },

  getSessions: async (): Promise<ChatSession[]> => {
    const res = await apiClient.get<{ data: { sessions: ChatSession[] } }>("/ai/chat/sessions");
    return res.data.data.sessions;
  },

  getMessages: async (sessionId: string): Promise<ChatMessage[]> => {
    const res = await apiClient.get<{ data: { messages: ChatMessage[] } }>(`/ai/chat/sessions/${sessionId}`);
    return res.data.data.messages;
  },

  deleteSession: async (sessionId: string): Promise<void> => {
    await apiClient.delete(`/ai/chat/sessions/${sessionId}`);
  },
};
