import type { SelectedPortion } from "../types/portion";

export type PortionState = {
  selectedPortion: SelectedPortion | null;
};

export const initialPortionState: PortionState = {
  selectedPortion: null,
};
