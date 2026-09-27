# Relativity Lab / 相对论实验室

Open `index.html` directly in a modern browser. The simulator is a single, self-contained HTML file with inline CSS, JavaScript and SVG. It needs no installation, server, libraries, fonts, images, API or internet connection. Only the language preference is stored locally, when browser storage is available.

## Presentation

- English / 中文 buttons at the upper right translate all three experiments, explanations, diagram labels, controls and event records. Language switching preserves the running simulation.
- Length contraction uses a rotatable spacecraft mesh. The solid model has the selected frame's longitudinal extent; the wire reference has the 300 m proper length. Width and height do not contract. Endpoint records are automatic: no measurement tasks or quizzes.
- Three length views explain the proper length on board, the contracted station-frame length, and the different simultaneity slices.
- Simultaneity shows the same two emission events, two sections of each spherical wavefront, and reception at both observers. Chronological event buttons allow exact-time navigation. Click A or B to inspect its coordinates.
- Time dilation preserves the two synchronized photon-event views. At β = 0.8, the full paths are 120 m and 200 m; the intervals are 0.4003 μs and 0.6671 μs. Simultaneous screen completion is explicitly labeled as shared event progress, not equal coordinate-time playback.
- Drag the spatial model, use the Orbit/Tilt sliders, or choose Side view. These are orthographic 3D coordinate visualizations, not optical photographs.
- All experiments have Play, Pause, Reset, a scrub timeline and 0.5× / 1× / 2× / 4× playback. Frame and velocity changes reset and pause. Hiding the browser tab pauses playback.

## Physics

Units: meters and microseconds. `c = 299.792458 m/μs`, `L₀ = 300 m`, and light-clock mirror separation `d = 60 m`.

The ship moves along +x relative to the station. Their origins coincide at `t = t′ = 0`. The original pure Lorentz, light-clock, length and reception calculations are retained.

```
γ = 1 / sqrt(1 − β²)
x′ = γ(x − vt)       t′ = γ(t − vx/c²)
x  = γ(x′ + vt′)     t  = γ(t′ + vx′/c²)
L = L₀ / γ
```

The flashes occur at station `t = 0`, `x = ±L/2`, using contracted length L. At β = 0.8 these are ±90 m. Their ship coordinates are ±150 m at different times (A: +0.4002769 μs, B: −0.4002769 μs). They are not a simultaneous ship-frame length measurement.

The spatial renderer applies longitudinal contraction to mesh vertices. Its camera only projects geometry; it does not modify physics. Wavefront radii are `c × (current coordinate time − emission coordinate time)`. Reception events come from intersections with observer worldlines. Illustrative labels are offset from physical x positions.

The side plot is x–ct in station coordinates with equal scales. For the transverse light clock, y motion is omitted in this projection. The length plot compares distinct constant-time event pairs. It must not be read as a Euclidean ruler on the slanted primed axis.

## Validation performed — 2026-09-26

- `runPhysicsTests()` remains available in the browser console; 31/31 tests passed in both Node VM and browser startup validation.
- 120 spatial rendering combinations (both languages, both spatial experiments, β = 0 / 0.8 / 0.95, both frames, five timeline positions) produced no non-finite coordinates.
- Static resource audit: exactly one inline script and one inline stylesheet, with no external resource references.
- Browser checks used a loopback-only preview of this exact HTML: all experiment tabs; velocity changes; both frames; Play/Pause/Reset; timeline seeking; event milestones; A/B inspection; camera sliders and side/reset view; Chinese/English switching while paused and while playing; language preference after reload; 4× playback selection.
- Light-clock return readouts verified: 0.4003 μs / 120 m on board and 0.6671 μs / 200 m at the station for β = 0.8.
- Desktop (1366 × 1000) and tablet (820 × 1180) layouts inspected. Tablet layout stacks the main simulation above its diagram. No horizontal document overflow at the tablet size.
- Browser console had no captured errors or warnings during these checks.

Not verified in this revision: direct `file://` automation, reload with the computer disconnected from the network, separate Chrome/Safari/Edge runs, or browser-tab hiding behavior. The preview server is a development verification aid only and is not a runtime dependency of the delivered file.
