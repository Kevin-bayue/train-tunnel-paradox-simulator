# Model conventions and verification

## Events, signs and units

Station coordinates S are canonical. Distances use meters; times use microseconds; c = 299.792458 m/μs. The train midpoint crosses station x = 0 at t = 0 and moves in positive x with v = βc. A emits at (−150,0), B at (+150,0). These station-fixed event coordinates do not depend on β. They need not coincide with the schematic train’s geometric ends.

The original lab’s Lorentz formulas, units, and event-based approach were retained. Its velocity-dependent endpoint separation was intentionally replaced by fixed station emission positions to match this experiment.

## Transformations

γ = 1/√(1−β²)

x′ = γ(x−βct), t′ = γ(t−βx/c)

x = γ(x′+βct′), t = γ(t′+βx′/c)

Only station coordinates are stored; train values are derived. For d = 150 m:

t′A = +γβd/c; t′B = −γβd/c; Δt′ = t′B−t′A = −2γβd/c.

For β > 0, B has the earlier train emission time. Ordering text is calculated from the gap. For β = 0, γ = 1 and both frames agree. At β = 0.5, t′A ≈ +0.288875 μs and t′B ≈ −0.288875 μs.

## Emission versus reception

The inward signals in S follow xA(t) = −d+ct and xB(t) = d−ct. Intersecting with train midpoint x = βct gives reception times:

TA = d/[c(1−β)]; TB = d/[c(1+β)].

These are **new events**, separate from A and B. Their primed positions are zero and primed times are T/γ. Arrival order alone does not determine emission order; emission coordinate times require synchronized clocks / Lorentz assignment. In the scene, circles mark emissions and diamonds mark receptions. Pulses continue after reception, representing signals propagating beyond the observer.

In either frame, a ray emitted at (xe,te) follows x = xe ± c(t−te). The scene renders the inward 1D rays, not full spherical wavefronts. Rings identify the moving pulses; their radius is illustrative, not a spherical radius measurement. Lightning is held visible for 0.16 μs for legibility.

## Frame switching and timeline

T is the canonical station time of an anchor event on the train midpoint worldline. A frame switch does not change T, velocity, playback state, or event identity. Frame time is T in S and T/γ in S′. Station scenery at coordinate X follows X/γ − βc(T/γ) in S′, while the train midpoint stays at zero. In S the station is stationary and the midpoint is βcT.

A new frame selects a new simultaneity slice through the anchor. This is distinct from transforming every point of a station-time snapshot, whose primed times would differ. Scene positions and the camera ease into the new slice; intermediate blended positions are a UI transition, not a third inertial frame. Pause for exact settled inspection. Clock ticks are fixed 1/120-second playback increments, with 0.24 μs of station-anchor time per playback second; long inactive-tab gaps are capped to prevent surprise jumps. Scrubbing is deterministic.

Changing β defines a new constant-velocity experiment immediately, preserving T. It does not model physical acceleration. Setup and Station Frame stages intentionally prepare/replay the timeline; all later stage transitions preserve T. Explicit Reset pauses and selects a pre-emission anchor early enough to include both flashes in either frame: Tstart = min(−0.25, −γ²βd/c − 0.15) μs.

## Spacetime diagram

The horizontal axis is x; vertical is ct, both in meters with equal SVG scale. Therefore light lines have slopes ±1 (45 degrees). The x′ axis satisfies t′ = 0, so ct = βx. The ct′ axis satisfies x′ = 0, so x = βct. At β = 0 primed and unprimed axes overlap. Primed axes are oblique Lorentz coordinates, not a Euclidean rotation. Projections to ct′ run parallel to x′. The station’s t = 0 and train’s t′ = 0 lines are simultaneity guides, not material surfaces.

The compact diagram clips long worldlines at high β to preserve useful scale. Its lines show event relations, not an animated camera view.

## Representation limits

The train is a fixed-size schematic glyph, with visible midpoint and front, not a ruler or a relativistic photograph. No decorative length contraction, retarded optical image, acceleration, or Terrell rotation is simulated. Transverse sizes are exaggerated for clarity. Station track/platform is a contextual backdrop; physical calculations use canonical point coordinates. The 3D labels identify persistent emission **events**, not moving station-mounted signs; their coordinates remain fixed in the selected frame. Clocks and readouts state their coordinate or proper-time meaning explicitly.
