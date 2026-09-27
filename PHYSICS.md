# Sensor-controlled train–tunnel experiment

The model uses metres and microseconds, with c = 299.792458 m/μs. Station S is the canonical frame; the train moves right with v = βc. Proper lengths: train 300 m, tunnel 200 m. Train midpoint x = vt. Gates A and B are fixed at x = −100 m and +100 m.

## Reference-video circuit

1. A detector at the train midpoint activates upstream sensor S1.
2. S1 emits an isotropic blue light pulse.
3. The pulse reaches central sensor S2 at x = 0. S2 immediately emits an isotropic gold pulse.
4. Each gate starts dropping only when the gold pulse reaches its receiver.
5. The gate continues through a guide slot below the track; it does not remain closed or rise back up.

The video gives a qualitative circuit, not measured lengths or an exact detector mounting position. We calibrate S1 to the train midpoint so this circuit works with the requested 300 m / 200 m lengths. Its station position changes when β changes, defining a new experiment. A physically compatible upstream placement exists for the demonstrated fit regime.

## Canonical events

Let D = 100 m. The relay event is S2 = (0, −D/c). The upstream position is x₁ = −βD/(1−β) for positive β. S1 = (x₁, −D/c + x₁/c). Consequently x₁ = v t₁: the train midpoint passes S1 exactly when it emits. The blue pulse follows x = x₁ + c(t−t₁) and reaches S2. Gold travels from S2 to the two stationary gates over equal D distances. Both gate reception events therefore have t = 0.

At β = 0.8:

- S1: x = −400 m, t = −1.667820476 μs.
- S2: x = 0 m, t = −0.333564095 μs.
- A receives: x = −100 m, t = 0.
- B receives: x = +100 m, t = 0.
- Contracted train: 180 m in S. Contracted tunnel: 120 m in S′.

## Train frame

Every event uses x′ = γ(x−vt), t′ = γ(t−vx/c²). The displayed train time is t′ = T/γ, where T is the station time of the train-midpoint anchor. Station landmarks at X have x′ = X/γ−vt′. Frame switching preserves T and playback state.

Each light wave has a fixed emission centre in the selected inertial frame and radius c(t_frame−t_emit). The sensor continues moving after emission. It does not carry the wave centre with it. Decorative sensor and receiver height is the same; transverse dimensions of the mechanism are schematic.

At the S2 emission slice, the two gates are initially D/γ from S2. B approaches the right-going wave, so reception takes (D/γ)/(c+v). A recedes from the left-going wave, so reception takes (D/γ)/(c−v). At β = 0.8, t′B = −0.444752127 μs and t′A = +0.444752127 μs. The circuit is causal in both frames; the spatially separated receptions are simultaneous only in S.

## Continuous gate drop and safety

Drop duration in S is min(0.018 μs, (200−300/γ)/(4|v|)). This places the complete motion inside the clearance window. Local progress is clamped from 0 to 1 between reception and the below-track event. The moving gate's train-frame duration is γ times its station duration. A smooth cubic profile maps progress to the vertical guide travel. Gate height is exaggerated for readability, not a metric model of the motor or gate material.

The whole simulation clock slows around gate travel (roughly 2.2 real seconds for a complete drop). The train, tunnel, sensors, waves and gates share that slowed coordinate time. No independent gate timer or frame-rate lag is used, so pause, reset and backward scrubbing are deterministic.

Tests sample each gate's complete descent in both frames and verify that its longitudinal position stays outside the train. Below β = sqrt(1−(200/300)^2) ≈ 0.7453559925, the safe sequence is disabled. At the exact threshold there is no finite clearance window, so no finite gate motion is rendered; the UI identifies the zero-duration ideal limit.

## Stage 1 is an explicitly labelled hypothesis

The upper 3D row shows the contracted train inside the station's longer tunnel. The lower row shows the proper-length train and contracted tunnel, with red crosses marking the mistaken assumption of simultaneous drops in the train frame. It is not a second physical event schedule. Stages 2–6 resolve that assumption using the actual sensor circuit.

## Three-stage animated introduction (current revision)

The six-section lesson has been condensed into misconception / station explanation / train resolution. The introduction has its own 12-second pedagogical playhead, distinct from coordinate time. Its upper row maps that playhead to station coordinate time: approach before t=0; a two-second visual traversal of the physical gate-drop interval; then safe departure. The lower row deliberately assigns the same gate progress in the train frame and freezes at predicted impact. The UI explicitly identifies that row as a false timing assumption. Right-column coordinate parameters in the introduction refer only to the upper, physical station-frame row.

For stages 2 and 3 the original common coordinate clock remains authoritative. Language changes do not replace or reset either clock or the Canvas. The right panel's x or x′, t or t′ and measured lengths follow the currently selected frame. Gate reception tables always distinguish station t from train t′. In the formulas, Δt′A and Δt′B denote travel intervals measured from S2 emission, not absolute reception timestamps. KaTeX renders the stored LaTeX locally, with no external font or math CDN.
