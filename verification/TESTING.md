# Verification — 2026-09-26

- TypeScript check and Vite production build pass.
- 20 new pure-physics tests pass; 31 archived original physics tests pass.
- Browser: all six stages, Next, Previous, direct selection, Learn/Explore, keyboard velocity changes (0, 0.5, 0.8), frame switching while playing and paused, camera presets, visualization toggles, and responsive desktop/390 px phone layout exercised.
- World UUID remained identical through all six stages (923a2417-f472-474d-94b9-f7e0e4eda81e in the continuity run).
- Paused switch: S anchor remained −1.130 μs. Playing switch: −1.206 → −1.142 μs, playback stayed active.
- β=0: Δt′=0; β=0.5: ±0.289 μs / gap −0.578 μs; β=0.8: ±0.667 μs / gap −1.334 μs.
- Explore toggles removed readouts, diagram and clock overlays and restored them successfully.
- Phone viewport width and document scroll width both 390 px: no horizontal page overflow.
- Production dependency audit: zero reported vulnerabilities. Vitest updated to patched 4.1.11.
- Remaining build advisory: Three.js makes the minified entry about 1.13 MB (316 KB gzip). This is a bundle-size advisory, not a compilation failure.

The original page had no React/Vite project to preserve. Its unchanged HTML and README are in legacy/; the shared Lorentz conventions were retained and the current app refactored in the same directory.

Final clean browser run: no warnings/errors. Station Frame paused exactly at 0.120 μs; Next continued Light Reception at 0.176 μs. Final desktop screenshot: desktop.png.
