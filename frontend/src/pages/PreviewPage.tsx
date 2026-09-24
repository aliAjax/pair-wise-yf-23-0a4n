import { useMemo, useState } from "react";
import { ProjectSelector } from "../components/common/ProjectSelector";
import { StageCanvas } from "../components/common/StageCanvas";
import { TimelineRuler } from "../components/common/TimelineRuler";
import { useLoadWorkspace } from "../hooks/useLoadWorkspace";
import { useTimelinePlayback } from "../hooks/useTimelinePlayback";
import { useWorkspaceSelectionStore } from "../stores/WorkspaceSelectionStore";
import { formatClock } from "../utils/formatters";

export function PreviewPage() {
  const { fixtures, cues, tracks, projects } = useLoadWorkspace();
  const selectedProjectId = useWorkspaceSelectionStore((state) => state.selectedProjectId);
  const project = projects.rows.find((item) => item.id === selectedProjectId) ?? projects.rows[0];
  const projectTracks = useMemo(() => tracks.rows.filter((track) => project?.track_ids.includes(track.id)), [tracks.rows, project]);
  const [playing, setPlaying] = useState(false);
  const playback = useTimelinePlayback(projectTracks, cues.rows, playing);
  const activeCue = playback.activeTracks.map((track) => playback.cuesById.get(track.cue_scene_id)).filter(Boolean).sort((a, b) => (b?.priority ?? 0) - (a?.priority ?? 0))[0];

  return (
    <main className="page">
      <header className="page-head">
        <div><p className="eyebrow">Stage preview</p><h1>舞台预览</h1><p>按时间轴播放当前方案；只展示方案内灯具和轨道。</p></div>
        <ProjectSelector />
      </header>
      <section className="panel">
        <StageCanvas fixtures={fixtures.rows} activeCue={activeCue} projectFixtureIds={project?.fixture_ids ?? []} />
      </section>
      <section className="panel playback-panel">
        <div className="playback-head"><strong>{activeCue?.name ?? "暗场"}</strong><span>{formatClock(playback.currentTime)} / {formatClock(playback.duration)}</span></div>
        <TimelineRuler duration={playback.duration} currentTime={playback.currentTime} />
        <input type="range" min={0} max={playback.duration} value={playback.currentTime} onChange={(event) => { setPlaying(false); playback.setCurrentTime(Number(event.target.value)); }} />
        <button type="button" className="primary-button" onClick={() => setPlaying(!playing)}>{playing ? "暂停" : "播放"}</button>
        <button type="button" className="ghost-button" onClick={() => { setPlaying(false); playback.setCurrentTime(0); }}>回到开始</button>
      </section>
    </main>
  );
}
