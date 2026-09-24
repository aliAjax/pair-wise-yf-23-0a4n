import { useEffect, useState } from "react";
import { createDefaultShowProject } from "../../constructors/ShowProjectConstructor";
import { useShowProjectStore } from "../../stores/ShowProjectStore";
import type { ShowProject } from "../../types/ShowProject";

export function ProjectEditor({ project, fixtureOptions, trackOptions }: {
  project?: ShowProject;
  fixtureOptions: number[];
  trackOptions: number[];
}) {
  const save = useShowProjectStore((state) => state.save);
  const [draft, setDraft] = useState<ShowProject>(project ?? createDefaultShowProject());

  useEffect(() => {
    if (project) setDraft(project);
  }, [project]);

  const toggle = (key: "fixture_ids" | "track_ids", id: number) => {
    setDraft((current) => {
      const values = current[key];
      return { ...current, [key]: values.includes(id) ? values.filter((item) => item !== id) : [...values, id] };
    });
  };

  return (
    <section className="panel project-editor">
      <div className="panel-title"><h2>演出方案范围</h2><span className="muted">只校验方案引用到的灯具</span></div>
      <div className="form-grid">
        <label>标题<input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} /></label>
        <label>场馆<input value={draft.venue_name} onChange={(event) => setDraft({ ...draft, venue_name: event.target.value })} /></label>
      </div>
      <div className="picker-columns">
        <fieldset><legend>参与灯具</legend><div className="checkbox-cloud">{fixtureOptions.map((id) => <label key={id}><input type="checkbox" checked={draft.fixture_ids.includes(id)} onChange={() => toggle("fixture_ids", id)} />#{id}</label>)}</div></fieldset>
        <fieldset><legend>方案轨道</legend><div className="checkbox-cloud">{trackOptions.map((id) => <label key={id}><input type="checkbox" checked={draft.track_ids.includes(id)} onChange={() => toggle("track_ids", id)} />Track {id}</label>)}</div></fieldset>
      </div>
      <button type="button" className="primary-button" onClick={() => void save(draft)}>保存方案范围</button>
    </section>
  );
}
