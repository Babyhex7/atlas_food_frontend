import type { RecallSession } from "../types/recall";

export type RecallState = {
  session: RecallSession | null;
};

export const initialRecallState: RecallState = {
  session: null,
};
