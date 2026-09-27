# Reference-video inspection and reconstruction

Source: user's local `相对论很烧脑？不存在的！.mp4`, 185.16 seconds, 1920×1080 at 30 fps. Inspected again on 2026-09-27, using 2-second decoded frames and embedded subtitles over 26–82 and 90–180 seconds. Detailed contact sheets are in `video-reference/detailed/`.

Observed sequence:

- 26–32 s: contrast a contracted train fitting in the station frame with the apparent gate/train intersection in the train frame.
- 34–42 s: introduce two switches, one upstream and one at the tunnel centre. The arriving train activates the upstream switch; its light reaches the central switch.
- 44–48 s: central switch emits in all directions. This second pulse triggers the gates; they fall below the track.
- 68–76 s: station-frame explanation: equal distances and constant c imply simultaneous reception and safe simultaneous drops.
- 82–116 s: train-frame explanation: the world contracts and moves left. The emitting switch moves away from the fixed centre of its expanding wave. The first pulse reaches the central switch.
- 118–146 s: central switch emits; exit B approaches the wave, entrance A recedes. B drops and clears first; A drops later after the rear has passed it.

Implemented this causal and teaching sequence with original procedural 3D geometry. The previous V2 model of light emitted by already-closing gates has been replaced. The gate now follows continuous guide travel below the track, with receiver illumination and shared-clock slow motion.

Quantitative calibration: the source is a qualitative illustration. With this simulator's 300 m / 200 m lengths, S1 is triggered at the train midpoint and placed at −βD/(1−β) to centre the train at station-frame gate reception. This is explicitly documented in the lesson and PHYSICS.md. Artwork, branding and video pixels are not embedded in the simulator.
