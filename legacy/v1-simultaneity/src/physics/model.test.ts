import { describe, it, expect } from "vitest";
import {
  C,
  D,
  lorentzGamma,
  stationToTrainEvent,
  trainToStationEvent,
  emissions,
  receptionEvents,
  calculateSimultaneityGap,
  calculateLightWorldline,
  frameTime,
  stationLandmark,
  trainMidpoint,
  emissionOrder,
  timelineBounds,
} from "./model";
describe("Lorentz model inherited from original lab", () => {
  it("identity at beta zero", () => {
    expect(lorentzGamma(0)).toBe(1);
    expect(stationToTrainEvent({ x: 150, t: 2 }, 0)).toEqual({ x: 150, t: 2 });
    expect(calculateSimultaneityGap(0)).toBe(0);
    expect(emissionOrder(0)).toContain("simultaneous");
  });
  for (const beta of [0, 0.5, 0.8, 0.9]) {
    it(`inverse, interval and event symmetry at ${beta}`, () => {
      const e = { x: 127, t: 0.75 },
        p = stationToTrainEvent(e, beta),
        back = trainToStationEvent(p, beta);
      expect(back.x).toBeCloseTo(e.x, 9);
      expect(back.t).toBeCloseTo(e.t, 9);
      expect((C * p.t) ** 2 - p.x ** 2).toBeCloseTo(
        (C * e.t) ** 2 - e.x ** 2,
        7,
      );
      const a = stationToTrainEvent(emissions[0].station, beta),
        b = stationToTrainEvent(emissions[1].station, beta);
      expect(a.t).toBeCloseTo(-b.t, 12);
      expect(calculateSimultaneityGap(beta)).toBeCloseTo(
        (-lorentzGamma(beta) * beta * 2 * D) / C,
        12,
      );
      if (beta) expect(b.t).toBeLessThan(a.t);
    });
    it(`light intersects observer in both frames at ${beta}`, () => {
      receptionEvents(beta).forEach((r, i) => {
        const e = emissions[i].station,
          dir = i === 0 ? 1 : -1;
        expect(calculateLightWorldline(e, r.station.t, dir)).toBeCloseTo(
          r.station.x,
          9,
        );
        const ep = stationToTrainEvent(e, beta),
          rp = stationToTrainEvent(r.station, beta);
        expect(rp.x).toBeCloseTo(0, 9);
        expect(calculateLightWorldline(ep, rp.t, dir)).toBeCloseTo(0, 9);
        expect((rp.x - ep.x) / (rp.t - ep.t)).toBeCloseTo(dir * C, 9);
        expect(r.station.t).toBeLessThan(timelineBounds(beta).end);
      });
    });
    it(`frame switch preserves midpoint anchor at ${beta}`, () => {
      const t = 0.7,
        x = beta * C * t,
        prime = stationToTrainEvent({ x, t }, beta);
      expect(frameTime(t, "train", beta)).toBeCloseTo(prime.t, 12);
      expect(trainMidpoint(t, "train", beta)).toBeCloseTo(prime.x, 9);
      const q = frameTime(t, "train", beta);
      const landmark = stationLandmark(150, t, "train", beta);
      expect(trainToStationEvent({ x: landmark, t: q }, beta).x).toBeCloseTo(
        150,
        9,
      );
    });
    it(`spacetime axes satisfy their defining equations at ${beta}`, () => {
      expect(
        stationToTrainEvent({ x: 150, t: (beta * 150) / C }, beta).t,
      ).toBeCloseTo(0, 12);
      expect(
        stationToTrainEvent({ x: beta * 150, t: 150 / C }, beta).x,
      ).toBeCloseTo(0, 12);
    });
  }
  it("default numerical emission values", () => {
    expect(stationToTrainEvent(emissions[0].station, 0.5).t).toBeCloseTo(
      0.2888749802,
      8,
    );
    expect(calculateSimultaneityGap(0.5)).toBeCloseTo(-0.5777499604, 8);
  });
  it("reset begins before both emissions in either frame", () => {
    for (const b of [0, 0.5, 0.8, 0.9]) {
      const start = timelineBounds(b).start;
      expect(start).toBeLessThan(0);
      for (const e of emissions)
        expect(frameTime(start, "train", b)).toBeLessThan(
          stationToTrainEvent(e.station, b).t,
        );
    }
  });
  it("rejects invalid velocities", () => {
    for (const b of [1, -1, NaN, Infinity])
      expect(() => lorentzGamma(b)).toThrow();
  });
});
