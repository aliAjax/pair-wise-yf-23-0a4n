import { useMemo, useState } from "react";
import { ChannelMode } from "../constants/ChannelMode";
import { FixtureType } from "../constants/FixtureType";
import { useDmxAddressCheck } from "../hooks/useDmxAddressCheck";
import { createDefaultFixture } from "../constructors/FixtureConstructor";
import { useLoadWorkspace } from "../hooks/useLoadWorkspace";
import { useFixtureStore } from "../stores/FixtureStore";
import type { Fixture } from "../types/Fixture";
import { FixtureIcon } from "../components/common/FixtureIcon";
import { StatCard } from "../components/common/StatCard";

const emptyForm = createDefaultFixture();

export function FixturesPage() {
  const { fixtures } = useLoadWorkspace();
  const save = useFixtureStore((state) => state.save);
  const remove = useFixtureStore((state) => state.remove);
  const [form, setForm] = useState<Fixture>(emptyForm);
  const projectFixtureIds = useMemo(() => Array.from(new Set(fixtures.rows.map((fixture) => fixture.id))), [fixtures.rows]);
  const dmx = useDmxAddressCheck(fixtures.rows, projectFixtureIds);

  const update = <Key extends keyof Fixture>(key: Key, value: Fixture[Key]) => setForm((current) => ({ ...current, [key]: value }));
  const activeCount = fixtures.rows.filter((fixture) => fixture.active).length;

  return (
    <main className="page">
      <header className="page-head">
        <div><p className="eyebrow">DMX patch</p><h1>灯具布置</h1><p>逐盏核对 DMX 起址、通道数和停用状态；数据保存到浏览器 IndexedDB。</p></div>
      </header>
      <section className="metrics">
        <StatCard label="灯具总数" value={fixtures.rows.length} />
        <StatCard label="启用灯具" value={activeCount} />
        <StatCard label="当前 DMX 冲突" value={dmx.overlaps.length} />
      </section>
      {dmx.hasOverlap && <div className="inline-alert danger">{dmx.overlaps.map((item) => item.message).join("；")}</div>}
      <section className="workbench two-col editor-layout">
        <div className="panel">
          <h2>灯具清单</h2>
          <div className="table-list">
            {fixtures.rows.map((fixture) => (
              <article key={fixture.id} className="fixture-row">
                <FixtureIcon fixture={fixture} active={fixture.active} />
                <div className="fixture-props">
                  <strong>DMX {fixture.dmx_address} / {fixture.channel_count}ch</strong>
                  <span>{fixture.fixture_type} · {fixture.color_mode} · 位置 {fixture.position_x}, {fixture.position_y}</span>
                </div>
                <span className={`status-pill ${fixture.active ? "ready" : "disabled"}`}>{fixture.active ? "启用" : "停用"}</span>
                <div className="row-actions"><button type="button" onClick={() => setForm(fixture)}>编辑</button><button type="button" className="danger-button" onClick={() => void remove(fixture.id)}>删除</button></div>
              </article>
            ))}
          </div>
        </div>
        <form className="panel form-panel" onSubmit={(event) => { event.preventDefault(); void save(form).then(() => setForm(emptyForm)); }}>
          <h2>{form.id ? `编辑 ${form.fixture_code}` : "新增灯具"}</h2>
          <label>编号<input required value={form.fixture_code} onChange={(event) => update("fixture_code", event.target.value)} /></label>
          <div className="form-grid">
            <label>类型<select value={form.fixture_type} onChange={(event) => update("fixture_type", event.target.value as Fixture["fixture_type"])}>{FixtureType.map((value) => <option key={value}>{value}</option>)}</select></label>
            <label>通道模式<select value={form.color_mode} onChange={(event) => update("color_mode", event.target.value as Fixture["color_mode"])}>{ChannelMode.map((value) => <option key={value}>{value}</option>)}</select></label>
            <label>DMX 起址<input type="number" min={1} max={512} value={form.dmx_address} onChange={(event) => update("dmx_address", Number(event.target.value))} /></label>
            <label>通道数<input type="number" min={1} max={512} value={form.channel_count} onChange={(event) => update("channel_count", Number(event.target.value))} /></label>
            <label>X %<input type="number" min={0} max={100} value={form.position_x} onChange={(event) => update("position_x", Number(event.target.value))} /></label>
            <label>Y %<input type="number" min={0} max={100} value={form.position_y} onChange={(event) => update("position_y", Number(event.target.value))} /></label>
          </div>
          <label className="check-line"><input type="checkbox" checked={form.active} onChange={(event) => update("active", event.target.checked)} /> 灯具参与演出</label>
          <div className="dmx-preview">占用编号：{form.dmx_address}–{Math.min(512, form.dmx_address + form.channel_count - 1)}</div>
          <button className="primary-button" type="submit">保存灯具</button>
          <button type="button" className="ghost-button" onClick={() => setForm(emptyForm)}>清空表单</button>
        </form>
      </section>
    </main>
  );
}
