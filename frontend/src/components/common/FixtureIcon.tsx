import type { Fixture } from "../../types/Fixture";

export function FixtureIcon({ fixture, active = true, brightness = 100 }: { fixture?: Fixture; active?: boolean; brightness?: number }) {
  const color = fixture?.fixture_type === "WASH" ? "#7dd3fc" : fixture?.fixture_type === "BEAM" ? "#fde047" : "#f8fafc";
  return (
    <div className={`fixture-icon ${active ? "is-on" : "is-off"}`} title={fixture?.fixture_code ?? "未知灯具"}>
      <span className="fixture-light" style={{ background: color, opacity: `${Math.max(active ? 0.25 : 0.08, brightness / 100)}` }} />
      <strong>{fixture?.fixture_code ?? "未引用"}</strong>
      <small>{fixture?.fixture_type ?? "UNKNOWN"}</small>
    </div>
  );
}
