/**
 * Maps a food category (by code or name substring) to a Lucide icon component.
 * Falls back to UtensilsCrossed when no match is found.
 */
import type { LucideIcon } from "lucide-react";
import {
  UtensilsCrossed,  // generic fallback
  Wheat,            // staple / carbs (nasi, mie, roti, ubi)
  Drumstick,        // protein / lauk (ayam, daging, ikan, telur)
  Apple,            // fruits (buah)
  GlassWater,       // drinks (minuman)
  Salad,            // vegetables / sayuran
  Soup,             // soup / soto / bakso
  Sandwich,         // snack / camilan / kue
  Milk,             // dairy / susu
  Fish,             // seafood / ikan
  Egg,              // eggs / telur
  Coffee,           // coffee / tea / beverages
  Cookie,           // dessert / kue / jajan
} from "lucide-react";

type IconMap = { pattern: RegExp; icon: LucideIcon }[];

const ICON_MAP: IconMap = [
  // ── by code prefix ──────────────────────────────────────────────────────
  { pattern: /^MP/i,  icon: Wheat },       // Makanan Pokok
  { pattern: /^LP/i,  icon: Drumstick },   // Lauk Pauk
  { pattern: /^BH/i,  icon: Apple },       // Buah-buahan
  { pattern: /^MN/i,  icon: GlassWater },  // Minuman
  { pattern: /^SY/i,  icon: Salad },       // Sayuran
  { pattern: /^SU/i,  icon: Soup },        // Sup/Soto
  { pattern: /^CM/i,  icon: Cookie },      // Camilan/Snack
  { pattern: /^DY/i,  icon: Milk },        // Dairy
  { pattern: /^IK/i,  icon: Fish },        // Ikan/Seafood
  { pattern: /^TL/i,  icon: Egg },         // Telur
  { pattern: /^KP/i,  icon: Coffee },      // Kopi/Teh
  // ── by name substring (bahasa Indonesia + English) ───────────────────────
  { pattern: /pokok|nasi|beras|mie|pasta|roti|ubi|singkong|kentang|staple|carb/i, icon: Wheat },
  { pattern: /lauk|ayam|daging|sapi|kambing|babi|ikan|seafood|udang|cumi|protein/i, icon: Drumstick },
  { pattern: /buah|fruit|apel|pisang|mangga|jeruk|semangka|melon|berry/i, icon: Apple },
  { pattern: /minum|drink|jus|sirup|soda|teh|kopi|susu|air/i, icon: GlassWater },
  { pattern: /sayur|vegetable|salad|hijau|kangkung|bayam/i, icon: Salad },
  { pattern: /soto|sop|sup|soup|bakso|mi kuah|pho/i, icon: Soup },
  { pattern: /camilan|snack|kerupuk|kue|biskuit|cokelat|candy|dessert|jajan/i, icon: Cookie },
  { pattern: /susu|dairy|keju|yogurt|milk|cream/i, icon: Milk },
  { pattern: /ikan|seafood|udang|cumi|kepiting|fish/i, icon: Fish },
  { pattern: /telur|egg/i, icon: Egg },
  { pattern: /kopi|coffee|teh|tea/i, icon: Coffee },
];

/**
 * Returns the Lucide icon component that best matches the given category code/name.
 * @param code - category code, e.g. "MP-001"
 * @param name - category display name, e.g. "Makanan Pokok"
 */
export function getCategoryIcon(code?: string | null, name?: string | null): LucideIcon {
  const haystack = `${code ?? ""} ${name ?? ""}`;
  for (const { pattern, icon } of ICON_MAP) {
    if (pattern.test(haystack)) return icon;
  }
  return UtensilsCrossed;
}

/**
 * Convenience component that renders the matched icon at a given size.
 */
export function CategoryIcon({
  code,
  name,
  size = 24,
  className,
}: {
  code?: string | null;
  name?: string | null;
  size?: number;
  className?: string;
}) {
  const Icon = getCategoryIcon(code, name);
  return <Icon size={size} className={className} />;
}
