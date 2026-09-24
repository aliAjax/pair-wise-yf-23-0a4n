import { useEffect } from "react";
import { useCueSceneStore } from "../stores/CueSceneStore";
import { useExecutionSheetStore } from "../stores/ExecutionSheetStore";
import { useFixtureStore } from "../stores/FixtureStore";
import { useShowProjectStore } from "../stores/ShowProjectStore";
import { useTimelineTrackStore } from "../stores/TimelineTrackStore";

export function useLoadWorkspace() {
  const fixtureRows = useFixtureStore((state) => state.rows);
  const fixturesLoading = useFixtureStore((state) => state.loading);
  const fixturesLoaded = useFixtureStore((state) => state.loaded);
  const loadFixtures = useFixtureStore((state) => state.load);

  const cueRows = useCueSceneStore((state) => state.rows);
  const cuesLoading = useCueSceneStore((state) => state.loading);
  const cuesLoaded = useCueSceneStore((state) => state.loaded);
  const loadCues = useCueSceneStore((state) => state.load);

  const trackRows = useTimelineTrackStore((state) => state.rows);
  const tracksLoading = useTimelineTrackStore((state) => state.loading);
  const tracksLoaded = useTimelineTrackStore((state) => state.loaded);
  const loadTracks = useTimelineTrackStore((state) => state.load);

  const projectRows = useShowProjectStore((state) => state.rows);
  const projectsLoading = useShowProjectStore((state) => state.loading);
  const projectsLoaded = useShowProjectStore((state) => state.loaded);
  const loadProjects = useShowProjectStore((state) => state.load);

  const sheetRows = useExecutionSheetStore((state) => state.rows);
  const sheetsLoading = useExecutionSheetStore((state) => state.loading);
  const sheetsLoaded = useExecutionSheetStore((state) => state.loaded);
  const loadSheets = useExecutionSheetStore((state) => state.load);

  useEffect(() => {
    if (!fixturesLoaded) void loadFixtures();
  }, [fixturesLoaded, loadFixtures]);
  useEffect(() => {
    if (!cuesLoaded) void loadCues();
  }, [cuesLoaded, loadCues]);
  useEffect(() => {
    if (!tracksLoaded) void loadTracks();
  }, [tracksLoaded, loadTracks]);
  useEffect(() => {
    if (!projectsLoaded) void loadProjects();
  }, [projectsLoaded, loadProjects]);
  useEffect(() => {
    if (!sheetsLoaded) void loadSheets();
  }, [sheetsLoaded, loadSheets]);

  return {
    fixtures: { rows: fixtureRows, loading: fixturesLoading, loaded: fixturesLoaded, load: loadFixtures },
    cues: { rows: cueRows, loading: cuesLoading, loaded: cuesLoaded, load: loadCues },
    tracks: { rows: trackRows, loading: tracksLoading, loaded: tracksLoaded, load: loadTracks },
    projects: { rows: projectRows, loading: projectsLoading, loaded: projectsLoaded, load: loadProjects },
    sheets: { rows: sheetRows, loading: sheetsLoading, loaded: sheetsLoaded, load: loadSheets }
  };
}
