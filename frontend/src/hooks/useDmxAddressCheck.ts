import { useMemo } from "react";
import { findDmxOverlaps, type DmxOverlap } from "../utils/dmxConflicts";
import type { Fixture } from "../types/Fixture";

export function useDmxAddressCheck(fixtures: Fixture[] = []) {
  const overlaps: DmxOverlap[] = useMemo(() => findDmxOverlaps(fixtures), [fixtures]);
  const conflictedIds = useMemo(
    () => new Set<number>(overlaps.flatMap((overlap) => [overlap.a.id, overlap.b.id])),
    [overlaps]
  );
  return { overlaps, conflictedIds, hasConflict: overlaps.length > 0 };
}
