# Relativity Lab — Three-stage train–tunnel lesson

React / TypeScript / Three.js simulator, with a persistent 3D world, Chinese/English switching and locally bundled KaTeX equations. The neutral black/gray interface follows the live MHD simulator reference; the 3D train, tunnel and signal colors are retained.

## Run

```sh
npm install
npm run dev
```

Open http://127.0.0.1:5173/. `npm run build` creates production assets; `npm test` validates the physical model, introduction animation and LaTeX syntax, plus the archived standalone model.

## Three stages

1. **The apparent paradox:** a 12-second animated comparison. Above, the contracted train passes through the station tunnel safely. Below, deliberately assuming simultaneous drops in the train frame produces a predicted collision and freezes there. This counterfactual is explicitly labelled, not presented as real physics. Replay, pause and scrub are available. Reduced-motion users start paused.
2. **Station: simultaneous drops:** the full S1 → S2 → gates signal chain plays in one continuous scene. Equal paths produce simultaneous reception; gates clear below the track.
3. **Train: different drop times:** the same circuit runs in the train frame. Exit B approaches the light and drops first; entrance A recedes and drops later. The Lorentz time transform explains the resolution.

The right column updates beta, gamma, relative speed, coordinate time, measured lengths, positions, gate progress and signal radii. LaTeX formulas cover length contraction, the Lorentz transformation and signal travel/reception times. Chinese/English switching includes controls, explanations, 3D labels and the diagram without resetting world identity, parameters or playback.

Explore adds exact beta, fit-threshold selection and visualization toggles. Frame switching preserves the train-midpoint anchor T. Camera changes are independent. All physical objects share one coordinate-time clock, slowed together around gate travel. Gate height is schematic; longitudinal positions and event times follow the model. At the exact threshold a finite gate drop is impossible.

See PHYSICS.md for the sensor calibration, transformation and safety model; verification/THREE_STAGE_TESTING.md for this revision. Older verification files document superseded versions. The original single-file simulator is preserved in legacy/relativity-lab.html.

## GitHub Pages

The app starts in English; use 中文 / EN to switch languages without resetting the simulation.

The GitHub Actions workflow `.github/workflows/deploy.yml` tests and builds the app on every push to `main`, then publishes only `dist/` to GitHub Pages. Set the repository's **Settings → Pages → Source** to **GitHub Actions**. Vite uses relative asset URLs so the simulator works under a repository URL without a custom domain. Node.js 22 and `npm ci` reproduce the locked dependencies.
