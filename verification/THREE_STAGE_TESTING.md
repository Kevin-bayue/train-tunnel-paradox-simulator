# Three-stage bilingual revision — 2026-09-27

## Scope

Condensed the six-stage sensor lesson to three: animated misconception, full station-frame circuit, full train-frame resolution. Added an independently pausable 12-second introduction, bilingual UI and 3D labels, KaTeX formulas, and a live parameter column. Interface palette checked against the live MHD simulator at https://kevin-bayue.github.io/mhd-blood-flow-simulator/. Per the user's follow-up, original 3D colors were restored; only interface chrome is neutral black/gray/white.

## Verification

- `npm run build`: passed. KaTeX and fonts bundled locally. Main JS gzip 402.43 kB; Vite size advisory remains.
- `npm test`: 45 current tests passed, including complete safe gate travel, intro clearance and false-schedule freeze, and parsing every stage's LaTeX. Archived model: 31/31 passed.
- Stage 1 automatically animates; at 5.4 s the upper gates are at 70%, station time 0.0126 μs and train midpoint x = 3.02 m. Lower hypothesis freezes at predicted impact while the upper train continues.
- Paused language switch preserved intro playhead 5.4 s, live time 0.0126 μs and Canvas world ID `b12c7d02-66fb-43a4-b2b0-bf58af230360` exactly.
- Running language switch advanced 5.6 → 5.9 s and retained Pause, confirming uninterrupted playback.
- At beta .9 in train frame, live gamma = 2.2942, relative speed = 269.81 m/μs and tunnel length = 87.2 m. Chinese switch preserved beta .9 and anchor −0.716 μs.
- Stage 2 mid-drop: both gate progress values .5; live t = 0.0090 μs. Stage 3 B mid-drop: A waiting, B dropping; live t′ = −0.4298 μs.
- No KaTeX error nodes. Browser warning/error log empty.
- 390 x 844 viewport: document width and scroll width both 390 px; animated comparison visually inspected. Viewport override reset.

## Images

- three-stage-desktop-zh.png: Chinese opening, original 3D palette with neutral interface.
- three-stage-mobile.png: mobile opening.
- three-stage-station-en.png: English station frame, gate progress, live parameters and rendered formulas.

The intro's lower timing is a labelled counterfactual, not a real Lorentz-transformed gate schedule. Right-side intro coordinate parameters describe only its upper physical station-frame row. Gate height remains schematic. Older six-stage documents/screenshots are historical.
