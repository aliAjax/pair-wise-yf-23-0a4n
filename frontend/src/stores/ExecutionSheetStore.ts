import { create } from "zustand";
import { generateExecutionSheet, listExecutionSheet } from "../api/ExecutionSheet";
import type { ExecutionSheet } from "../types/ExecutionSheet";

export interface SheetRunSummary {
  projectId: number;
  reusedTrackIds: number[];
  recomputedTrackIds: number[];
  at: string;
}

type State = {
  sheets: ExecutionSheet[];
  lastRun: SheetRunSummary | null;
  loading: boolean;
  load: () => Promise<void>;
  generate: (projectId: number) => Promise<void>;
};

export const useExecutionSheetStore = create<State>((set) => ({
  sheets: [],
  lastRun: null,
  loading: false,
  async load() {
    set({ sheets: await listExecutionSheet() });
  },
  async generate(projectId) {
    set({ loading: true });
    try {
      const result = await generateExecutionSheet(projectId);
      set({
        sheets: await listExecutionSheet(),
        lastRun: {
          projectId,
          reusedTrackIds: result.reusedTrackIds,
          recomputedTrackIds: result.recomputedTrackIds,
          at: new Date().toISOString()
        },
        loading: false
      });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  }
}));
