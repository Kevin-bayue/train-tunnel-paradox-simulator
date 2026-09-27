# Stage 2 causal explanation and inertial-frame rendering — 2026-09-27

- Exactly three stages; persistent Canvas retained. Stage 2↔3 now preserves anchor time, beta and playback state.
- Stage 2 has a dedicated StationDerivation card: gamma, train contraction/fit, equal S2 paths and explicit propagation durations, then tA=tB=0 and Δt=0. Train-frame comparison table removed from this stage. Low-speed takeaway no longer claims a safe fit. Teaser and bilingual observation prompt added.
- Clarifies that S2 emits before full containment, timed so the gates receive simultaneously at t=0.
- Fixed camera framing replaces time-varying bounding-box tracking. Train stays at x′=0; tunnel/gates/sensors/labels share translated station geometry. Track ties loop continuously with contracted x-spacing.
- 650 ms smoothstep frame transitions interpolate lengths/positions/gate travel; intermediate frames are presentation only. Source event coordinates remain canonical S events.
- Normal train-frame playback rate now compensates T=γt′, so increasing beta increases visible environmental speed.
- Stage 3 retains explicit A/B substitution and adds the general Δt′ transformation summary.

## Verification

- 62 current tests + 31 archived tests pass. Production build passes (existing bundle-size advisory).
- Browser .8: Stage 2 180m/200m, 100m equal paths, .334μs propagation, A=B=50% at drop midpoint.
- Stage 2→3 preserved T=.009μs and world ID. Frame switch sampled intermediate blend .686 then settled 0, same world ID; no reset/remount.
- Train frame: x′train=0 across playback; tunnel/track offset decreased 103.069→97.367m; B=50% with A=0%, A=50% with B=100%.
- β=0: train300m/tunnel200m, no motion, disabled safe drops, simultaneous event times. β=.9: tunnel87.178m and event times ±.689μs.
- Camera selection preserved event anchor. Chinese/English switch verified. No console errors/warnings. Stage 3 equations have no horizontal overflow at desktop card width.

## Limitations

- Fixed local view can leave distant S1/approaching infrastructure offscreen at high beta.
- Gate height and wheel diameter remain schematic; gates drop below track rather than reopening.
- The sidebar shows the selected frame immediately; 3D uses a short presentation transition.
