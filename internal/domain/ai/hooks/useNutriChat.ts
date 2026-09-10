import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { chatApi } from "../api/chatApi";
import type { ChatRequest } from "../types/chat";

export const useChatSessions = () => {
  return useQuery({
    queryKey: ["chat", "sessions"],
    queryFn: () => chatApi.getSessions(),
  });
};

export const useChatMessages = (sessionId: string | null) => {
  return useQuery({
    queryKey: ["chat", "messages", sessionId],
    queryFn: () => sessionId ? chatApi.getMessages(sessionId) : Promise.resolve([]),
    enabled: !!sessionId,
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (req: ChatRequest) => chatApi.sendMessage(req),
    onSuccess: (data, variables) => {
      // Invalidate messages list if it was an existing session
      if (variables.session_id) {
        queryClient.invalidateQueries({ queryKey: ["chat", "messages", variables.session_id] });
      } else {
        // If it was a new session, invalidate sessions list
        queryClient.invalidateQueries({ queryKey: ["chat", "sessions"] });
      }
      
      // Also invalidate gamification if xp earned
      if (data.xp_earned > 0) {
        queryClient.invalidateQueries({ queryKey: ["gamification"] });
      }
    },
  });
};
