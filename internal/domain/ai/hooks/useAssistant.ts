import { useState, useEffect, useCallback, useRef } from "react";
import { askAssistant } from "../services/aiService";
import type {
  AssistantStep,
  AvailablePortion,
  ChatMessage,
  AssistantResponse,
} from "../types/ai";

interface UseAssistantOptions {
  step: AssistantStep;
  foodName?: string;
  mealType?: string;
  availablePortions?: AvailablePortion[];
  contextFoods?: string[];
  initialOpen?: boolean;
}

export function useAssistant({
  step,
  foodName,
  mealType,
  availablePortions = [],
  contextFoods = [],
  initialOpen = false,
}: UseAssistantOptions) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ref untuk melacak perubahan makanan
  const lastFoodNameRef = useRef<string | undefined>(foodName);

  // Buat pesan sambutan awal yang kontekstual
  const getInitialMessage = useCallback(
    (currentFood?: string): ChatMessage => {
      let welcomeText = "Halo! Saya Asisten AI Atlas. Ada yang bisa saya bantu?";
      let quickReplies: string[] = [];

      switch (step) {
        case "portion":
          if (currentFood) {
            welcomeText = `Halo! Sedang bingung memperkirakan porsi untuk **${currentFood}**? Tanyakan porsi rumah tangga seperti *"1 centong"*, *"2 potong sedang"*, atau *"sebutir"*, saya akan bantu cocokkan ke foto porsi terdekat.`;
            quickReplies = [
              "Porsi sedang yang mana?",
              "1 porsi normal berapa gram?",
              "Saya makan sedikit saja",
            ];
          } else {
            welcomeText = "Pilih makanan untuk memperkirakan ukuran porsi yang tepat berdasarkan standar URT Kemenkes RI.";
          }
          break;

        case "food":
          welcomeText = "Bingung mencari makanan? Kamu bisa ketik kalimat lengkap apa saja yang kamu makan tadi (misal: *'nasi goreng telur ceplok sama kerupuk'*), nanti saya bantu pisahkan.";
          quickReplies = [
            "Nasi campur lauk pauk",
            "Mie ayam bakso es teh",
            "Sarapan roti panggang selai",
          ];
          break;

        case "additional":
          welcomeText = currentFood
            ? `Untuk **${currentFood}**, apakah kemarin kamu menambahkan bumbu, saus, sambal, atau minyak goreng tambahan?`
            : "Jangan lupa mencatat minyak goreng atau bumbu pelengkap ya!";
          quickReplies = [
            "Pakai sambal & kecap",
            "Goreng pakai minyak",
            "Tidak ada tambahan",
          ];
          break;

        case "review":
          welcomeText = "Tinjauan asupan: Pastikan air putih, minuman manis, atau camilan kecil di antara waktu makan tidak ada yang terlewat ya.";
          quickReplies = [
            "Cek apakah ada yang terlewat",
            "Sudah lengkap semua",
          ];
          break;
      }

      return {
        id: `welcome-${Date.now()}`,
        sender: "assistant",
        text: welcomeText,
        timestamp: new Date(),
        response: {
          explanation: welcomeText,
          quick_replies: quickReplies,
        },
      };
    },
    [step]
  );

  // Inisialisasi atau reset percakapan saat makanan berganti
  useEffect(() => {
    if (foodName !== lastFoodNameRef.current || messages.length === 0) {
      lastFoodNameRef.current = foodName;
      setMessages([getInitialMessage(foodName)]);
      setError(null);
    }
  }, [foodName, getInitialMessage, messages.length]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        sender: "user",
        text: trimmed,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);
      setError(null);

      try {
        const response: AssistantResponse = await askAssistant({
          step,
          food_name: foodName,
          meal_type: mealType,
          user_query: trimmed,
          available_portions: availablePortions,
          context_foods: contextFoods,
        });

        const assistantMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: "assistant",
          text: response.explanation,
          timestamp: new Date(),
          response,
        };

        setMessages((prev) => [...prev, assistantMsg]);
      } catch (err: unknown) {
        const fallbackMsg: ChatMessage = {
          id: `ai-err-${Date.now()}`,
          sender: "assistant",
          text: "Maaf, koneksi asisten AI sedang terhambat. Silakan pilih foto porsi yang paling mirip dengan porsi santap Anda di sisi kiri.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, fallbackMsg]);
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      } finally {
        setIsLoading(false);
      }
    },
    [step, foodName, mealType, availablePortions, contextFoods, isLoading]
  );

  const resetChat = useCallback(() => {
    setMessages([getInitialMessage(foodName)]);
    setError(null);
  }, [foodName, getInitialMessage]);

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return {
    isOpen,
    setIsOpen,
    toggleOpen,
    messages,
    isLoading,
    error,
    sendMessage,
    resetChat,
  };
}
