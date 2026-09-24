import type { CueScene } from "../types/CueScene";
import type { Fixture } from "../types/Fixture";
import type { TimelineTrack } from "../types/TimelineTrack";

export const djb2 = (input: string): string => {
  let hash = 5381;
  for (let i = 0; i < input.length; i += 1) {
    hash = ((hash << 5) + hash + input.charCodeAt(i)) >>> 0;
  }
  return hash.toString(16);
};

export function sceneEntryFingerprint(track: TimelineTrack, scene: CueScene, fixtures: Fixture[]): string {
  const basis = {
    track: [track.start_ms, track.duration_ms],
    scene: [scene.name, scene.fixture_states, scene.scene_status],
    fixtures: fixtures
      .map((fixture) => [fixture.id, fixture.dmx_address, fixture.channel_count, fixture.fixture_status] as const)
      .sort((a, b) => a[0] - b[0])
  };
  return djb2(JSON.stringify(basis));
}
