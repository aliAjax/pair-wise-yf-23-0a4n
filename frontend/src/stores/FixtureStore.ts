import { create } from "zustand";
import { listFixture, saveFixture } from "../api/Fixture";
import type { Fixture } from "../types/Fixture";

type State = {
  rows: Fixture[];
  loading: boolean;
  load: () => Promise<void>;
  update: (fixture: Fixture) => Promise<void>;
};

export const useFixtureStore = create<State>((set, get) => ({
  rows: [],
  loading: false,
  async load() {
    set({ loading: true });
    set({ rows: await listFixture(), loading: false });
  },
  async update(fixture) {
    set({ rows: get().rows.map((row) => (row.id === fixture.id ? fixture : row)) });
    await saveFixture(fixture);
  }
}));
