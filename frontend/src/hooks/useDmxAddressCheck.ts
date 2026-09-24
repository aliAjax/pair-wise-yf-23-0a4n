import { useMemo } from "react";
import type { Fixture } from "../types/Fixture";

export interface DmxOverlap {
  fixture_a_id: number;
  fixture_b_id: number;
  message: string;
}

export function useDmxAddressCheck(fixtures: Fixture[], fixtureIds?: number[]) {
  return useMemo(() => {
    const scoped = fixtures
      .filter((fixture) => !fixtureIds || fixtureIds.includes(fixture.id))
      .filter((fixture) => fixture.active && fixture.dmx_address >= 1 && fixture.channel_count >= 1 && fixture.dmx_address + fixture.channel_count - 1 <= 512)
      .sort((a, b) => a.dmx_address - b.dmx_address || a.id - b.id);

    const overlaps: DmxOverlap[] = [];
    scoped.forEach((fixture, index) => {
      for (let next = index + 1; next < scoped.length; next += 1) {
        const other = scoped[next];
        if (other.dmx_address > fixture.dmx_address + fixture.channel_count - 1) break;
        overlaps.push({
          fixture_a_id: fixture.id,
          fixture_b_id: other.id,
          message: `${fixture.fixture_code} 与 ${other.fixture_code} 的 DMX 编号重叠`
        });
      }
    });

    return {
      overlaps,
      hasOverlap: overlaps.length > 0,
      invalid: fixtures.filter((fixture) => fixture.dmx_address < 1 || fixture.dmx_address + fixture.channel_count - 1 > 512 || fixture.channel_count < 1)
    };
  }, [fixtures, fixtureIds]);
}
