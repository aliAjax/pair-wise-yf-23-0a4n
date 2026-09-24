import { formatDmxRange } from "../../utils/formatters";

export function DmxRangeTag({ start, count, conflict = false }: { start: number; count: number; conflict?: boolean }) {
  return <span className={"dmx-tag" + (conflict ? " conflict" : "")}>{formatDmxRange(start, count)}</span>;
}
