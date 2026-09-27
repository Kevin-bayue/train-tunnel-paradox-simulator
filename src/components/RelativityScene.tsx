import { useLanguage, sceneLabel } from "../i18n";
import { introSnapshot } from "../physics/intro";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import {
  C,
  TRAIN_PROPER_LENGTH,
  TUNNEL_PROPER_LENGTH,
  doorEvents,
  doorClosed,
  frameTime,
  transformSpaceTime,
  trainMidpoint,
  tunnelLandmark,
  getTrainLength,
  getTunnelLength,
  lorentzGamma,
  trainFitsInTunnel,
  fmt,
  sensorEvents,
  gateProgress,
  gatePhase,
  shutterDuration,
  eventAnchor,
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
function Track() {
  return (
    <group>
      <Box position={[0, -0.24, 0]} size={[60, 0.1, 1.8]} color="#263238" />
      {[-0.5, 0.5].map((z) => (
        <Box
          key={z}
          position={[0, -0.09, z]}
          size={[60, 0.06, 0.065]}
          color="#a0acad"
        />
      ))}
      {Array.from({ length: 100 }, (_, i) => (
        <Box
          key={i}
          position={[(i - 50) * 0.6, -0.17, 0]}
          size={[0.13, 0.08, 1.7]}
          color="#3e5458"
        />
      ))}
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
  const group = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (group.current)
      group.current.position.x = THREE.MathUtils.lerp(
        group.current.position.x,
        x,
        matchMedia("(prefers-reduced-motion: reduce)").matches
          ? 1
          : 1 - Math.exp(-dt * 9),
      );
  });
  return (
    <group ref={group} position={[0, 0.18, 1.45]} visible={visible}>
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
    tunnel = useRef<THREE.Group>(null),
    track = useRef<THREE.Group>(null);
  const { camera, size, gl } = useThree();
  const target = useRef(new THREE.Vector3());
  const reduced = useRef(
    matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  // Frame transition changes a boost continuously. Outside transition, positions
  // follow the explicit simulation clock exactly, without a physics-lag filter.
  const blend = useRef(p.frame === "train" ? 1 : 0);
  const [renderState] = useMemo(() => [{ trainScale: 1, tunnelScale: 1 }], []);
  const trainGeometry = useRef<THREE.Group>(null),
    tunnelGeometry = useRef<THREE.Group>(null);
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
    blend.current = THREE.MathUtils.lerp(blend.current, dest, ease);
    if (Math.abs(blend.current - dest) < 0.0001) blend.current = dest;
    const b = blend.current,
      g = lorentzGamma(p.beta),
      tx = THREE.MathUtils.lerp(p.beta * C * p.time, 0, b) * SCALE,
      ux = THREE.MathUtils.lerp(0, (-p.beta * C * p.time) / g, b) * SCALE;
    train.current!.position.x = tx;
    tunnel.current!.position.x = ux;
    track.current!.position.x = ux;
    track.current!.scale.x = THREE.MathUtils.lerp(1, 1 / g, b);
    renderState.trainScale = THREE.MathUtils.lerp(1 / g, 1, b);
    renderState.tunnelScale = THREE.MathUtils.lerp(1, 1 / g, b);
    // Geometries are driven by actual frame props, with only transition delta eased.
    trainGeometry.current!.scale.x =
      renderState.trainScale / (p.frame === "train" ? 1 : 1 / g);
    tunnelGeometry.current!.scale.x =
      renderState.tunnelScale / (p.frame === "tunnel" ? 1 : 1 / g);
    const halfTrain =
        (TRAIN_PROPER_LENGTH * renderState.trainScale * SCALE) / 2,
      halfTunnel = (TUNNEL_PROPER_LENGTH * renderState.tunnelScale * SCALE) / 2;
    const sensors = sensorEvents(p.beta);
    const relayTime = eventAnchor(sensors[1].tunnel, p.frame, p.beta);
    const sensorX =
      tunnelLandmark(sensors[0].tunnel.x, p.time, p.frame, p.beta) * SCALE;
    const lo = Math.min(
        tx - halfTrain,
        ux - halfTunnel,
        p.signals && p.time <= relayTime ? sensorX - 0.5 : Infinity,
      ),
      hi = Math.max(tx + halfTrain, ux + halfTunnel),
      focus = (lo + hi) / 2;
    const fit = Math.max(
      1,
      (hi - lo + 2) / 11,
      (size.width < 500 ? 1.3 : 1) / (size.width / size.height),
    );
    const poses = {
      Overview: [focus + 5 * fit, 6.3 * fit, 12 * fit],
      Side: [focus, 4.8 * fit, 17 * fit],
      Center: [focus + 2 * fit, 7 * fit, 12 * fit],
    };
    camera.position.lerp(new THREE.Vector3(...poses[p.camera]), ease);
    target.current.lerp(new THREE.Vector3(focus, 1.3, 0), ease);
    camera.lookAt(target.current);
    gl.domElement.dataset.trainLength = String(getTrainLength(p.frame, p.beta));
    gl.domElement.dataset.tunnelLength = String(
      getTunnelLength(p.frame, p.beta),
    );
  });
  const allowed = trainFitsInTunnel(p.beta),
    q = frameTime(p.time, p.frame, p.beta),
    g = lorentzGamma(p.beta);
  const progress = (["A", "B"] as const).map((id) =>
    p.events || p.signals ? gateProgress(id, p.time, p.frame, p.beta) : 0,
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
        <group ref={track}>
          <Track />
        </group>
        <group ref={tunnel}>
          <group ref={tunnelGeometry}>
            <Tunnel
              contraction={p.frame === "tunnel" ? 1 : 1 / g}
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
              length={getTunnelLength(p.frame, p.beta)}
              y={2.3}
              z={-1.8}
              text={`TUNNEL · ${fmt(getTunnelLength(p.frame, p.beta), 1)} m`}
              color="#8bb9b8"
            />
          )}
          {p.frame === "train" && p.signals && (
            <Label
              text="← TUNNEL + SENSORS MOVE"
              position={[0, 3.15, -1.5]}
              color="#b8d8d4"
            />
          )}
        </group>
        <group ref={train}>
          <group ref={trainGeometry}>
            <Train contraction={p.frame === "train" ? 1 : 1 / g} />
          </group>
          {p.lengths && (
            <Dimension
              length={getTrainLength(p.frame, p.beta)}
              y={-0.45}
              z={1.85}
              text={`TRAIN · ${fmt(getTrainLength(p.frame, p.beta), 1)} m`}
              color="#ffda65"
            />
          )}
        </group>
        {doorEvents.map((e, i) => {
          const c = transformSpaceTime(e.tunnel, p.frame, p.beta),
            age = q - c.t,
            color = i ? "#e8bc72" : "#8ac4dd";
          return (
            <group key={e.id}>
              <EventMarker
                x={c.x * SCALE}
                visible={p.events && allowed && age >= -1e-9}
                color={color}
                label={e.id + " RECEIVED HERE"}
              />
            </group>
          );
        })}
        {p.signals &&
          sensorEvents(p.beta).map((e, i) => {
            const emission = transformSpaceTime(e.tunnel, p.frame, p.beta);
            const age = q - emission.t;
            return (
              <group key={e.id}>
                <Sensor
                  id={e.id}
                  x={
                    tunnelLandmark(e.tunnel.x, p.time, p.frame, p.beta) * SCALE
                  }
                  active={allowed && age >= 0}
                />
                {allowed && age >= 0 && (
                  <Signal
                    origin={emission.x * SCALE}
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
                    x={emission.x * SCALE}
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
