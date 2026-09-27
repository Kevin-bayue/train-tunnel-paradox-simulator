# Stage 3 derivation and playback — 2026-09-27

- Screenshot supplied by user shows Play (paused), not proof of a rendering freeze. Timeline changes previously explicitly paused playback. Scrubbing now preserves playing/paused state; event inspection still intentionally pauses.
- Clock seeks publish the internal ref synchronously, so replay/seek cannot be overwritten by a queued animation frame using the old time. Removed render-time ref overwrite.
- Slow motion now ends with actual drop duration; pre-roll is bounded to 10% of duration / 0.002 μs instead of a fixed 0.012 μs on both sides. Explicit paused status is shown.
- Stage 3 derives station event coordinates → Lorentz time transform → A substitution → B substitution → comparison → signed B−A difference. Calculated zero-speed conclusion, bilingual content, timeline, supplementary event table and adaptive spacetime projections. Previous formula reference is expandable.
- Derivation reads doorEvents and transformSpaceTime, the same canonical events/transforms used by eventAnchor and gateProgress. No changed Lorentz physics or gate geometry.

## Verification

- `npm test`: 53 current + 31 archived tests pass, including dynamic KaTeX rendering, β=0/.5/.8/.9, canonical coordinates and clock progression across both gate events at .746/.8/.9.
- `npm run build`: passes; existing bundle size advisory remains.
- Browser β=0: A=B=0, simultaneous conclusion; .5: ±.193 μs; .8: ±.445 μs; .9: ±.689 μs. Same world ID across parameter/language/frame changes.
- Browser at .8 train frame: inspect B → A=0%, B=50%; inspect A → A=50%, B=100%. Station frame: A=B=50%. Resume reaches A=B=100% and timeline end. Replay from end restarts; keyboard timeline change while playing retains Pause button.
- At 1280px viewport, all derivation equations fit 268px card width without horizontal overflow; A/B substitutions and spacetime projections visually checked.
- Hook signature change caused a transient Vite hot-reload error during editing. Reloaded final app; no subsequent console errors observed.
- Screenshot: stage3-event-derivation.png.
