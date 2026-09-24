// Smoke test for execution sheet generation + incremental recompute.
const store = new Map<string, string>();
(globalThis as Record<string, unknown>).localStorage = {
  getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k)
};

const { generateExecutionSheet } = await import("../src/api/ExecutionSheet");
const { listFixture, saveFixture } = await import("../src/api/Fixture");

let failures = 0;
const assert = (cond: boolean, label: string) => {
  console.log((cond ? "PASS" : "FAIL") + "  " + label);
  if (!cond) failures += 1;
};

// 1. Project 1 has seeded conflicts: overlap (BEAM-01 23-28 vs PAR-03 22-25) + disabled STR-01.
const run1 = await generateExecutionSheet(1);
assert(run1.sheet.sheet_status === "FAILED", "project 1 sheet FAILED");
assert(run1.sheet.entries.length === 4, "project 1 has 4 scene entries");
const e2 = run1.sheet.entries.find((e) => e.scene_id === 2)!;
const e3 = run1.sheet.entries.find((e) => e.scene_id === 3)!;
assert(e2.conflicts.some((c) => c.code === "DMX_ADDRESS_OVERLAP"), "scene 2 flags DMX overlap");
assert(e3.conflicts.some((c) => c.code === "DMX_ADDRESS_OVERLAP"), "scene 3 flags DMX overlap");
assert(e3.conflicts.some((c) => c.code === "FIXTURE_DISABLED_IN_SCENE"), "scene 3 flags disabled fixture");
const line = e2.fixtures.find((f) => f.fixture_id === 5)!;
assert(line.dmx_start === 23 && line.channel_count === 6 && line.dmx_end === 28 && line.brightness === 90, "scene 2 BEAM-01 line: start 23, 6ch, end 28, 90%");
assert(run1.recomputedTrackIds.length === 4 && run1.reusedTrackIds.length === 0, "first run recomputes all 4 entries");

// 2. Second run with no changes: everything reused, entries byte-identical.
const run2 = await generateExecutionSheet(1);
assert(run2.reusedTrackIds.length === 4 && run2.recomputedTrackIds.length === 0, "no-change rerun reuses all 4 entries");
assert(run2.sheet.entries.every((e, i) => e.generated_at === run1.sheet.entries[i].generated_at), "reused entries keep original generated_at");
assert(run2.sheet.generation === 2, "generation increments to 2");

// 3. Fix the overlap: move PAR-03 from 22 to 31. Scenes 2 and 3 are affected; 1 and 4 stay.
const fixtures = await listFixture();
const par3 = fixtures.find((f) => f.id === 7)!;
await saveFixture({ ...par3, dmx_address: "31" });
const run3 = await generateExecutionSheet(1);
assert(run3.recomputedTrackIds.sort().join(",") === "2,3", "only tracks 2,3 recomputed after PAR-03 address fix, got: " + run3.recomputedTrackIds);
assert(run3.reusedTrackIds.sort().join(",") === "1,4", "tracks 1,4 kept as-is");
const kept1 = run3.sheet.entries.find((e) => e.track_id === 1)!;
assert(kept1.generated_at === run1.sheet.entries[0].generated_at, "untouched scene 1 entry keeps original generated_at");
const e3b = run3.sheet.entries.find((e) => e.scene_id === 3)!;
assert(!e3b.conflicts.some((c) => c.code === "DMX_ADDRESS_OVERLAP"), "scene 3 overlap resolved");
assert(e3b.conflicts.some((c) => c.code === "FIXTURE_DISABLED_IN_SCENE"), "scene 3 still fails on disabled STR-01");
assert(run3.sheet.sheet_status === "FAILED", "sheet still FAILED until disabled fixture handled");

// 4. Re-enable STR-01: only scene 3 recomputes; sheet becomes READY.
const str1 = (await listFixture()).find((f) => f.id === 6)!;
await saveFixture({ ...str1, fixture_status: "ACTIVE" });
const run4 = await generateExecutionSheet(1);
assert(run4.recomputedTrackIds.join(",") === "3", "only track 3 recomputed after re-enabling STR-01");
assert(run4.sheet.sheet_status === "READY", "sheet READY after all conflicts fixed");

// 5. Project 2 is clean from the start.
const run5 = await generateExecutionSheet(2);
assert(run5.sheet.sheet_status === "READY" && run5.sheet.entries.length === 2, "project 2 READY with 2 entries");

console.log(failures === 0 ? "\nALL PASS" : `\n${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
