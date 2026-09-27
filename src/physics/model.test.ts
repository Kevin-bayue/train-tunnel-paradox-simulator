import katex from "katex";
import { stages } from "../stages/stages";
import { introSnapshot } from "./intro";
import { describe, it, expect } from "vitest";
import {
  C,
  D,
  lorentzGamma,
  betaFromGamma,
  transformEventToTrainFrame,
  transformEventToTunnelFrame,
  doorEvents,
  openingEvents,
  calculateDoorTimeDifference,
  doorOrder,
  lengthContraction,
  getTrainLength,
  getTunnelLength,
  calculateFitThreshold,
  trainFitsInTunnel,
  fitStatus,
  frameTime,
  tunnelLandmark,
  trainMidpoint,
  doorClosed,
  shutterDuration,
  trainInsideTunnel,
  timelineBounds,
  calculateLightWorldline,
  receptionEvents,
  sensorEvents,
  transformSpaceTime,
  eventAnchor,
  gateProgress,
  gatePhase,
} from "./model";
describe("Train–tunnel canonical physics", () => {
  it("beta zero gives proper lengths and simultaneous events", () => {
    expect(lorentzGamma(0)).toBe(1);
    for (const f of ["tunnel", "train"] as const) {
      expect(getTrainLength(f, 0)).toBe(300);
      expect(getTunnelLength(f, 0)).toBe(200);
    }
    expect(transformEventToTrainFrame({ x: 100, t: 2 }, 0)).toEqual({
      x: 100,
      t: 2,
    });
    expect(calculateDoorTimeDifference(0)).toBe(0);
    expect(trainFitsInTunnel(0)).toBe(false);
  });
  it("default beta .8 contracts the correct object", () => {
    expect(lorentzGamma(0.8)).toBeCloseTo(5 / 3, 12);
    expect(getTrainLength("tunnel", 0.8)).toBeCloseTo(180, 10);
    expect(getTunnelLength("train", 0.8)).toBeCloseTo(120, 10);
    expect(getTrainLength("train", 0.8)).toBe(300);
    expect(getTunnelLength("tunnel", 0.8)).toBe(200);
    expect(trainFitsInTunnel(0.8)).toBe(true);
    expect(calculateDoorTimeDifference(0.8)).toBeCloseTo(-0.8895042539, 9);
  });
  it("dynamic threshold handles below, equal and above", () => {
    const b = calculateFitThreshold();
    expect(b).toBeCloseTo(0.7453559925, 9);
    expect(trainFitsInTunnel(b - 1e-6)).toBe(false);
    expect(trainFitsInTunnel(b)).toBe(true);
    expect(trainFitsInTunnel(b + 1e-6)).toBe(true);
    expect(fitStatus(b)).toBe("Just fits");
    expect(shutterDuration(b)).toBe(0);
    expect(calculateFitThreshold(100, 200)).toBe(0);
    expect(calculateFitThreshold(200, 200)).toBe(0);
    expect(trainFitsInTunnel(0, 100, 200)).toBe(true);
    expect(calculateFitThreshold(400, 200)).toBeCloseTo(Math.sqrt(0.75), 12);
  });
  for (const b of [0, 0.5, 0.745, 0.8, 0.9, 0.95]) {
    it(`Lorentz inverse and interval invariance at ${b}`, () => {
      const e = { x: 137, t: 0.82 },
        p = transformEventToTrainFrame(e, b),
        back = transformEventToTunnelFrame(p, b);
      expect(back.x).toBeCloseTo(e.x, 9);
      expect(back.t).toBeCloseTo(e.t, 10);
      expect((C * p.t) ** 2 - p.x ** 2).toBeCloseTo(
        (C * e.t) ** 2 - e.x ** 2,
        7,
      );
      expect(betaFromGamma(lorentzGamma(b))).toBeCloseTo(b, 10);
    });
    it(`door sign, symmetry and midpoint continuity at ${b}`, () => {
      const a = transformEventToTrainFrame(doorEvents[0].tunnel, b),
        exit = transformEventToTrainFrame(doorEvents[1].tunnel, b);
      expect(a.t).toBeCloseTo(-exit.t, 12);
      expect(calculateDoorTimeDifference(b)).toBeCloseTo(
        (-lorentzGamma(b) * b * 200) / C,
        12,
      );
      if (b) {
        expect(exit.t).toBeLessThan(a.t);
        expect(doorOrder(b)).toContain("Exit B");
      }
      const t = 0.3,
        p = transformEventToTrainFrame({ x: b * C * t, t }, b);
      expect(p.t).toBeCloseTo(frameTime(t, "train", b), 12);
      expect(p.x).toBeCloseTo(trainMidpoint(t, "train", b), 9);
    });
    it(`door objects coincide with their events on the right slice at ${b}`, () => {
      doorEvents.forEach((e) => {
        const p = transformEventToTrainFrame(e.tunnel, b),
          anchor = p.t * lorentzGamma(b);
        expect(tunnelLandmark(e.tunnel.x, anchor, "train", b)).toBeCloseTo(
          p.x,
          9,
        );
      });
    });
    it(`spacetime axes and light speeds at ${b}`, () => {
      expect(
        transformEventToTrainFrame({ x: 100, t: (b * 100) / C }, b).t,
      ).toBeCloseTo(0, 12);
      expect(
        transformEventToTrainFrame({ x: b * 100, t: 100 / C }, b).x,
      ).toBeCloseTo(0, 12);
      receptionEvents(b).forEach((r, i) => {
        const e = transformEventToTrainFrame(doorEvents[i].tunnel, b),
          p = transformEventToTrainFrame(r.tunnel, b);
        expect(calculateLightWorldline(e, p.t, i ? -1 : 1)).toBeCloseTo(p.x, 9);
        expect(p.x).toBeCloseTo(0, 9);
      });
    });
    it(`safe shutters and full timeline at ${b}`, () => {
      const g = lorentzGamma(b),
        bounds = timelineBounds(b);
      for (const e of [...doorEvents, ...openingEvents(b)]) {
        const p = transformEventToTrainFrame(e.tunnel, b);
        expect(p.t * g).toBeGreaterThan(bounds.start);
        expect(p.t * g).toBeLessThan(bounds.end);
      }
      if (!trainFitsInTunnel(b)) {
        expect(doorClosed("A", 0, "tunnel", b)).toBe(false);
        expect(doorClosed("B", 0, "train", b)).toBe(false);
      } else {
        const dt = shutterDuration(b);
        for (const t of [0, dt / 2, dt])
          expect(trainInsideTunnel(t, b)).toBe(true);
        const exitOpen = transformEventToTrainFrame(
          openingEvents(b)[1].tunnel,
          b,
        ).t;
        const entranceClose = transformEventToTrainFrame(
          doorEvents[0].tunnel,
          b,
        ).t;
        expect(exitOpen).toBeLessThan(entranceClose);
        for (let i = 0; i <= 500; i++) {
          const t = bounds.start + ((bounds.end - bounds.start) * i) / 500;
          expect(
            doorClosed("A", t, "train", b) && doorClosed("B", t, "train", b),
          ).toBe(false);
        }
      }
    });
  }
  it("rejects invalid velocities, lengths and gamma", () => {
    for (const b of [1, -1, NaN, Infinity])
      expect(() => lorentzGamma(b)).toThrow();
    for (const l of [0, -1, Infinity, NaN])
      expect(() => calculateFitThreshold(l, 200)).toThrow();
    expect(() => betaFromGamma(0.9)).toThrow();
    expect(() => lengthContraction(-1, 0.8)).toThrow();
  });
});

describe("Video sensor circuit and continuous gate travel", () => {
  for (const beta of [0.75, 0.8, 0.9, 0.95]) {
    it(`causal S1 → S2 → gates, invariant light speed and safe gate sweep at ${beta}`, () => {
      const [s1, s2] = sensorEvents(beta);
      expect(s1.tunnel.x).toBeLessThan(-D);
      expect(s1.tunnel.x).toBeCloseTo(beta * C * s1.tunnel.t, 9);
      for (const frame of ["tunnel", "train"] as const) {
        const e1 = transformSpaceTime(s1.tunnel, frame, beta);
        const e2 = transformSpaceTime(s2.tunnel, frame, beta);
        expect(e2.t).toBeGreaterThan(e1.t);
        expect(e2.x - e1.x).toBeCloseTo(C * (e2.t - e1.t), 8);
        for (const e of doorEvents) {
          const received = transformSpaceTime(e.tunnel, frame, beta);
          expect(received.t).toBeGreaterThan(e2.t);
          expect(Math.abs(received.x - e2.x)).toBeCloseTo(
            C * (received.t - e2.t),
            8,
          );
          for (let i = 0; i <= 100; i++) {
            const t = (shutterDuration(beta) * i) / 100;
            const anchor = eventAnchor({ x: e.tunnel.x, t }, frame, beta);
            expect(gateProgress(e.door, anchor, frame, beta)).toBeCloseTo(
              i / 100,
              8,
            );
            const trainX = trainMidpoint(anchor, frame, beta);
            const gateX = tunnelLandmark(e.tunnel.x, anchor, frame, beta);
            expect(Math.abs(gateX - trainX)).toBeGreaterThan(
              getTrainLength(frame, beta) / 2,
            );
          }
        }
      }
      const bounds = timelineBounds(beta);
      for (const e of [s1, s2, ...doorEvents, ...openingEvents(beta)])
        for (const frame of ["tunnel", "train"] as const)
          expect(eventAnchor(e.tunnel, frame, beta)).toBeGreaterThan(
            bounds.start,
          );
    });
  }
  it("never animates unsafe or zero-duration gates", () => {
    for (const beta of [0, 0.5, calculateFitThreshold()])
      expect(gateProgress("A", 100, "tunnel", beta)).toBe(0);
  });
  it("gate travel is continuous, monotone and time-reversible when scrubbing", () => {
    const dt = shutterDuration(0.8);
    const values = [-0.1, 0, dt * 0.25, dt * 0.5, dt * 0.75, dt, dt + 0.1].map(
      (t) => gateProgress("B", t, "tunnel", 0.8),
    );
    expect(values).toEqual([0, 0, 0.25, 0.5, 0.75, 1, 1]);
    expect(gatePhase("B", -1, "train", 0.8)).toContain("awaiting");
    expect(gatePhase("B", 2, "train", 0.8)).toContain("below track");
  });
});

describe("Animated misconception introduction", () => {
  it("station drop stays inside the physical clearance window", () => {
    for (let i = 0; i <= 1200; i++) {
      const s = introSnapshot(i / 100, 0.8);
      if (s.progress > 0 && s.progress < 1)
        expect(trainInsideTunnel(s.time, 0.8)).toBe(true);
    }
    expect(introSnapshot(4, 0.8).progress).toBe(0);
    expect(introSnapshot(6, 0.8).progress).toBe(1);
  });
  it("freezes only the counterfactual at predicted impact; real train continues", () => {
    const impact = introSnapshot(5, 0.8),
      end = introSnapshot(12, 0.8);
    expect(end.wrongTime).toBe(impact.wrongTime);
    expect(end.wrongProgress).toBe(0.5);
    expect(end.time).toBeGreaterThan(impact.time);
    expect(end.impact).toBe(true);
    expect(introSnapshot(0, 0.8).impact).toBe(false);
  });
});

for (const stage of stages) {
  it(`renders all LaTeX formulas for ${stage.title.en}`, () => {
    for (const tex of stage.formula)
      expect(() =>
        katex.renderToString(tex, { throwOnError: true }),
      ).not.toThrow();
  });
}

// Exercise the displayed derivation, including every generated KaTeX expression.
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  EventTimeDerivation,
  eventTimeDerivation,
} from "../components/EventTimeDerivation";
import { playbackRate } from "./model";
describe("live gate-time derivation and playback", () => {
  it.each([0, 0.5, 0.8, 0.9])(
    "derives and renders canonical events at beta=%s",
    (beta) => {
      const result = eventTimeDerivation(beta);
      expect(result.a.tunnel).toEqual({ x: -100, t: 0 });
      expect(result.b.tunnel).toEqual({ x: 100, t: 0 });
      expect(result.delta).toBeCloseTo(calculateDoorTimeDifference(beta), 12);
      expect(result.first).toBe(beta === 0 ? null : "B");
      expect(() =>
        renderToStaticMarkup(createElement(EventTimeDerivation, { beta })),
      ).not.toThrow();
      if (beta === 0) {
        expect(result.a.time).toBe(0);
        expect(result.b.time).toBe(0);
      } else {
        expect(result.a.time).toBeGreaterThan(0);
        expect(result.b.time).toBeLessThan(0);
      }
    },
  );
  it("matches animation time and yields increasing separation", () => {
    const result = eventTimeDerivation(0.8);
    expect(result.a.time).toBeCloseTo(0.445, 3);
    expect(result.b.time).toBeCloseTo(-0.445, 3);
    expect(result.delta).toBeCloseTo(-0.89, 3);
    expect(Math.abs(eventTimeDerivation(0.9).delta)).toBeGreaterThan(
      Math.abs(result.delta),
    );
    for (const e of result.events) {
      const anchor = eventAnchor(e.tunnel, "train", 0.8);
      expect(frameTime(anchor, "train", 0.8)).toBeCloseTo(e.time, 12);
    }
  });
  it.each([0.746, 0.8, 0.9])(
    "advances through each gate without idle slow motion at beta=%s",
    (beta) => {
      for (const frame of ["tunnel", "train"] as const) {
        for (const event of doorEvents) {
          const start = eventAnchor(event.tunnel, frame, beta);
          expect(playbackRate(start - 0.01, frame, beta)).toBe(
            0.25 * (frame === "train" ? lorentzGamma(beta) : 1),
          );
          let time = start - 0.02;
          for (let step = 0; step < 120 * 4; step++)
            time += playbackRate(time, frame, beta) / 120;
          expect(gateProgress(event.id as "A" | "B", time, frame, beta)).toBe(
            1,
          );
        }
      }
    },
  );
});

import { StationDerivation } from "../components/StationDerivation";
import { PhysicsPanel } from "../components/PhysicsPanel";
import { stationLesson, frameGeometry, trackPhase } from "./model";
describe("station lesson and true frame geometry", () => {
  it.each([0, 0.5, 0.8, 0.9])(
    "station explanation at beta=%s uses durations and keeps train times for stage 3",
    (beta) => {
      const m = stationLesson(beta);
      expect(m.distances).toEqual([100, 100]);
      expect(m.propagationTimes[0]).toBeCloseTo(0.333564, 6);
      expect(m.relay.t + m.propagationTimes[0]).toBeCloseTo(0, 12);
      expect(m.fits).toBe(beta >= 0.8);
      expect(() =>
        renderToStaticMarkup(createElement(StationDerivation, { beta })),
      ).not.toThrow();
      const html = renderToStaticMarkup(
        createElement(PhysicsPanel, {
          stage: stages[1],
          beta,
          frame: "tunnel",
          time: 0,
          axes: true,
          paradox: false,
          introProgress: 0,
        }),
      );
      expect(html).not.toContain("SAME RECEPTIONS, TWO TIMES");
      expect(html).not.toContain("EXIT DROPS FIRST");
      expect(html).toContain("Will Train Frame");
    },
  );
  it.each([0, 0.8, 0.9])(
    "keeps resting objects fixed and moving objects at the correct velocity: beta=%s",
    (beta) => {
      const g = lorentzGamma(beta),
        dt = 0.1;
      const s0 = frameGeometry(0, beta, 0),
        s1 = frameGeometry(dt, beta, 0);
      const t0 = frameGeometry(0, beta, 1),
        t1 = frameGeometry(dt * g, beta, 1);
      expect(s1.tunnelX).toBeCloseTo(0, 12);
      expect(s1.trainX - s0.trainX).toBeCloseTo(beta * C * dt, 10);
      expect(t1.trainX).toBe(0);
      expect(t1.trainScale * 300).toBe(300);
      expect(t1.tunnelScale * 200).toBeCloseTo(200 / g, 10);
      expect(t1.tunnelX - t0.tunnelX).toBeCloseTo(-beta * C * dt, 10);
    },
  );
  it("wraps track ties without changing their repeated world pattern", () => {
    const spacing = 0.6 / lorentzGamma(0.8);
    for (const x of [-100, -0.5, 0, 0.5, 100]) {
      expect(trackPhase(x, spacing)).toBeGreaterThanOrEqual(0);
      expect(trackPhase(x, spacing)).toBeLessThan(spacing);
      expect(trackPhase(x + spacing, spacing)).toBeCloseTo(
        trackPhase(x, spacing),
        10,
      );
    }
  });
});

it("normal playback makes higher beta visibly faster in the train frame", () => {
  const visibleSpeed = (beta: number) =>
    (beta * C * playbackRate(-10, "train", beta)) / lorentzGamma(beta);
  expect(visibleSpeed(0)).toBe(0);
  expect(visibleSpeed(0.9)).toBeGreaterThan(visibleSpeed(0.8));
});
