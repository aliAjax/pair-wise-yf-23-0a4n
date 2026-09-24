import { create } from "zustand";

const STORAGE_KEY = "stage-light-selected-project";

type State = {
  selectedProjectId: number;
  selectProject: (id: number) => void;
};

function readInitialId() {
  if (typeof localStorage === "undefined") return 1;
  return Number(localStorage.getItem(STORAGE_KEY)) || 1;
}

export const useWorkspaceSelectionStore = create<State>((set) => ({
  selectedProjectId: readInitialId(),
  selectProject: (id) => {
    localStorage.setItem(STORAGE_KEY, String(id));
    set({ selectedProjectId: id });
  }
}));
