// Canonical coordinates: station S; metres and microseconds.
export const C = 299.792458;
export const D = 150;
export type Frame = "station" | "train";
export type Coordinate = { x: number; t: number };
export type RelativityEvent = {
  id: string;
  label: string;
  kind: "emission" | "reception";
  station: Coordinate;
  source: "A" | "B";
};
export function lorentzGamma(beta: number) {
  if (!Number.isFinite(beta) || Math.abs(beta) >= 1)
    throw new RangeError("|β| must be < 1");
  return 1 / Math.sqrt(1 - beta * beta);
}
export function stationToTrainEvent(
  { x, t }: Coordinate,
  beta: number,
): Coordinate {
  const g = lorentzGamma(beta);
  return { x: g * (x - beta * C * t), t: g * (t - (beta * x) / C) };
}
export function trainToStationEvent(
  { x, t }: Coordinate,
  beta: number,
): Coordinate {
  return stationToTrainEvent({ x, t }, -beta);
}
export function transformSpaceTime(
  event: Coordinate,
  frame: Frame,
  beta: number,
) {
  return frame === "station" ? event : stationToTrainEvent(event, beta);
}
export const emissions: RelativityEvent[] = [
  {
    id: "A",
    label: "A emitted",
    kind: "emission",
    source: "A",
    station: { x: -D, t: 0 },
  },
  {
    id: "B",
    label: "B emitted",
    kind: "emission",
    source: "B",
    station: { x: D, t: 0 },
  },
];
export function receptionEvents(beta: number): RelativityEvent[] {
  return emissions.map((e) => {
    const t = D / (C * (1 + (e.id === "B" ? beta : -beta)));
    return {
      id: `R${e.id}`,
      label: `${e.id} received`,
      source: e.source,
      kind: "reception",
      station: { x: beta * C * t, t },
    };
  });
}
export function calculateSimultaneityGap(beta: number) {
  return (
    stationToTrainEvent(emissions[1].station, beta).t -
    stationToTrainEvent(emissions[0].station, beta).t
  );
}
export function emissionOrder(beta: number) {
  const gap = calculateSimultaneityGap(beta);
  return Math.abs(gap) < 1e-10
    ? "A and B are simultaneous"
    : `${gap < 0 ? "B" : "A"} occurs earlier`;
}
export function calculateLightWorldline(
  emission: Coordinate,
  time: number,
  direction: 1 | -1,
) {
  return emission.x + direction * C * (time - emission.t);
}
// Anchor is one event on the train midpoint worldline, indexed by station time.
export function frameTime(anchor: number, frame: Frame, beta: number) {
  return frame === "station" ? anchor : anchor / lorentzGamma(beta);
}
export function stationLandmark(
  x: number,
  anchor: number,
  frame: Frame,
  beta: number,
) {
  return frame === "station"
    ? x
    : x / lorentzGamma(beta) - beta * C * frameTime(anchor, frame, beta);
}
export function trainMidpoint(anchor: number, frame: Frame, beta: number) {
  return frame === "station" ? beta * C * anchor : 0;
}
export function timelineBounds(beta: number) {
  return {
    start: Math.min(-0.25, (-(lorentzGamma(beta) ** 2) * beta * D) / C - 0.15),
    end: receptionEvents(beta)[0].station.t + 0.25,
  };
}
export const fmt = (n: number, digits = 3) =>
  (Math.abs(n) < 0.5 * 10 ** -digits ? 0 : n).toFixed(digits);
