import { useEffect, useMemo, useState } from "react";
import type { CueScene } from "../types/CueScene";
import type { TimelineTrack } from "../types/TimelineTrack";

export function useTimelinePlayback(tracks: TimelineTrack[], cues: CueScene[], playing: boolean) {
  const orderedTracks = useMemo(() => [...tracks].sort((a, b) => a.start_ms - b.start_ms || a.id - b.id), [tracks]);
  const duration = useMemo(() => orderedTracks.reduce((max, track) => Math.max(max, track.start_ms + track.duration_ms), 0), [orderedTracks]);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    if (!playing) return;
    const startedAt = performance.now();
    const startedTime = currentTime >= duration ? 0 : currentTime;
    setCurrentTime(startedTime);
    const timer = window.setInterval(() => {
      const nextTime = startedTime + performance.now() - startedAt;
      if (nextTime >= duration) {
        setCurrentTime(duration);
        window.clearInterval(timer);
      } else {
        setCurrentTime(nextTime);
      }
    }, 50);
    return () => window.clearInterval(timer);
  }, [playing, duration]);

  const activeTracks = orderedTracks.filter((track) => currentTime >= track.start_ms && currentTime <= track.start_ms + track.duration_ms);

  return {
    currentTime,
    duration,
    setCurrentTime,
    activeTracks,
    activeCueIds: activeTracks.map((track) => track.cue_scene_id),
    cuesById: new Map(cues.map((cue) => [cue.id, cue]))
  };
}
