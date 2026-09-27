# Train–Tunnel V2 verification

Verified 2026-09-27 against http://127.0.0.1:5173/.

## Automated checks

- `npm run build`: passed (TypeScript and Vite production build).
- `npm test`: 34/34 V2 physics tests and 31/31 preserved standalone-model tests passed.
- Vite reports a bundle-size advisory: main JavaScript 1,134.11 kB, 317.36 kB gzip.

## Browser checks

- Six stages, direct stage navigation and Previous/Next verified.
- At beta 0, 0.5 and 0.745 the train does not fit. Exact threshold shows Just fits. At 0.8 and 0.9 it fits.
- Below the threshold, closure playback is disabled and shutter state is Blocked.
- At beta 0.8, tunnel-frame lengths are 180 m / 200 m; train-frame lengths are 300 m / 120 m.
- Stage 3 playback holds at S anchor 0.000 microseconds with both doors CLOSED.
- Train-frame B inspection shows B CLOSED and A awaiting, anchor -0.741 microseconds. A inspection shows A CLOSED and B reopened.
- Closure times in the train frame are +0.445 and -0.445 microseconds, difference -0.890 microseconds.
- Frame switching during playback advanced the anchor from -0.963 to -0.929 microseconds and retained Pause (playing).
- Paused frame switching preserved the anchor exactly at -0.925 microseconds.
- Persistent world identity verified across stage/frame changes in the earlier V2 browser pass.
- All five Explore visualization controls exercised; coordinate records and spacetime axes hide and restore. Light signals also enable shutter animation so emission has a visible source even when event annotations are hidden.
- Overview, Side and Center camera selections exercised; timeline keyboard scrub changes the anchor and Reset returns to the replay start.
- Responsive layouts tested at 390 x 844 and 768 x 1024: document scroll width equals viewport width. Mobile scene inspected after camera easing settled.
- Browser warning/error log empty during final checks.

## Evidence

- `train-tunnel-both-closed.png`: final Learn stage 3, both shutters closed in tunnel frame.
- `train-tunnel-desktop.png`: Explore train-frame B closure.
- `train-tunnel-mobile.png`: 390 px train-frame scene.
- `VIDEO_REFERENCE.md`: local reference-video inspection and adopted teaching ideas.

## Limits

This is a schematic coordinate-frame simulation, not an optical photograph. Shutters are idealized; collision dynamics and material deformation are not modeled. High-beta spacetime intercepts can extend outside the fixed diagram range. Validation used the local Vite app; the archived standalone HTML is a separate deliverable. Git status was unavailable because the system Git requires acceptance of an Xcode license; no license was accepted.
