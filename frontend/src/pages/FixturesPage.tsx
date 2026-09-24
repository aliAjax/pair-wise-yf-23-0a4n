import { useEffect } from "react";
import { useFixtureStore } from "../stores/FixtureStore";
import { useDmxAddressCheck } from "../hooks/useDmxAddressCheck";
import { FixtureStatus } from "../constants/FixtureStatus";
import { DmxRangeTag } from "../components/common/DmxRangeTag";
import { StatusBadge } from "../components/common/StatusBadge";
import { StatCard } from "../components/common/StatCard";
import type { Fixture } from "../types/Fixture";

export function FixturesPage() {
  const rows = useFixtureStore((state) => state.rows);
  const loading = useFixtureStore((state) => state.loading);
  const load = useFixtureStore((state) => state.load);
  const update = useFixtureStore((state) => state.update);

  useEffect(() => {
    load();
  }, [load]);

  const { overlaps, conflictedIds, hasConflict } = useDmxAddressCheck(rows);

  const patch = (fixture: Fixture, changes: Partial<Fixture>) => {
    void update({ ...fixture, ...changes });
  };

  return <main className="page">
    <section className="page-head">
      <div>
        <p className="eyebrow">stage-light</p>
        <h1>灯具布置</h1>
      </div>
      <StatusBadge value={hasConflict ? "DMX_CONFLICT" : "DMX_CLEAR"} />
    </section>

    <section className="metrics">
      <StatCard label="灯具总数" value={rows.length} />
      <StatCard label="地址冲突" value={overlaps.length} />
      <StatCard label="停用灯具" value={rows.filter((row) => row.fixture_status === "DISABLED").length} />
    </section>

    {hasConflict && <section className="conflict-panel">
      <strong>DMX 地址撞车</strong>
      <ul>
        {overlaps.map((overlap, index) => (
          <li key={index}>
            {overlap.a.fixture_code}（DMX {overlap.rangeA.start}-{overlap.rangeA.end}）与 {overlap.b.fixture_code}（DMX {overlap.rangeB.start}-{overlap.rangeB.end}）占用编号重叠
          </li>
        ))}
      </ul>
      <p className="hint">修改下方灯具的 DMX 起址或通道数即可消除冲突，改动会即时保存到浏览器。</p>
    </section>}

    <section className="panel wide">
      <h2>灯具通道表</h2>
      {loading ? <p>加载中…</p> : <table className="sheet-table">
        <thead>
          <tr><th>灯具</th><th>类型</th><th>DMX 起址</th><th>通道数</th><th>占用区间</th><th>状态</th></tr>
        </thead>
        <tbody>
          {rows.map((fixture) => {
            const conflicted = conflictedIds.has(fixture.id);
            return <tr key={fixture.id} className={conflicted ? "row-conflict" : ""}>
              <td>{fixture.fixture_code}</td>
              <td>{fixture.fixture_type}</td>
              <td>
                <input
                  className="num-input"
                  type="number"
                  min={1}
                  max={512}
                  value={fixture.dmx_address}
                  onChange={(event) => patch(fixture, { dmx_address: event.target.value })}
                />
              </td>
              <td>
                <input
                  className="num-input"
                  type="number"
                  min={1}
                  max={64}
                  value={fixture.channel_count}
                  onChange={(event) => patch(fixture, { channel_count: Math.max(1, Number(event.target.value) || 1) })}
                />
              </td>
              <td><DmxRangeTag start={Number(fixture.dmx_address) || 1} count={fixture.channel_count} conflict={conflicted} /></td>
              <td>
                <select
                  value={fixture.fixture_status}
                  onChange={(event) => patch(fixture, { fixture_status: event.target.value })}
                >
                  {FixtureStatus.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </td>
            </tr>;
          })}
        </tbody>
      </table>}
    </section>
  </main>;
}
