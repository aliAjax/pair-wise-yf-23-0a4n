import { useState } from "react";
import { CueCard } from "../components/common/CueCard";
import { ColorChannelSlider } from "../components/common/ColorChannelSlider";
import { StatCard } from "../components/common/StatCard";
import { CueStatus } from "../constants/CueStatus";
import { createDefaultCueScene } from "../constructors/CueSceneConstructor";
import { useLoadWorkspace } from "../hooks/useLoadWorkspace";
import { useCueSceneStore } from "../stores/CueSceneStore";
import type { CueScene, FixtureStateValue } from "../types/CueScene";

const emptyCue = createDefaultCueScene();

export function CuesPage() {
  const { cues, fixtures } = useLoadWorkspace();
  const save = useCueSceneStore((state) => state.save);
  const remove = useCueSceneStore((state) => state.remove);
  const [form, setForm] = useState<CueScene>(emptyCue);

  const updateState = (fixtureId: number, patch: Partial<FixtureStateValue>) => {
    setForm((current) => ({
      ...current,
      fixture_states: {
        ...current.fixture_states,
        [String(fixtureId)]: {
          brightness: current.fixture_states[String(fixtureId)]?.brightness ?? 0,
          color: current.fixture_states[String(fixtureId)]?.color ?? "#ffffff",
          ...patch
        }
      }
    }));
  };

  return (
    <main className="page">
      <header className="page-head">
        <div><p className="eyebrow">Cue editor</p><h1>场景编辑</h1><p>为每盏参与灯具设置亮度；只有 READY 场景可进入执行单。</p></div>
      </header>
      <section className="metrics">
        <StatCard label="场景数" value={cues.rows.length} />
        <StatCard label="就绪场景" value={cues.rows.filter((cue) => cue.scene_status === "READY").length} />
        <StatCard label="可用灯具" value={fixtures.rows.filter((fixture) => fixture.active).length} />
      </section>
      <section className="workbench two-col">
        <div className="panel">
          <h2>场景列表</h2>
          <div className="card-list">
            {cues.rows.map((cue, index) => (
              <div key={cue.id} className="listed-card">
                <CueCard cue={cue} sequence={index + 1} selected={form.id === cue.id} onSelect={() => setForm(cue)} />
                <button type="button" className="danger-button" onClick={() => void remove(cue.id)}>删除</button>
              </div>
            ))}
          </div>
        </div>
        <form className="panel form-panel" onSubmit={(event) => { event.preventDefault(); void save(form).then((saved) => setForm(saved)); }}>
          <h2>{form.id ? `编辑 ${form.name}` : "新增场景"}</h2>
          <label>场景名称<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
          <div className="form-grid">
            <label>淡入 ms<input type="number" min={0} value={form.fade_in_ms} onChange={(event) => setForm({ ...form, fade_in_ms: Number(event.target.value) })} /></label>
            <label>保持 ms<input type="number" min={0} value={form.hold_ms} onChange={(event) => setForm({ ...form, hold_ms: Number(event.target.value) })} /></label>
            <label>优先级<input type="number" min={1} value={form.priority} onChange={(event) => setForm({ ...form, priority: Number(event.target.value) })} /></label>
            <label>状态<select value={form.scene_status} onChange={(event) => setForm({ ...form, scene_status: event.target.value as CueScene["scene_status"] })}>{CueStatus.map((value) => <option key={value}>{value}</option>)}</select></label>
          </div>
          <div className="state-editor">
            <h3>灯具亮度</h3>
            {fixtures.rows.map((fixture) => {
              const state = form.fixture_states[String(fixture.id)];
              return (
                <article key={fixture.id} className={`state-row ${state ? "selected" : ""} ${fixture.active ? "" : "inactive"}`}>
                  <div><strong>{fixture.fixture_code}</strong><span>DMX {fixture.dmx_address} · {fixture.active ? "启用" : "停用"}</span></div>
                  <input type="checkbox" checked={Boolean(state)} onChange={(event) => setForm({ ...form, fixture_states: event.target.checked ? { ...form.fixture_states, [fixture.id]: { brightness: state?.brightness ?? 70, color: state?.color ?? "#ffffff" } } : Object.fromEntries(Object.entries(form.fixture_states).filter(([id]) => id !== String(fixture.id))) })} />
                  {state && <>
                    <ColorChannelSlider label="亮度" value={state.brightness} onChange={(brightness) => updateState(fixture.id, { brightness })} />
                    <input type="color" value={state.color} onChange={(event) => updateState(fixture.id, { color: event.target.value })} />
                  </>}
                </article>
              );
            })}
          </div>
          <button type="submit" className="primary-button">保存场景</button>
          <button type="button" className="ghost-button" onClick={() => setForm(emptyCue)}>新增空白场景</button>
        </form>
      </section>
    </main>
  );
}
