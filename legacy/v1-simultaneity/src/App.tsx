import { useState } from "react";
import { stages } from "./stages/stages";
import type { CameraView } from "./stages/stages";
import {
  C,
  emissions,
  lorentzGamma,
  fmt,
  frameTime,
  timelineBounds,
  receptionEvents,
  transformSpaceTime,
} from "./physics/model";
import type { Frame } from "./physics/model";
import { useSimulationClock } from "./hooks/useSimulationClock";
import { RelativityScene } from "./components/RelativityScene";
import { PhysicsPanel } from "./components/PhysicsPanel";
export default function App() {
  const [index, setIndex] = useState(0),
    [mode, setMode] = useState<"learn" | "explore">("learn"),
    [beta, setBeta] = useState(0.5),
    [frame, setFrame] = useState<Frame>("station"),
    [camera, setCamera] = useState<CameraView>("Overview");
  const [toggles, setToggles] = useState({
    events: true,
    pulses: true,
    coordinates: true,
    axes: true,
    clocks: true,
  });
  const clock = useSimulationClock(
      beta,
      mode === "learn" && stages[index].timeline === "emissions"
        ? 0.12
        : undefined,
    ),
    stage = stages[index],
    bounds = timelineBounds(beta),
    g = lorentzGamma(beta);
  const explore = mode === "explore";
  function go(i: number) {
    const next = stages[i];
    if (index === 1 && i === 2) clock.setPlaying(true);
    setIndex(i);
    setFrame(next.frame);
    setCamera(next.camera);
    if (next.timeline === "setup") {
      clock.setPlaying(false);
      clock.setTime(0);
    }
    if (next.timeline === "emissions") {
      clock.setTime(-0.25);
      clock.setPlaying(true);
    }
  }
  const pulses = explore ? toggles.pulses : stage.pulses,
    clocks = explore ? toggles.clocks : stage.clocks;
  return (
    <div className="app">
      <header>
        <div>
          <span className="eyebrow">Modern Physics / Einstein’s train</span>
          <h1>Relativity of Simultaneity</h1>
        </div>
        <div className="segmented" aria-label="Mode">
          {(["learn", "explore"] as const).map((m) => (
            <button
              key={m}
              aria-pressed={mode === m}
              onClick={() => setMode(m)}
            >
              {m === "learn" ? "Learn Mode" : "Explore Mode"}
            </button>
          ))}
        </div>
      </header>
      <main>
        <nav className="process panel" aria-label="Learning stages">
          <h3>Process</h3>
          <p className="rail-title">
            ONE EXPERIMENT.
            <br />
            SIX PERSPECTIVES.
          </p>
          {stages.map((s, i) => (
            <button
              key={s.title}
              onClick={() => go(i)}
              aria-label={`Go to stage ${i + 1}`}
              aria-current={index === i ? "step" : undefined}
            >
              <span className="number">{i < index ? "✓" : i + 1}</span>
              <span>
                <b>{s.title}</b>
                <small>{s.subtitle}</small>
              </span>
            </button>
          ))}
          <div className="rail-note">
            S → S′
            <br />
            <span>
              Same events.
              <br />
              Different coordinates.
            </span>
          </div>
        </nav>
        <section className="center">
          <div className="experiment panel">
            <div className="scene-heading">
              <div>
                <span className="eyebrow">
                  {explore
                    ? "Explore the experiment"
                    : `Stage ${index + 1} of 6`}
                </span>
                <h2>{stage.title}</h2>
              </div>
              <p>{stage.question}</p>
            </div>
            <div className="scene">
              <RelativityScene
                beta={beta}
                time={clock.time}
                frame={frame}
                camera={camera}
                events={!explore || toggles.events}
                pulses={pulses}
                clocks={clocks}
              />
              <div className="frame-banner">
                <span>Viewing from</span>
                <strong>
                  {frame === "station"
                    ? "Station Frame · S"
                    : "Train Frame · S′"}
                </strong>
                <small>
                  {frame === "station"
                    ? "Train velocity = +"
                    : "Station / track velocity = −"}
                  {fmt(beta, 2)}c
                </small>
              </div>
              <div className="scene-legend">
                <span className="a">○ A emission</span>
                <span className="b">○ B emission</span>
                {pulses && <span>◇ reception</span>}
              </div>
              {clocks && (
                <div className="clock-overlay">
                  Coordinate time {frame === "train" ? "t′" : "t"} ={" "}
                  {fmt(frameTime(clock.time, frame, beta))} μs
                  <br />
                  <small>
                    Train midpoint clock τ = {fmt(clock.time / g)} μs
                  </small>
                </div>
              )}
              {(explore
                ? toggles.coordinates
                : ["axes", "projection", "now"].includes(stage.diagram)) && (
                <div className="event-coordinate-overlay">
                  {emissions.map((e) => (
                    <span className={e.id.toLowerCase()} key={e.id}>
                      ○ {e.id} · t = 0.000 · t′ ={" "}
                      {fmt(transformSpaceTime(e.station, "train", beta).t)} μs
                    </span>
                  ))}
                </div>
              )}
              {stage.now && (
                <div className="now-overlay">
                  <span className="gold">Station “now”: t = 0</span>
                  <span className="mint">Train “now”: t′ = 0 ⇔ ct = βx</span>
                  <small>Spacetime guides, not physical surfaces</small>
                </div>
              )}
              <div className="scene-note">
                Schematic train · not a photograph or length measurement
              </div>
            </div>
            <div className="controls">
              <div className="velocity">
                <label htmlFor="beta">
                  Relative velocity <strong>β = {fmt(beta, 2)}</strong>
                </label>
                <input
                  id="beta"
                  aria-label="Relative velocity beta"
                  type="range"
                  min="0"
                  max=".9"
                  step=".01"
                  value={beta}
                  onChange={(e) => setBeta(+e.target.value)}
                />
                <div>
                  <span>v = {fmt(beta, 2)}c</span>
                  <span>γ = {fmt(g)}</span>
                </div>
              </div>
              <div className="control-group">
                <label>Reference frame</label>
                <div className="segmented">
                  {(["station", "train"] as const).map((f) => (
                    <button
                      key={f}
                      aria-pressed={frame === f}
                      onClick={() => setFrame(f)}
                    >
                      {f === "station" ? "Station" : "Train"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="control-group">
                <label htmlFor="camera">Camera view</label>
                <select
                  id="camera"
                  value={camera}
                  onChange={(e) => setCamera(e.target.value as CameraView)}
                >
                  {["Overview", "Side", "Center"].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="playback">
              <button
                className="primary"
                onClick={() => {
                  if (!clock.playing && clock.time >= bounds.end)
                    clock.setTime(bounds.start);
                  clock.setPlaying(!clock.playing);
                }}
              >
                {clock.playing ? "Pause" : "Play"}
              </button>
              <button onClick={clock.reset}>Reset</button>
              <input
                aria-label="Simulation timeline"
                type="range"
                min={Math.min(bounds.start, clock.time)}
                max={Math.max(bounds.end, clock.time)}
                step=".001"
                value={clock.time}
                onChange={(e) => {
                  clock.setPlaying(false);
                  clock.setTime(+e.target.value);
                }}
              />
              <output data-testid="anchor-time">
                S anchor: {fmt(clock.time)} μs
              </output>
            </div>
            <div className="context-strip">
              {pulses
                ? "Emission ≠ reception. Arrival order alone does not establish emission order."
                : "A: x = −150 m   ·   B: x = +150 m   ·   Both emit at station t = 0"}
            </div>
          </div>
          {explore && (
            <div className="explore-controls panel">
              <h3>Visualization</h3>
              {Object.entries(toggles).map(([key, value]) => (
                <label key={key}>
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) =>
                      setToggles({ ...toggles, [key]: e.target.checked })
                    }
                  />
                  {
                    (
                      {
                        events: "Events",
                        pulses: "Light paths",
                        coordinates: "Coordinate labels",
                        axes: "Spacetime axes",
                        clocks: "Observer clocks",
                      } as Record<string, string>
                    )[key]
                  }
                </label>
              ))}
            </div>
          )}
          <footer className="navigation panel">
            <button disabled={index === 0} onClick={() => go(index - 1)}>
              ← Previous
            </button>
            <div className="progress" aria-label="Stage progress">
              {stages.map((_, i) => (
                <button
                  key={i}
                  aria-label={`Stage ${i + 1}`}
                  aria-current={i === index ? "step" : undefined}
                  onClick={() => go(i)}
                />
              ))}
              <small>Stage {index + 1} of 6</small>
            </div>
            <button
              className="primary"
              onClick={() => (index === 5 ? setMode("explore") : go(index + 1))}
            >
              {index === 5 ? "Explore Mode" : "Next →"}
            </button>
          </footer>
          <details className="event-records panel">
            <summary>Event records & model notes</summary>
            <p>
              Emission coordinates are fixed in S. Reception is where a signal
              meets the train midpoint. Frame switching preserves the midpoint
              anchor event; simultaneity slices change.
            </p>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>Kind</th>
                    <th>x / m</th>
                    <th>t / μs</th>
                    <th>x′ / m</th>
                    <th>t′ / μs</th>
                  </tr>
                </thead>
                <tbody>
                  {[...emissions, ...receptionEvents(beta)].map((e) => {
                    const p = transformSpaceTime(e.station, "train", beta);
                    return (
                      <tr key={e.id}>
                        <td>{e.label}</td>
                        <td>{e.kind}</td>
                        <td>{fmt(e.station.x)}</td>
                        <td>{fmt(e.station.t)}</td>
                        <td>{fmt(p.x)}</td>
                        <td>{fmt(p.t)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p>
              c = {C} m/μs. Camera changes only your viewing angle. Moving
              station scenery is schematic; event coordinates and signals follow
              Lorentz transformations. Velocity edits immediately define a new
              constant-velocity experiment.
            </p>
          </details>
        </section>
        <PhysicsPanel
          stage={
            explore
              ? { ...stage, coordinates: toggles.coordinates, diagram: "now" }
              : stage
          }
          beta={beta}
          axes={!explore || toggles.axes}
        />
      </main>
    </div>
  );
}
