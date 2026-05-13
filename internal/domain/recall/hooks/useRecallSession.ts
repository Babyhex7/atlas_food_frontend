"use client";

import { useState } from "react";
import type { RecallSession } from "../types/recall";

export function useRecallSession(initialSession: RecallSession | null = null) {
  const [session, setSession] = useState<RecallSession | null>(initialSession);

  return { session, setSession };
}
