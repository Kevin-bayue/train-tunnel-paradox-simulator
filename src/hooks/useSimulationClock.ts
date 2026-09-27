// @refresh reset
import { useCallback, useEffect, useRef, useState } from "react";
import { timelineBounds, playbackRate } from "../physics/model";
export function useSimulationClock(
  beta: number,
  pauseAt?: number,
  frame: "tunnel" | "train" = "tunnel",
) {
  const [time, publishTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const current = useRef(time);
  const setTime = useCallback((value: number) => {
    current.current = value;
    publishTime(value);
  }, []);
  const options = useRef({
    end: timelineBounds(beta).end,
    pauseAt,
    beta,
    frame,
  });
  options.current = { end: timelineBounds(beta).end, pauseAt, beta, frame };
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
        const { end, pauseAt: hold, beta, frame } = options.current;
        const t = current.current;
        let next = t;
        for (let i = 0; i < steps; i++)
          next = Math.min(next + playbackRate(next, frame, beta) / 120, end);
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
