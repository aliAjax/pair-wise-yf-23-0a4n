import type { ExecutionConflict, ExecutionCueSheet } from "../../types/ExecutionSheet";
import { formatClock, formatDmxRange, formatPercent } from "../../utils/formatters";

export function ConflictCuePreview({ cueSheets, conflicts }: { cueSheets: ExecutionCueSheet[]; conflicts: ExecutionConflict[] }) {
  const cueConflictMap = new Map<number, ExecutionConflict[]>();
  conflicts.forEach((conflict) => {
    const cueIds = conflict.cue_ids?.length ? conflict.cue_ids : conflict.cue_id ? [conflict.cue_id] : [];
    cueIds.forEach((cueId) => {
      cueConflictMap.set(cueId, [...(cueConflictMap.get(cueId) ?? []), conflict]);
    });
  });

  return (
    <section className="panel failed-preview">
      <div className="panel-title danger"><h2>失败场次明细</h2><span>以下快照未保存</span></div>
      <div className="cue-sheets">
        {cueSheets.map((cue) => {
          const cueConflicts = cueConflictMap.get(cue.cue_id) ?? [];
          const fixtureConflictIds = new Set(cueConflicts.flatMap((conflict) => [
            conflict.fixture_id,
            conflict.fixture_a_id,
            conflict.fixture_b_id
          ].filter((id): id is number => typeof id === "number")));
          return (
            <article key={cue.track_id} className={`cue-sheet ${cueConflicts.length ? "has-conflict" : ""}`}>
              <header>
                <div><strong>{cue.sequence}. {cue.cue_name}</strong><span>{formatClock(cue.start_ms)} · Track #{cue.track_id}</span></div>
                <span className="mini-badge blocked">{cueConflicts.length ? `${cueConflicts.length} 个冲突` : "间接受影响"}</span>
              </header>
              {cue.fixture_rows.length > 0 && (
                <table className="sheet-table">
                  <thead><tr><th>灯具</th><th>DMX 起址</th><th>通道数</th><th>占用编号</th><th>亮度</th></tr></thead>
                  <tbody>
                    {cue.fixture_rows.map((row) => (
                      <tr key={row.fixture_id} className={fixtureConflictIds.has(row.fixture_id) ? "conflict-row" : ""}>
                        <td><span className="color-dot" style={{ background: row.color }} />{row.fixture_code}{!row.active && <b className="disabled-tag">停用</b>}</td>
                        <td>{row.dmx_address}</td>
                        <td>{row.channel_count}</td>
                        <td>{formatDmxRange(row.dmx_address, row.dmx_end_address)}</td>
                        <td>{formatPercent(row.brightness_percent)} <small>DMX {row.dmx_brightness}</small></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {cueConflicts.length > 0 && <ul className="sheet-conflicts">{cueConflicts.map((conflict, index) => <li key={index}>{conflict.message}</li>)}</ul>}
            </article>
          );
        })}
      </div>
    </section>
  );
}
