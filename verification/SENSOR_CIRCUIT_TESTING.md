# Sensor circuit revision — verified 2026-09-27

## Video and lesson

Re-inspected the supplied local video using 2-second frame/caption sequences. See VIDEO_REFERENCE.md. Stage 1 now contains two labelled 3D states; stages 2–6 follow upstream sensor → central relay → light reception → gate drop, first in station S and then train S′.

## Automated validation

- Production build: passed, including TypeScript.
- Current model: 40/40 tests passed.
- Preserved standalone model: 31/31 tests passed.
- New tests cover the midpoint trigger calibration, both null signal legs in both frames, the complete safe gate descent sampled at 101 points per gate/frame for β = .75, .8, .9 and .95, timeline coverage, below-threshold suppression, and reversible continuous travel.
- Vite retains a size advisory (main bundle 1,143.00 kB, 320.49 kB gzip).

## Browser evidence

- Stage 1: both station and train 3D arrangements visible, with the lower simultaneous-drop assumption explicitly marked as hypothetical.
- Stage 2: playback automatically pauses at S2 reception, S anchor −0.334 μs.
- Stage 4: pauses at the same transformed S2 event, S anchor −0.927 μs.
- Stage 3: automatic midpoint hold at S anchor +0.009 μs; both gate progresses exactly 0.5.
- Resuming Stage 3: both progresses sampled at 0.609848, demonstrating continuous movement rather than a boolean jump.
- Train frame B mid-drop: anchor −0.716 μs, A progress 0 and B progress 0.5.
- Train frame A mid-drop: anchor +0.766 μs, A progress 0.5 and B progress 1 (below track).
- Pause/frame switch preserves anchor +0.766 μs exactly. Running switch advances −1.759 → −1.691 μs and remains playing.
- Reset restores both progress values to 0.
- World identity remained `72c9a091-7717-4e45-b673-9885b9c3f093` through tested stage/frame transitions.
- β = .5 disables Play and holds both gates at 0. Exact-threshold UI reports zero-duration ideal limit, without a finite drop.
- 390 x 844 layout: scroll width 390 px; both comparison scenes inspected. Viewport override reset afterward.
- Final browser warning/error log empty.

## Screenshots

- sensor-paradox-desktop.png
- sensor-paradox-mobile.png
- sensor-station-drop.png
- sensor-train-exit.png

The mechanism's vertical dimensions are schematic. Quantitative S1 calibration is documented in PHYSICS.md. Gates fall through slots below the track as in the video; no independent wall-clock gate animation or invented train-frame event schedule is used. Older V2 screenshots and V2_TESTING.md document the superseded model, not this revision.
