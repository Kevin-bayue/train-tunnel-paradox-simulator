// One canonical world: tunnel frame S. Length in m; time in μs.
export const C = 299.792458;
export const TRAIN_PROPER_LENGTH = 300;
export const TUNNEL_PROPER_LENGTH = 200;
export const D = TUNNEL_PROPER_LENGTH / 2;
export type Frame = "tunnel" | "train";
export type Coordinate = { x: number; t: number };
export type RelativityEvent = {
  id: string;
  label: string;
  kind: "door-close" | "door-open" | "signal-reception" | "signal-emission";
  door: "A" | "B";
  tunnel: Coordinate;
};
export function lorentzGamma(beta: number) {
  if (!Number.isFinite(beta) || Math.abs(beta) >= 1)
    throw new RangeError("|β| must be < 1");
  return 1 / Math.sqrt(1 - beta * beta);
}
export function betaFromGamma(gamma: number) {
  if (!Number.isFinite(gamma) || gamma < 1)
    throw new RangeError("γ must be finite and ≥ 1");
  return Math.sqrt(1 - 1 / (gamma * gamma));
}
export function transformEventToTrainFrame(
  { x, t }: Coordinate,
  beta: number,
): Coordinate {
  const g = lorentzGamma(beta);
  return { x: g * (x - beta * C * t), t: g * (t - (beta * x) / C) };
}
export function transformEventToTunnelFrame(p: Coordinate, beta: number) {
  return transformEventToTrainFrame(p, -beta);
}
export function transformSpaceTime(e: Coordinate, frame: Frame, beta: number) {
  return frame === "tunnel" ? e : transformEventToTrainFrame(e, beta);
}
export function lengthContraction(length: number, beta: number) {
  if (!Number.isFinite(length) || length <= 0)
    throw new RangeError("Length must be positive");
  return length / lorentzGamma(beta);
}
export function getTrainLength(frame: Frame, beta: number) {
  return frame === "train"
    ? TRAIN_PROPER_LENGTH
    : lengthContraction(TRAIN_PROPER_LENGTH, beta);
}
export function getTunnelLength(frame: Frame, beta: number) {
  return frame === "tunnel"
    ? TUNNEL_PROPER_LENGTH
    : lengthContraction(TUNNEL_PROPER_LENGTH, beta);
}
export function calculateFitThreshold(
  train = TRAIN_PROPER_LENGTH,
  tunnel = TUNNEL_PROPER_LENGTH,
) {
  if (
    !Number.isFinite(train) ||
    !Number.isFinite(tunnel) ||
    train <= 0 ||
    tunnel <= 0
  )
    throw new RangeError("Lengths must be positive");
  return train <= tunnel ? 0 : betaFromGamma(train / tunnel);
}
export function trainFitsInTunnel(
  beta: number,
  train = TRAIN_PROPER_LENGTH,
  tunnel = TUNNEL_PROPER_LENGTH,
) {
  calculateFitThreshold(train, tunnel);
  return lengthContraction(train, beta) <= tunnel + 1e-9;
}
export function fitStatus(beta: number) {
  const delta = TUNNEL_PROPER_LENGTH - getTrainLength("tunnel", beta);
  return Math.abs(delta) < 1e-7
    ? "Just fits"
    : delta < 0
      ? "Train does not completely fit yet"
      : "Train fits in the Station Frame";
}
export const doorEvents: RelativityEvent[] = [
  {
    id: "A",
    label: "Entrance A receives light",
    kind: "door-close",
    door: "A",
    tunnel: { x: -D, t: 0 },
  },
  {
    id: "B",
    label: "Exit B receives light",
    kind: "door-close",
    door: "B",
    tunnel: { x: D, t: 0 },
  },
];
export function calculateDoorTimeDifference(beta: number) {
  return (
    transformEventToTrainFrame(doorEvents[1].tunnel, beta).t -
    transformEventToTrainFrame(doorEvents[0].tunnel, beta).t
  );
}
export function doorOrder(beta: number) {
  const gap = calculateDoorTimeDifference(beta);
  return Math.abs(gap) < 1e-10
    ? "A and B are simultaneous"
    : gap < 0
      ? "Exit B receives light before entrance A"
      : "Entrance A receives light before exit B";
}
// Positive duration stays strictly inside the fit window. At the threshold,
// closure is an instantaneous idealization; no fictitious positive safe dwell.
export function shutterDuration(beta: number) {
  const margin = TUNNEL_PROPER_LENGTH - getTrainLength("tunnel", beta);
  return !trainFitsInTunnel(beta) || margin < 1e-8
    ? 0
    : Math.min(0.018, margin / (4 * Math.abs(beta) * C));
}
export function openingEvents(beta: number): RelativityEvent[] {
  return doorEvents.map((e) => ({
    ...e,
    id: e.id + "-open",
    label:
      e.door === "A"
        ? "Entrance A clears below track"
        : "Exit B clears below track",
    kind: "door-open",
    tunnel: { ...e.tunnel, t: shutterDuration(beta) },
  }));
}
export function frameTime(anchor: number, frame: Frame, beta: number) {
  return frame === "tunnel" ? anchor : anchor / lorentzGamma(beta);
}
export function tunnelLandmark(
  x: number,
  anchor: number,
  frame: Frame,
  beta: number,
) {
  return frame === "tunnel"
    ? x
    : x / lorentzGamma(beta) - beta * C * frameTime(anchor, frame, beta);
}
export function trainMidpoint(anchor: number, frame: Frame, beta: number) {
  return frame === "tunnel" ? beta * C * anchor : 0;
}
export function doorClosed(
  door: "A" | "B",
  anchor: number,
  frame: Frame,
  beta: number,
) {
  if (!trainFitsInTunnel(beta)) return false;
  const i = door === "A" ? 0 : 1;
  const t = frameTime(anchor, frame, beta),
    close = transformSpaceTime(doorEvents[i].tunnel, frame, beta).t,
    open = transformSpaceTime(openingEvents(beta)[i].tunnel, frame, beta).t;
  return t >= close - 1e-10 && t <= open + 1e-10;
}
export function trainInsideTunnel(anchor: number, beta: number) {
  return (
    Math.abs(beta * C * anchor) + getTrainLength("tunnel", beta) / 2 <= D + 1e-9
  );
}
export function calculateLightWorldline(
  e: Coordinate,
  time: number,
  direction: 1 | -1,
) {
  return e.x + direction * C * (time - e.t);
}
export function receptionEvents(beta: number): RelativityEvent[] {
  return doorEvents.map((e, i) => {
    const t = D / (C * (1 + (i ? beta : -beta)));
    return {
      id: "R" + e.id,
      label: e.door + " signal received",
      kind: "signal-reception",
      door: e.door,
      tunnel: { x: beta * C * t, t },
    };
  });
}
export function timelineBounds(beta: number) {
  const half = (lorentzGamma(beta) ** 2 * Math.abs(beta) * D) / C;
  return {
    start:
      Math.min(
        -half - 0.25,
        ...sensorEvents(beta).flatMap((e) => [
          e.tunnel.t,
          eventAnchor(e.tunnel, "train", beta),
        ]),
      ) - 0.15,
    end: half + lorentzGamma(beta) ** 2 * shutterDuration(beta) + 0.35,
  };
}
export const fmt = (n: number, digits = 3) =>
  (Math.abs(n) < 0.5 * 10 ** -digits ? 0 : n).toFixed(digits);

// Video circuit: train midpoint triggers an upstream detector, which signals
// the central relay. The relay's pulse reaches both stationary gates at t=0.
export function sensorEvents(beta: number): RelativityEvent[] {
  const relay = { x: 0, t: -D / C };
  const x = (-Math.abs(beta) * D) / (1 - Math.abs(beta));
  return [
    {
      id: "S1",
      label: "S1 · train triggers upstream sensor",
      kind: "signal-emission",
      door: "A",
      tunnel: { x, t: relay.t + x / C },
    },
    {
      id: "S2",
      label: "S2 · relay receives and emits",
      kind: "signal-emission",
      door: "B",
      tunnel: relay,
    },
  ];
}
export function eventAnchor(event: Coordinate, frame: Frame, beta: number) {
  const q = transformSpaceTime(event, frame, beta).t;
  return frame === "train" ? q * lorentzGamma(beta) : q;
}
export function gateProgress(
  door: "A" | "B",
  anchor: number,
  frame: Frame,
  beta: number,
) {
  if (!trainFitsInTunnel(beta) || shutterDuration(beta) === 0) return 0;
  const start = transformSpaceTime(
    doorEvents[door === "A" ? 0 : 1].tunnel,
    frame,
    beta,
  ).t;
  const duration =
    shutterDuration(beta) * (frame === "train" ? lorentzGamma(beta) : 1);
  return Math.max(
    0,
    Math.min(1, (frameTime(anchor, frame, beta) - start) / duration),
  );
}
export function gatePhase(
  door: "A" | "B",
  anchor: number,
  frame: Frame,
  beta: number,
) {
  if (!trainFitsInTunnel(beta)) return "Blocked · insufficient clearance";
  if (!shutterDuration(beta)) return "Zero-duration ideal limit";
  const t = frameTime(anchor, frame, beta);
  const start = transformSpaceTime(
    doorEvents[door === "A" ? 0 : 1].tunnel,
    frame,
    beta,
  ).t;
  if (t < start - 1e-10) return "Raised · awaiting light";
  if (gateProgress(door, anchor, frame, beta) < 1)
    return "Signal received · dropping";
  return "Clear · below track";
}
// Slow the shared clock around each gate's real event interval. Geometry is
// always a pure function of coordinate time, so pausing/scrubbing never lags.
export function playbackRate(anchor: number, frame: Frame, beta: number) {
  const duration =
    shutterDuration(beta) * (frame === "train" ? lorentzGamma(beta) ** 2 : 1);
  for (const e of doorEvents) {
    const start = eventAnchor(e.tunnel, frame, beta);
    if (
      duration > 0 &&
      anchor >= start - Math.min(0.002, duration * 0.1) &&
      anchor <= start + duration
    )
      return Math.max(0.002, duration / 2.2);
  }
  return 0.25;
}
