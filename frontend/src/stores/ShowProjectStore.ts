import { create } from "zustand";
import { deleteShowProject, listShowProject, saveShowProject } from "../api/ShowProject";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import type { ShowProject } from "../types/ShowProject";

type State = {
  rows: ShowProject[];
  loading: boolean;
  loaded: boolean;
  load: () => Promise<void>;
  save: (project: ShowProject) => Promise<ShowProject>;
  remove: (id: number) => Promise<void>;
};

export const useShowProjectStore = create<State>((set, get) => ({
  rows: [],
  loading: false,
  loaded: false,
  async load() {
    if (get().loading) return;
    set({ loading: true });
    try {
      set({ rows: await listShowProject(), loading: false, loaded: true });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  async save(project) {
    const saved = await saveShowProject({ ...project, updated_at: new Date().toISOString() });
    console.info(LOG_TEMPLATES.ShowProject[project.id === 0 ? 0 : 1], saved);
    set((state) => ({
      rows: state.rows.some((row) => row.id === saved.id)
        ? state.rows.map((row) => (row.id === saved.id ? saved : row))
        : [...state.rows, saved]
    }));
    return saved;
  },
  async remove(id) {
    await deleteShowProject(id);
    set((state) => ({ rows: state.rows.filter((row) => row.id !== id) }));
  }
}));
