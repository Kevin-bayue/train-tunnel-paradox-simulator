import { useEffect, useState } from "react";
import { INTRO_DURATION } from "../physics/intro";
export function useIntroClock(active: boolean) {
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(
    !matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    if (!active || !playing) return;
    let id = 0,
      last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      setTime((t) => Math.min(INTRO_DURATION, t + dt));
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [active, playing]);
  useEffect(() => {
    if (time >= INTRO_DURATION) setPlaying(false);
  }, [time]);
  return {
    time,
    setTime,
    playing,
    setPlaying,
    replay: () => {
      setTime(0);
      setPlaying(true);
    },
  };
}
