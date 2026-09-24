export function parseFixtureStates(raw: string): Record<number, number> {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      return Object.fromEntries(
        Object.entries(parsed as Record<string, unknown>)
          .map(([key, value]) => [Number(key), Number(value)] as const)
          .filter(([key, value]) => Number.isFinite(key) && Number.isFinite(value))
      );
    }
  } catch {
    // Legacy free-text fixture_states are treated as an empty state map.
  }
  return {};
}

export function serializeFixtureStates(states: Record<number, number>): string {
  return JSON.stringify(states);
}
