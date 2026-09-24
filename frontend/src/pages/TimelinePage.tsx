import { useMemo, useState } from "react";
import { StatCard } from "../components/common/StatCard";
import { TimelineRuler } from "../components/common/TimelineRuler";
import { ProjectSelector } from "../components/common/ProjectSelector";
import { createDefaultTimelineTrack } from "../constructors/TimelineTrackConstructor";
import { useLoadWorkspace } from "../hooks/useLoadWorkspace";
import { useShowProjectStore } from "../stores/ShowProjectStore";
import { useTimelineTrackStore } from "../stores/TimelineTrackStore";
import { useWorkspaceSelectionStore } from "../stores/WorkspaceSelectionStore";
import type { TimelineTrack } from "../types/TimelineTrack";
import { formatClock, formatDuration } from "../utils/formatters";

const emptyTrack = createDefaultTimelineTrack();

export function TimelinePage() {
  const { tracks, cues, projects } = useLoadWorkspace();
  const saveTrack = useTimelineTrackStore((state) => state.save);
  const removeTrack = useTimelineTrackStore((state) => state.remove);
  const saveProject = useShowProjectStore((state) => state.save);
  const selectedProjectId = useWorkspaceSelectionStore((state) => state.selectedProjectId);
  const [form, setForm] = useState<TimelineTrack>(emptyTrack);
  const project = projects.rows.find((item) => item.id === selectedProjectId) ?? projects.rows[0];
  const projectTracks = useMemo(() => project?.track_ids.map((id) => tracks.rows.find((track) => track.id === id)).filter((track): track is TimelineTrack => Boolean(track)) ?? [], [project, tracks.rows]);
  const duration = projectTracks.reduce((max, track) => Math.max(max, track.start_ms + track.duration_ms), 0);

  const includeTrack = async (track: TimelineTrack) => {
    if (!project) return;
    const saved = await saveTrack(track);
    if (!project.track_ids.includes(saved.id)) {
      await saveProject({ ...project, track_ids: [...project.track_ids, saved.id] });
    }
    setForm(emptyTrack);
  };

  const toggleMembership = async (trackId: number) => {
    if (!project) return;
    const has = project.track_ids.includes(trackId);
    await saveProject({ ...project, track_ids: has ? project.track_ids.filter((id) => id !== trackId) : [...project.track_ids, trackId] });
  };

  return (
    <main className="page">
      <header className="page-head">
        <div><p className="eyebrow">Timeline</p><h1>时间轴编排</h1><p>把 READY 场景放入当前演出方案；锁定轨道仍参与执行单，但不能直接改时间。</p></div>
        <ProjectSelector />
      </header>
      <section className="metrics">
        <StatCard label="方案轨道" value={projectTracks.length} />
        <StatCard label="总时长" value={formatDuration(duration)} />
        <StatCard label="锁定轨道" value={projectTracks.filter((track) => track.locked).length} />
      </section>
      <section className="panel">
        <h2>当前方案时间轴</h2>
        <TimelineRuler duration={duration} />
        <div className="timeline-lanes">
          {[1, 2].map((layer) => (
            <div className="lane" key={layer}>
              <strong>{layer} 层</strong>
              <div className="lane-track">
                {projectTracks.filter((track) => track.layer === layer).map((track) => {
                  const cue = cues.rows.find((item) => item.id === track.cue_scene_id);
                  return (
                    <div key={track.id} className={`timeline-block ${cue?.scene_status === "READY" ? "ready" : "blocked"} ${track.locked ? "locked" : ""}`} style={{ left: `${duration ? track.start_ms / duration * 100 : 0}%`, width: `${duration ? track.duration_ms / duration * 100 : 100}%` }}>
                      <b>{cue?.name ?? `缺失 #${track.cue_scene_id}`}</b>
                      <span>{formatClock(track.start_ms)} · {track.locked ? "已锁定" : "可编辑"}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="workbench two-col editor-layout">
        <div className="panel">
          <h2>全部轨道</h2>
          {tracks.rows.map((track) => {
            const cue = cues.rows.find((item) => item.id === track.cue_scene_id);
            const included = project?.track_ids.includes(track.id);
            return <article key={track.id} className={`list-row ${included ? "included" : ""}`}>
              <div><strong>Track #{track.id} · {cue?.name ?? "缺失场景"}</strong><span>{formatClock(track.start_ms)} / {formatDuration(track.duration_ms)} / {track.layer}层</span></div>
              <button type="button" onClick={() => setForm(track)} disabled={track.locked}>编辑</button>
              <button type="button" onClick={() => void toggleMembership(track.id)}>{included ? "移出方案" : "加入方案"}</button>
              <button type="button" className="danger-button" onClick={() => void removeTrack(track.id)}>删除</button>
            </article>;
          })}
        </div>
        <form className="panel form-panel" onSubmit={(event) => { event.preventDefault(); void includeTrack(form); }}>
          <h2>{form.id ? `编辑轨道 #${form.id}` : "新增轨道并加入方案"}</h2>
          <label>场景<select value={form.cue_scene_id} onChange={(event) => setForm({ ...form, cue_scene_id: Number(event.target.value) })}><option value={0}>请选择</option>{cues.rows.map((cue) => <option key={cue.id} value={cue.id}>{cue.name}（{cue.scene_status}）</option>)}</select></label>
          <div className="form-grid">
            <label>开始 ms<input type="number" min={0} value={form.start_ms} onChange={(event) => setForm({ ...form, start_ms: Number(event.target.value) })} /></label>
            <label>时长 ms<input type="number" min={1} value={form.duration_ms} onChange={(event) => setForm({ ...form, duration_ms: Number(event.target.value) })} /></label>
            <label>图层<input type="number" min={1} max={4} value={form.layer} onChange={(event) => setForm({ ...form, layer: Number(event.target.value) })} /></label>
            <label className="check-line"><input type="checkbox" checked={form.locked} onChange={(event) => setForm({ ...form, locked: event.target.checked })} />锁定</label>
          </div>
          <button className="primary-button" type="submit">保存轨道</button>
          <button type="button" className="ghost-button" onClick={() => setForm(emptyTrack)}>新增空白轨道</button>
        </form>
      </section>
    </main>
  );
}
