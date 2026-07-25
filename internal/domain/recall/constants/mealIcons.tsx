"use client";

import {
  Coffee,
  Cookie,
  Moon,
  Soup,
  Sunrise,
  Utensils,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";

/**
 * Ikon per waktu makan. Nama meal datang dari meals_config survey yang dibuat
 * admin, jadi pencocokan dilakukan case-insensitive dan mendukung penamaan
 * Bahasa Indonesia maupun Inggris. Nama di luar daftar jatuh ke ikon netral.
 */
const MEAL_ICON_BY_NAME: Record<string, LucideIcon> = {
  breakfast: Sunrise,
  sarapan: Sunrise,
  "morning snack": Cookie,
  "snack pagi": Cookie,
  lunch: Utensils,
  "makan siang": Utensils,
  "afternoon snack": Coffee,
  "snack sore": Coffee,
  dinner: Soup,
  "makan malam": Soup,
  "evening snack": Moon,
  "snack malam": Moon,
  snack: Cookie,
  camilan: Cookie,
};

export function getMealIcon(mealName: string): LucideIcon {
  return MEAL_ICON_BY_NAME[mealName.trim().toLowerCase()] ?? UtensilsCrossed;
}
