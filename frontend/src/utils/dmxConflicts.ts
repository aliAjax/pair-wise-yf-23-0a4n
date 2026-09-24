import { ERROR_MESSAGES } from "../constants/errorMessages";
import type { Fixture } from "../types/Fixture";
import type { SheetConflict } from "../types/ExecutionSheet";

export interface DmxRange {
  start: number;
  end: number;
}

export const dmxRangeOf = (fixture: Fixture): DmxRange => {
  const start = Math.max(1, Number(fixture.dmx_address) || 1);
  const count = Math.max(1, Number(fixture.channel_count) || 1);
  return { start, end: start + count - 1 };
};

export const rangesOverlap = (a: DmxRange, b: DmxRange): boolean => a.start <= b.end && b.start <= a.end;

export interface DmxOverlap {
  a: Fixture;
  b: Fixture;
  rangeA: DmxRange;
  rangeB: DmxRange;
}

export function findDmxOverlaps(fixtures: Fixture[]): DmxOverlap[] {
  const overlaps: DmxOverlap[] = [];
  for (let i = 0; i < fixtures.length; i += 1) {
    for (let j = i + 1; j < fixtures.length; j += 1) {
      const rangeA = dmxRangeOf(fixtures[i]);
      const rangeB = dmxRangeOf(fixtures[j]);
      if (rangesOverlap(rangeA, rangeB)) {
        overlaps.push({ a: fixtures[i], b: fixtures[j], rangeA, rangeB });
      }
    }
  }
  return overlaps;
}

export function checkSceneConflicts(sceneId: number, participating: Fixture[], missingFixtureIds: number[]): SheetConflict[] {
  const conflicts: SheetConflict[] = [];
  for (const { a, b, rangeA, rangeB } of findDmxOverlaps(participating)) {
    conflicts.push({
      code: "DMX_ADDRESS_OVERLAP",
      message: ERROR_MESSAGES.DMX_ADDRESS_OVERLAP,
      scene_id: sceneId,
      fixture_ids: [a.id, b.id],
      detail: `${a.fixture_code}（DMX ${rangeA.start}-${rangeA.end}）与 ${b.fixture_code}（DMX ${rangeB.start}-${rangeB.end}）占用编号重叠`
    });
  }
  for (const fixture of participating) {
    if (fixture.fixture_status === "DISABLED") {
      conflicts.push({
        code: "FIXTURE_DISABLED_IN_SCENE",
        message: ERROR_MESSAGES.FIXTURE_DISABLED_IN_SCENE,
        scene_id: sceneId,
        fixture_ids: [fixture.id],
        detail: `${fixture.fixture_code} 已停用，请恢复启用或从场景中移除`
      });
    }
  }
  for (const id of missingFixtureIds) {
    conflicts.push({
      code: "FIXTURE_NOT_FOUND",
      message: ERROR_MESSAGES.FIXTURE_NOT_FOUND,
      scene_id: sceneId,
      fixture_ids: [id],
      detail: `灯具 #${id} 在灯具库中不存在`
    });
  }
  return conflicts;
}
