# Relativity of Simultaneity

A focused, six-stage exploration of Einstein’s train and lightning experiment. The original multi-topic, single-file Relativity Lab has been refactored in place into React + TypeScript + Vite with a persistent Three.js / React Three Fiber scene. The unchanged original is archived under `legacy/`.

## Run

Node.js 22.12+ recommended.

```sh
npm install
npm run dev
npm test
npm run build
npm run preview
```

Open the local URL printed by Vite. Production files are in `dist/`; serve them with an HTTP server. Assets use relative paths for static hosting. This version requires a build, unlike the archived single HTML file.

## Six learning stages

1. **Setup** — identify position, time, and physical events.
2. **Station Frame** — replay the two simultaneous station emissions.
3. **Light Reception** — distinguish emissions from signal arrivals.
4. **Train Frame** — assign different coordinates to the same events.
5. **Lorentz Time** — inspect live transformed times as velocity changes.
6. **Different “Now”** — compare simultaneity lines in spacetime.

Stage settings live in `src/stages/stages.ts`. One Canvas, one world, and one train remain mounted throughout navigation and mode changes. Stage selection updates presentation and preferred frame/camera; Setup prepares the experiment and Station Frame intentionally replays emissions and pauses at 0.12 μs; entering Light Reception continues from that moment. Later stages preserve the timeline. All stages are available directly.

Explore Mode exposes events, light paths, coordinate readouts, axes, and observer clock toggles. Velocity, frame, camera, playback, and scrubbing remain accessible. Reduced-motion preferences disable camera and frame easing.

## Architecture

- `src/physics/model.ts`: pure Lorentz transforms, event records, reception intersections, timeline bounds, frame slices.
- `src/hooks/useSimulationClock.ts`: explicit station-time anchor, fixed 1/120-second playback steps, pause/reset/scrub.
- `src/stages/stages.ts`: centralized educational content and presentation settings.
- `src/components/RelativityScene.tsx`: persistent renderer and train, eased frame positions and camera poses.
- `src/components/SpacetimeDiagram.tsx`: equal-scale x–ct diagram with mathematically derived primed axes.
- `src/components/PhysicsPanel.tsx`: stage-specific formulas and live emission coordinates.
- `src/App.tsx`, `src/styles.css`: controls, three-column layout, responsive learning flow.

## Physics and frame switching

Units are meters and microseconds, with c = 299.792458 m/μs. Station emissions are A = (−150 m, 0 μs), B = (+150 m, 0 μs). β ranges from 0 to 0.90, default 0.50. The train moves in +x.

γ = 1/√(1−β²), x′ = γ(x−βct), t′ = γ(t−βx/c).

The simulation clock identifies an event on the train midpoint worldline using station time T. In S its position is βcT; in S′ it is zero and its time is T/γ. Frame switching preserves T and playback state. Each frame samples its own simultaneous slice through this same anchor. It is impossible to preserve an entire spatial snapshot as simultaneous in both frames. Camera orientation is an independent visual setting.

Detailed derivations and schematic limitations are in [PHYSICS.md](PHYSICS.md). Tests cover transformations, inverse round trips, invariant intervals, sign and symmetry, signal speed and reception intersections, anchor continuity, axes, β = 0, 0.5, 0.8, and 0.9.
