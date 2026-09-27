import { useLanguage, sceneLabel } from "../i18n";
import { introSnapshot } from "../physics/intro";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import {
  C,
  frameGeometry,
  trackPhase,
  TRAIN_PROPER_LENGTH,
  TUNNEL_PROPER_LENGTH,
  doorEvents,
  frameTime,
  transformSpaceTime,
  getTrainLength,
  getTunnelLength,
  lorentzGamma,
  trainFitsInTunnel,
  fmt,
  sensorEvents,
  gateProgress,
} from "../physics/model";
import type { Frame } from "../physics/model";
import type { CameraView } from "../stages/stages";
export type SceneProps = {
  beta: number;
  time: number;
  frame: Frame;
  camera: CameraView;
  events: boolean;
  signals: boolean;
  lengths: boolean;
  paradox?: boolean;
  introTime?: number;
};
const SCALE = 0.025;
function Box({
  position,
  size,
  color,
}: {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.65} />
    </mesh>
  );
}
function Label({
  text,
  position,
  color = "#dbe5e5",
}: {
  text: string;
  position: [number, number, number];
  color?: string;
}) {
  const { language } = useLanguage();
  const label = sceneLabel(text, language);
  const texture = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 96;
    const ctx = c.getContext("2d")!;
    ctx.font = "600 34px system-ui";
    ctx.textAlign = "center";
    ctx.strokeStyle = "#171717";
    ctx.lineWidth = 5;
    ctx.strokeText(label, 256, 56);
    ctx.fillStyle = color;
    ctx.fillText(label, 256, 56);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [label, color]);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <sprite position={position} scale={[4, 0.75, 1]}>
      <spriteMaterial map={texture} transparent depthTest={false} />
    </sprite>
  );
}
function Train({ contraction }: { contraction: number }) {
  return (
    <group name="persistent-train">
      <group scale={[contraction, 1, 1]}>
        <Box position={[0, 0.31, 0]} size={[7.5, 0.22, 1.05]} color="#648d95" />
        {[-2.5, 0, 2.5].map((x) => (
          <group key={x} position={[x, 0, 0]}>
            <Box
              position={[0, 0.73, 0]}
              size={[2.42, 0.7, 1]}
              color="#a6c4c5"
            />
            <Box
              position={[0, 1.12, 0]}
              size={[2.42, 0.12, 1.04]}
              color="#dae1db"
            />
            {[-0.85, -0.28, 0.28, 0.85].flatMap((w) =>
              [-0.506, 0.506].map((z) => (
                <Box
                  key={`${w}-${z}`}
                  position={[w, 0.85, z]}
                  size={[0.38, 0.28, 0.02]}
                  color="#25454f"
                />
              )),
            )}
            {[-0.82, 0.82].flatMap((w) =>
              [-0.53, 0.53].map((z) => (
                <group
                  key={`${w}-${z}`}
                  position={[w, 0.2, z]}
                  scale={[1 / contraction, 1, 1]}
                >
                  <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.18, 0.18, 0.13, 20]} />
                    <meshStandardMaterial color="#1c252a" />
                  </mesh>
                </group>
              )),
            )}
          </group>
        ))}
        <Box
          position={[3.69, 0.77, 0]}
          size={[0.12, 0.64, 0.98]}
          color="#8bb9b8"
        />
      </group>
      <Label text="REAR" position={[-3.75 * contraction, 1.45, 0.8]} />
      <Label text="FRONT →" position={[3.75 * contraction, 1.45, 0.8]} />
      <mesh position={[0, 1.32, 0]}>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshBasicMaterial color="#efd49d" />
      </mesh>
    </group>
  );
}
function Gate({
  progress,
  index,
  hypothetical = false,
  received = progress > 0,
}: {
  progress: number;
  index: number;
  hypothetical?: boolean;
  received?: boolean;
}) {
  const color = hypothetical ? "#f07170" : index ? "#e8bc72" : "#8bcfe3";
  const eased = progress * progress * (3 - 2 * progress);
  return (
    <group name={`gate-${index ? "B" : "A"}`}>
      {[-1.22, 1.22].map((z) => (
        <group key={z}>
          <Box position={[0, 1, z]} size={[0.16, 6, 0.15]} color="#3e5458" />
          <Box position={[0.08, 1, z]} size={[0.025, 6, 0.055]} color={color} />
          <Box
            position={[0, -0.2, z]}
            size={[0.4, 0.18, 0.42]}
            color="#60757b"
          />
        </group>
      ))}
      <Box position={[0, 4, 0]} size={[0.35, 0.27, 2.7]} color="#344c55" />
      <group position={[0, 3.12 - eased * 4.4, 0]}>
        {[-1, -0.66, -0.33, 0, 0.33, 0.66, 1].map((z) => (
          <Box
            key={z}
            position={[0, 0, z]}
            size={[0.075, 1.85, 0.065]}
            color={color}
          />
        ))}
        {[-0.9, 0, 0.9].map((y) => (
          <Box
            key={y}
            position={[0, y, 0]}
            size={[0.12, 0.11, 2.2]}
            color={color}
          />
        ))}
        {[-1.1, 1.1].map((z) => (
          <Box
            key={z}
            position={[0, 0, z]}
            size={[0.17, 1.92, 0.12]}
            color="#bdd1cd"
          />
        ))}
      </group>
      <mesh position={[0, 0.85, 1.45]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial
          color={received ? "#ffdc79" : "#45616b"}
          emissive={received ? "#ffbc39" : "#123039"}
          emissiveIntensity={received ? 2 : 0.2}
        />
      </mesh>
      <Label
        text={`${index ? "B · EXIT" : "A · ENTRANCE"}`}
        position={[0, 4.45, 0]}
        color={color}
      />
    </group>
  );
}
function Tunnel({
  contraction,
  progress,
  hypothetical = false,
  received,
}: {
  contraction: number;
  progress: [number, number];
  hypothetical?: boolean;
  received?: [boolean, boolean];
}) {
  const half = 2.5 * contraction;
  return (
    <group name="persistent-tunnel">
      <Box
        position={[0, -0.2, 0]}
        size={[Math.max(0.1, 5 * contraction - 0.28), 0.3, 2.6]}
        color="#3e5458"
      />
      <mesh position={[0, 2, 0]}>
        <boxGeometry args={[5 * contraction, 0.12, 2.6]} />
        <meshStandardMaterial
          color="#6a9ea5"
          transparent
          opacity={0.2}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, 1, -1.23]}>
        <boxGeometry args={[5 * contraction, 2, 0.08]} />
        <meshStandardMaterial
          color="#526e73"
          transparent
          opacity={0.27}
          depthWrite={false}
        />
      </mesh>
      {[-1, 1].map((sign, i) => (
        <group key={sign} position={[sign * half, 0, 0]}>
          <Gate
            index={i}
            progress={progress[i]}
            hypothetical={hypothetical}
            received={received?.[i]}
          />
        </group>
      ))}
    </group>
  );
}
function Sensor({ x, id, active }: { x: number; id: string; active: boolean }) {
  return (
    <group position={[x, 0, 1.45]}>
      <Box position={[0, 0.32, 0]} size={[0.09, 0.75, 0.09]} color="#62838d" />
      <mesh position={[0, 0.85, 0]}>
        <boxGeometry args={[0.22, 0.22, 0.22]} />
        <meshStandardMaterial
          color={active ? "#fff3ad" : "#72c5e5"}
          emissive={active ? "#ffc34d" : "#1672a5"}
          emissiveIntensity={active ? 1.7 : 0.4}
        />
      </mesh>
      <Label
        text={id === "S1" ? "S1 · TRIGGER" : "S2 · RELAY"}
        position={[0, -0.6, 1]}
        color={id === "S1" ? "#8dcfff" : "#93dfbf"}
      />
    </group>
  );
}
function Track({
  offset = 0,
  contraction = 1,
}: {
  offset?: number;
  contraction?: number;
}) {
  // Rails/ballast cover the view permanently. Only the periodic ties move:
  // never translate or contract a finite rail segment into the viewport.
  const span = 800,
    spacing = 0.6 * contraction;
  const count = Math.ceil(span / spacing) + 2;
  const ties = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const matrix = new THREE.Matrix4();
    for (let i = 0; i < count; i++) {
      matrix.makeTranslation((i - Math.floor(count / 2)) * spacing, -0.17, 0);
      ties.current!.setMatrixAt(i, matrix);
    }
    ties.current!.instanceMatrix.needsUpdate = true;
    ties.current!.computeBoundingSphere();
  }, [spacing, count]);
  return (
    <group name="continuous-track">
      <Box position={[0, -0.24, 0]} size={[span, 0.1, 1.8]} color="#263238" />
      {[-0.5, 0.5].map((z) => (
        <Box
          key={z}
          position={[0, -0.09, z]}
          size={[span, 0.06, 0.065]}
          color="#a0acad"
        />
      ))}
      <group position={[trackPhase(offset, spacing), 0, 0]}>
        <instancedMesh
          key={count}
          ref={ties}
          args={[undefined, undefined, count]}
        >
          <boxGeometry args={[0.13 * contraction, 0.08, 1.7]} />
          <meshStandardMaterial color="#3e5458" roughness={0.65} />
        </instancedMesh>
      </group>
    </group>
  );
}
function Dimension({
  length,
  y,
  z,
  text,
  color,
}: {
  length: number;
  y: number;
  z: number;
  text: string;
  color: string;
}) {
  return (
    <group position={[0, y, z]}>
      <Box
        position={[0, 0, 0]}
        size={[length * SCALE, 0.025, 0.025]}
        color={color}
      />
      {[-1, 1].map((sign) => (
        <Box
          key={sign}
          position={[(sign * length * SCALE) / 2, 0, 0]}
          size={[0.025, 0.2, 0.025]}
          color={color}
        />
      ))}
      <Label text={text} position={[0, 0.35, 0]} color={color} />
    </group>
  );
}
function EventMarker({
  x,
  visible,
  color,
  label,
}: {
  x: number;
  visible: boolean;
  color: string;
  label: string;
}) {
  return (
    <group position={[x, 0.18, 1.45]} visible={visible}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.17, 0.025, 10, 32]} />
        <meshBasicMaterial color={color} />
      </mesh>
      {label && <Label text={label} position={[0, 0.25, 0.45]} color={color} />}
    </group>
  );
}
function Signal({
  origin,
  radius,
  color,
  opacity = 1,
}: {
  origin: number;
  radius: number;
  color: string;
  opacity?: number;
}) {
  if (radius < 0.001) return null;
  return (
    <group position={[origin, 0.85, 1.45]} scale={[radius, radius, radius]}>
      <mesh>
        <sphereGeometry args={[1, 40, 24]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.012 * opacity}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      {[
        [0, 0, 0],
        [Math.PI / 2, 0, 0],
        [0, Math.PI / 2, 0],
      ].map((r, i) => (
        <mesh key={i} rotation={r as [number, number, number]}>
          <torusGeometry args={[1, 0.025 / radius, 6, 100]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={(i ? 0.2 : 0.95) * opacity}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}
function ParadoxWorld({
  beta,
  active,
  time,
}: {
  beta: number;
  active: boolean;
  time: number;
}) {
  const { camera, size, gl } = useThree();
  const snap = introSnapshot(time, beta);
  const g = lorentzGamma(beta),
    trainX = beta * C * snap.time * SCALE,
    tunnelX = ((-beta * C * snap.wrongTime) / g) * SCALE;
  useFrame((_, dt) => {
    if (!active) return;
    const lo = Math.min(-3.75, trainX - 3.75 / g, tunnelX - 2.5 / g, -2.5);
    const hi = Math.max(3.75, trainX + 3.75 / g, tunnelX + 2.5 / g, 2.5);
    const fit = Math.max(
      1,
      (hi - lo + 1) / ((16.5 * size.width) / size.height),
    );
    const focus = (lo + hi) / 2;
    camera.position.lerp(
      new THREE.Vector3(focus + 1.8 * fit, 5.8, 21 * fit),
      1 - Math.exp(-dt * 8),
    );
    camera.lookAt(focus, 4.8, 0);
    gl.domElement.dataset.introProgress = String(snap.progress);
    gl.domElement.dataset.introImpact = String(snap.impact);
  });
  return (
    <group visible={active} name="two-frame-paradox">
      {[false, true].map((trainFrame, i) => (
        <group key={i} position={[0, trainFrame ? 0 : 7, 0]}>
          <group position={[trainFrame ? tunnelX : 0, 0, 0]}>
            <Track />
            <Tunnel
              contraction={trainFrame ? 1 / g : 1}
              progress={
                trainFrame
                  ? [snap.wrongProgress, snap.wrongProgress]
                  : [snap.progress, snap.progress]
              }
              hypothetical={trainFrame}
            />
            <Dimension
              length={trainFrame ? 200 / g : 200}
              y={2.35}
              z={-1}
              text={`TUNNEL ${fmt(trainFrame ? 200 / g : 200, 0)} m`}
              color="#bdd1cd"
            />
          </group>
          <group position={[trainFrame ? 0 : trainX, 0, 0]}>
            <Train contraction={trainFrame ? 1 : 1 / g} />
            <Dimension
              length={trainFrame ? 300 : 300 / g}
              y={-0.5}
              z={1.8}
              text={`TRAIN ${fmt(trainFrame ? 300 : 300 / g, 0)} m`}
              color="#c7dfd1"
            />
          </group>
          {trainFrame &&
            snap.impact &&
            [-1, 1].map((sign) => (
              <group
                key={sign}
                position={[tunnelX + (sign * 2.5) / g, 1.1, 1.4]}
              >
                {[-1, 1].map((r) => (
                  <group key={r} rotation={[0, 0, (r * Math.PI) / 4]}>
                    <Box
                      position={[0, 0, 0]}
                      size={[0.72, 0.13, 0.05]}
                      color="#ff7068"
                    />
                  </group>
                ))}
              </group>
            ))}
        </group>
      ))}
    </group>
  );
}
function World(p: SceneProps) {
  const train = useRef<THREE.Group>(null),
    tunnel = useRef<THREE.Group>(null);
  const { camera, size, gl } = useThree();
  const target = useRef(new THREE.Vector3());
  const reduced = useRef(
    matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  // Frame transition changes a boost continuously. Outside transition, positions
  // follow the explicit simulation clock exactly, without a physics-lag filter.
  const blend = useRef(p.frame === "train" ? 1 : 0);
  const [visualBlend, setVisualBlend] = useState(blend.current);
  const transition = useRef({
    from: blend.current,
    to: blend.current,
    elapsed: 0.65,
  });
  const geometry = frameGeometry(p.time, p.beta, visualBlend);
  const visualTime = THREE.MathUtils.lerp(
    p.time,
    frameTime(p.time, "train", p.beta),
    visualBlend,
  );
  const visualEvent = (e: { x: number; t: number }) => {
    const transformed = transformSpaceTime(e, "train", p.beta);
    return {
      x: THREE.MathUtils.lerp(e.x, transformed.x, visualBlend),
      t: THREE.MathUtils.lerp(e.t, transformed.t, visualBlend),
    };
  };
  useEffect(() => {
    const m = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      reduced.current = m.matches;
    };
    m.addEventListener("change", update);
    return () => m.removeEventListener("change", update);
  }, []);
  useFrame((_, dt) => {
    if (p.paradox) return;
    const ease = reduced.current ? 1 : 1 - Math.exp(-dt * 9);
    const dest = p.frame === "train" ? 1 : 0;
    if (transition.current.to !== dest)
      transition.current = { from: blend.current, to: dest, elapsed: 0 };
    const tr = transition.current;
    tr.elapsed = Math.min(0.65, tr.elapsed + dt);
    const u = reduced.current ? 1 : tr.elapsed / 0.65;
    blend.current = THREE.MathUtils.lerp(tr.from, tr.to, u * u * (3 - 2 * u));
    if (visualBlend !== blend.current) setVisualBlend(blend.current);
    const b = visualBlend,
      tx = geometry.trainX * SCALE,
      ux = geometry.tunnelX * SCALE;
    train.current!.position.x = tx;
    tunnel.current!.position.x = ux;
    // Station view follows the train while retaining the gates in the framing.
    // Train view stays anchored; the camera never follows moving infrastructure.
    const stationTrainX = p.beta * C * p.time * SCALE;
    const stationFocus = stationTrainX * 0.5;
    const focus = stationFocus * (1 - b);
    const stationSpan = Math.abs(stationTrainX) + 6;
    const fit = Math.max(
      1,
      THREE.MathUtils.lerp(stationSpan / 12, 1, b),
      (size.width < 500 ? 1.3 : 1) / (size.width / size.height),
    );
    const poses = {
      Overview: [focus + 5 * fit, 6.3 * fit, 12 * fit],
      Side: [focus + 4 * fit, 4.8 * fit, 15 * fit],
      Center: [focus + 2 * fit, 7 * fit, 12 * fit],
    };
    camera.position.lerp(new THREE.Vector3(...poses[p.camera]), ease);
    target.current.lerp(new THREE.Vector3(focus, 1.3, 0), ease);
    camera.lookAt(target.current);
    gl.domElement.dataset.trainX = String(geometry.trainX);
    gl.domElement.dataset.tunnelX = String(geometry.tunnelX);
    gl.domElement.dataset.trackOffset = String(geometry.tunnelX);
    gl.domElement.dataset.frameBlend = String(b);
    gl.domElement.dataset.cameraX = String(camera.position.x);
    gl.domElement.dataset.trainLength = String(getTrainLength(p.frame, p.beta));
    gl.domElement.dataset.tunnelLength = String(
      getTunnelLength(p.frame, p.beta),
    );
  });
  const allowed = trainFitsInTunnel(p.beta),
    q = frameTime(p.time, p.frame, p.beta);
  const progress = (["A", "B"] as const).map((id) =>
    p.events || p.signals
      ? THREE.MathUtils.lerp(
          gateProgress(id, p.time, "tunnel", p.beta),
          gateProgress(id, p.time, "train", p.beta),
          visualBlend,
        )
      : 0,
  ) as [number, number];
  useEffect(() => {
    gl.domElement.dataset.gateA = String(progress[0]);
    gl.domElement.dataset.gateB = String(progress[1]);
  }, [gl, progress[0], progress[1]]);
  return (
    <>
      <color attach="background" args={["#101010"]} />
      <ambientLight intensity={1.4} />
      <directionalLight position={[3, 10, 8]} intensity={2.2} />
      <directionalLight position={[-5, 4, -6]} intensity={1} color="#a9cdda" />
      <group visible={!p.paradox}>
        <Track
          offset={geometry.tunnelX * SCALE}
          contraction={geometry.tunnelScale}
        />
        <group ref={tunnel}>
          <group>
            <Tunnel
              contraction={geometry.tunnelScale}
              progress={progress}
              received={
                doorEvents.map(
                  (e) =>
                    allowed &&
                    (p.events || p.signals) &&
                    q >= transformSpaceTime(e.tunnel, p.frame, p.beta).t - 1e-9,
                ) as [boolean, boolean]
              }
            />
          </group>
          {p.lengths && (
            <Dimension
              length={TUNNEL_PROPER_LENGTH * geometry.tunnelScale}
              y={2.3}
              z={-1.8}
              text={`TUNNEL · ${fmt(getTunnelLength(p.frame, p.beta), 1)} m`}
              color="#8bb9b8"
            />
          )}
          {p.signals &&
            sensorEvents(p.beta).map((e) => (
              <Sensor
                key={e.id}
                id={e.id}
                x={e.tunnel.x * geometry.tunnelScale * SCALE}
                active={
                  allowed &&
                  q >= transformSpaceTime(e.tunnel, p.frame, p.beta).t
                }
              />
            ))}
          {p.frame === "train" && p.signals && (
            <Label
              text="← TUNNEL + SENSORS MOVE"
              position={[0, 3.15, -1.5]}
              color="#b8d8d4"
            />
          )}
        </group>
        <group ref={train}>
          <group>
            <Train contraction={geometry.trainScale} />
          </group>
          {p.lengths && (
            <Dimension
              length={TRAIN_PROPER_LENGTH * geometry.trainScale}
              y={-0.45}
              z={1.85}
              text={`TRAIN · ${fmt(getTrainLength(p.frame, p.beta), 1)} m`}
              color="#ffda65"
            />
          )}
        </group>
        {doorEvents.map((e, i) => {
          const c = visualEvent(e.tunnel),
            age = visualTime - c.t,
            color = i ? "#e8bc72" : "#8ac4dd";
          return (
            <group key={e.id}>
              <EventMarker
                x={
                  THREE.MathUtils.lerp(
                    e.tunnel.x,
                    transformSpaceTime(e.tunnel, "train", p.beta).x,
                    visualBlend,
                  ) * SCALE
                }
                visible={p.events && allowed && age >= -1e-9}
                color={color}
                label={e.id + " RECEIVED HERE"}
              />
            </group>
          );
        })}
        {p.signals &&
          sensorEvents(p.beta).map((e, i) => {
            const emission = visualEvent(e.tunnel);
            const age = visualTime - emission.t;
            return (
              <group key={e.id}>
                {allowed && age >= 0 && (
                  <Signal
                    origin={
                      THREE.MathUtils.lerp(
                        e.tunnel.x,
                        transformSpaceTime(e.tunnel, "train", p.beta).x,
                        visualBlend,
                      ) * SCALE
                    }
                    radius={C * age * SCALE}
                    color={i ? "#ffda65" : "#75cfff"}
                    opacity={
                      !i &&
                      q >=
                        transformSpaceTime(
                          sensorEvents(p.beta)[1].tunnel,
                          p.frame,
                          p.beta,
                        ).t
                        ? 0.22
                        : 1
                    }
                  />
                )}
                {allowed && age >= 0 && (
                  <EventMarker
                    x={
                      THREE.MathUtils.lerp(
                        e.tunnel.x,
                        transformSpaceTime(e.tunnel, "train", p.beta).x,
                        visualBlend,
                      ) * SCALE
                    }
                    visible
                    label=""
                    color={i ? "#ffda65" : "#75cfff"}
                  />
                )}
              </group>
            );
          })}
      </group>
      <ParadoxWorld
        beta={p.beta}
        active={!!p.paradox}
        time={p.introTime ?? 0}
      />
    </>
  );
}
export function RelativityScene(props: SceneProps) {
  const { t } = useLanguage();
  return (
    <Canvas
      camera={{ position: [5, 6.3, 12], fov: 43, near: 0.1, far: 300 }}
      dpr={[1, 2]}
      gl={{ antialias: true }}
      onCreated={({ gl, scene }) => {
        gl.domElement.dataset.worldId = scene.uuid;
      }}
      aria-label={t(
        "持续运行的 3D 列车与隧道实验",
        "Persistent 3D train and tunnel experiment",
      )}
    >
      <World {...props} />
    </Canvas>
  );
}
