import { formatBrightness } from "../../utils/formatters";

export function BrightnessBar({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  return <span className="brightness">
    <span className="brightness-track"><span className="brightness-fill" style={{ width: `${clamped}%` }} /></span>
    <span className="brightness-value">{formatBrightness(clamped)}</span>
  </span>;
}
