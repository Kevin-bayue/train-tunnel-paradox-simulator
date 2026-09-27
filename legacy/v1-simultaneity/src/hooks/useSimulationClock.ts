// @refresh reset
import { useEffect, useRef, useState } from "react";
import { timelineBounds } from "../physics/model";
export function useSimulationClock(beta: number, pauseAt?: number) {
  const [time, setTime] = useState(-0.25);
  const [playing, setPlaying] = useState(false);
  const current = useRef(time);
  current.current = time;
  const options = useRef({ end: timelineBounds(beta).end, pauseAt });
  options.current = { end: timelineBounds(beta).end, pauseAt };
  useEffect(() => {
    if (!playing) return;
    let request = 0,
      last = performance.now(),
      accumulated = 0;
    function tick(now: number) {
      accumulated += Math.min((now - last) / 1000, 0.1);
      last = now;
      const steps = Math.floor(accumulated * 120);
      accumulated -= steps / 120;
      if (steps) {
        const { end, pauseAt: hold } = options.current;
        const t = current.current;
        let next = Math.max(t, Math.min(t + (steps / 120) * 0.24, end));
        const shouldHold = hold !== undefined && t < hold && next >= hold;
        if (shouldHold) next = hold;
        current.current = next;
        setTime(next);
        if (shouldHold || next >= end) {
          setPlaying(false);
          return;
        }
      }
      request = requestAnimationFrame(tick);
    }
    request = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(request);
  }, [playing]);
  return {
    time,
    setTime,
    playing,
    setPlaying,
    reset: () => {
      setPlaying(false);
      setTime(timelineBounds(beta).start);
    },
  };
}
