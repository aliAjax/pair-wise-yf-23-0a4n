import { create } from "zustand";
import { listExecutionSheet, saveExecutionSheet } from "../api/ExecutionSheet";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import type { ExecutionSheet } from "../types/ExecutionSheet";

type State = {
  rows: ExecutionSheet[];
  loading: boolean;
  loaded: boolean;
  load: () => Promise<void>;
  save: (sheet: ExecutionSheet) => Promise<ExecutionSheet>;
};

export const useExecutionSheetStore = create<State>((set, get) => ({
  rows: [],
  loading: false,
  loaded: false,
  async load() {
    if (get().loading) return;
    set({ loading: true });
    try {
      set({ rows: await listExecutionSheet(), loading: false, loaded: true });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  async save(sheet) {
    const saved = await saveExecutionSheet(sheet);
    console.info(LOG_TEMPLATES.ExecutionSheet[2], saved);
    set((state) => ({
      rows: state.rows.some((row) => row.id === saved.id)
        ? state.rows.map((row) => (row.id === saved.id ? saved : row))
        : [...state.rows, saved]
    }));
    return saved;
  }
}));
