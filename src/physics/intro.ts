import { shutterDuration } from "./model";
export const INTRO_DURATION = 12;
export function introSnapshot(seconds: number, beta: number) {
  const s = Math.max(0, Math.min(INTRO_DURATION, seconds));
  const progress = Math.max(0, Math.min(1, (s - 4) / 2));
  const time =
    s < 4
      ? -0.85 * (1 - s / 4)
      : s < 6
        ? shutterDuration(beta) * progress
        : shutterDuration(beta) + (s - 6) * 0.15;
  return {
    time,
    progress,
    wrongProgress: Math.min(0.5, progress),
    wrongTime: Math.min(time, shutterDuration(beta) / 2),
    impact: s >= 5,
    phase: s < 4 ? 0 : s < 5 ? 1 : s < 6 ? 2 : 3,
  };
}
