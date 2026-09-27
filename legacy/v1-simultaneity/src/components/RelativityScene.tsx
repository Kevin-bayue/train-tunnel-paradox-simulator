import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import {
  C,
  emissions,
  receptionEvents,
  transformSpaceTime,
  frameTime,
  stationLandmark,
  trainMidpoint,
  calculateLightWorldline,
} from "../physics/model";
import type { Frame } from "../physics/model";
import type { CameraView } from "../stages/stages";
export type SceneProps = {
  beta: number;
  time: number;
  frame: Frame;
  camera: CameraView;
  events: boolean;
  pulses: boolean;
  clocks: boolean;
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
  const texture = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 96;
    const ctx = c.getContext("2d")!;
    ctx.font = "500 30px system-ui";
    ctx.textAlign = "center";
    ctx.fillStyle = color;
    ctx.fillText(text, 256, 56);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [text, color]);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <sprite position={position} scale={[4, 0.75, 1]}>
      <spriteMaterial map={texture} transparent depthTest={false} />
    </sprite>
  );
}
function Observer() {
  return (
    <group position={[0, 0.65, 0.1]}>
      <mesh position={[0, 0.52, 0]}>
        <sphereGeometry args={[0.13, 16, 16]} />
        <meshStandardMaterial color="#eed6aa" />
      </mesh>
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.12, 0.17, 0.4, 12]} />
        <meshStandardMaterial color="#e4be7c" />
      </mesh>
    </group>
  );
}
function Train() {
  return (
    <group name="persistent-train">
      <Box position={[0, 0.3, 0]} size={[7.8, 0.25, 1.05]} color="#687f84" />
      {[-2.55, 0, 2.55].map((x, i) => (
        <group key={x} position={[x, 0, 0]}>
          <Box
            position={[0, 0.72, -0.34]}
            size={[2.42, 0.75, 0.2]}
            color="#8fa8ab"
          />
          <Box
            position={[0, 0.72, 0.43]}
            size={[2.42, 0.65, 0.11]}
            color="#6e9094"
          />
          {[-0.78, -0.26, 0.26, 0.78].map((w) => (
            <Box
              key={w}
              position={[w, 0.88, 0.495]}
              size={[0.35, 0.22, 0.025]}
              color="#253d48"
            />
          ))}
          <Box
            position={[0, 1.2, -0.27]}
            size={[2.45, 0.12, 0.58]}
            color="#b4c6c4"
          />
          {[-0.75, 0, 0.75].map((w) => (
            <Box
              key={w}
              position={[w, 0.94, -0.46]}
              size={[0.5, 0.3, 0.025]}
              color="#243c46"
            />
          ))}
          {[-0.8, 0.8].flatMap((w) =>
            [-0.48, 0.48].map((z) => (
              <mesh
                key={`${w}${z}`}
                position={[w, 0.16, z]}
                rotation={[Math.PI / 2, 0, 0]}
              >
                <cylinderGeometry args={[0.19, 0.19, 0.12, 20]} />
                <meshStandardMaterial
                  color="#171f25"
                  metalness={0.6}
                  roughness={0.4}
                />
              </mesh>
            )),
          )}
          {i === 2 && (
            <>
              <Box
                position={[1.17, 0.73, 0]}
                size={[0.22, 0.72, 0.9]}
                color="#abc3c1"
              />
              <Box
                position={[1.3, 0.88, 0]}
                size={[0.03, 0.26, 0.65]}
                color="#304a54"
              />
              <Box
                position={[1.31, 0.53, 0.32]}
                size={[0.04, 0.1, 0.13]}
                color="#f5dca1"
              />
            </>
          )}
        </group>
      ))}
      <group position={[0, 0.35, 0.35]}>
        <Observer />
      </group>
      <Label
        text="MIDPOINT OBSERVER"
        position={[0, 1.9, 0.1]}
        color="#e6c48b"
      />
      <Label text="FRONT →" position={[3.3, 1.7, 0]} />
    </group>
  );
}
function Track() {
  return (
    <group>
      <Box position={[0, -0.17, 0]} size={[55, 0.1, 1.8]} color="#222c30" />
      {[-0.48, 0.48].map((z) => (
        <Box
          key={z}
          position={[0, -0.03, z]}
          size={[55, 0.07, 0.065]}
          color="#8a989c"
        />
      ))}
      {Array.from({ length: 100 }, (_, i) => (
        <Box
          key={i}
          position={[(i - 50) * 0.55, -0.09, 0]}
          size={[0.12, 0.08, 1.5]}
          color="#475052"
        />
      ))}
      <Box position={[0, -0.05, -2.1]} size={[45, 0.3, 1.5]} color="#364044" />
      <Box
        position={[0, 0.12, -1.4]}
        size={[45, 0.025, 0.07]}
        color="#b3a884"
      />
      <Label text="STATION / PLATFORM" position={[-5, 0.35, -2.5]} />
      <mesh position={[0, 0.35, -1.7]}>
        <sphereGeometry args={[0.13, 16, 16]} />
        <meshStandardMaterial color="#b6c9dc" />
      </mesh>
    </group>
  );
}
function World(p: SceneProps) {
  const train = useRef<THREE.Group>(null),
    track = useRef<THREE.Group>(null);
  const markers = useRef<(THREE.Group | null)[]>([]),
    pulses = useRef<(THREE.Group | null)[]>([]),
    flashes = useRef<(THREE.Group | null)[]>([]),
    receipts = useRef<(THREE.Group | null)[]>([]);
  const { camera, size } = useThree();
  const target = useRef(new THREE.Vector3());
  const reduced = useRef(
    matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      reduced.current = media.matches;
    };
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useFrame((_, dt) => {
    const ease = reduced.current ? 1 : 1 - Math.exp(-dt * 8),
      t = frameTime(p.time, p.frame, p.beta);
    const tx = trainMidpoint(p.time, p.frame, p.beta) * SCALE;
    train.current!.position.x = THREE.MathUtils.lerp(
      train.current!.position.x,
      tx,
      ease,
    );
    track.current!.position.x = THREE.MathUtils.lerp(
      track.current!.position.x,
      stationLandmark(0, p.time, p.frame, p.beta) * SCALE,
      ease,
    );
    // Train is a schematic glyph: fixed size, not a relativistic photograph or length ruler.
    const endpoints = emissions.map(
      (e) => transformSpaceTime(e.station, p.frame, p.beta).x * SCALE,
    );
    const lo = Math.min(endpoints[0] - 1, tx - 4.4),
      hi = Math.max(endpoints[1] + 1, tx + 4.4);
    const focus = (lo + hi) / 2;
    const fit = Math.max(
      1,
      (hi - lo) / 12,
      (size.width < 500 ? 1.55 : 1.15) / (size.width / size.height),
    );
    const poses = {
      Overview: [focus + 8 * fit, 8 * fit, 13 * fit],
      Side: [focus, 4 * fit, 16 * fit],
      Center: [tx + 2, 5, 12],
    };
    const pose = poses[p.camera];
    camera.position.lerp(new THREE.Vector3(...pose), ease);
    target.current.lerp(new THREE.Vector3(focus, 0.2, 0), ease);
    camera.lookAt(target.current);
    emissions.forEach((e, i) => {
      const event = transformSpaceTime(e.station, p.frame, p.beta);
      const marker = markers.current[i]!;
      marker.position.x = THREE.MathUtils.lerp(
        marker.position.x,
        event.x * SCALE,
        ease,
      );
      marker.visible = p.events;
      const age = t - event.t;
      flashes.current[i]!.visible = p.events && age >= 0 && age < 0.16;
      const pulse = pulses.current[i]!;
      pulse.visible = p.pulses && age >= 0;
      const x = calculateLightWorldline(event, t, i === 0 ? 1 : -1) * SCALE;
      pulse.position.x = THREE.MathUtils.lerp(pulse.position.x, x, ease);
      const r = transformSpaceTime(
        receptionEvents(p.beta)[i].station,
        p.frame,
        p.beta,
      );
      const receipt = receipts.current[i]!;
      receipt.visible = p.pulses && t >= r.t;
      receipt.position.x = THREE.MathUtils.lerp(
        receipt.position.x,
        r.x * SCALE,
        ease,
      );
    });
  });
  return (
    <>
      <color attach="background" args={["#141a1d"]} />
      <ambientLight intensity={1.3} />
      <directionalLight position={[3, 10, 8]} intensity={2.5} />
      <directionalLight
        position={[-5, 4, -6]}
        intensity={1.2}
        color="#a9cdda"
      />
      <group ref={track}>
        <Track />
      </group>
      <group ref={train}>
        <Train />
      </group>
      {emissions.map((e, i) => (
        <group key={e.id}>
          <group
            ref={(g) => {
              markers.current[i] = g;
            }}
            position={[e.station.x * SCALE, 0, 0]}
          >
            <mesh position={[0, 0.35, 0.95]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.2, 0.025, 12, 40]} />
              <meshBasicMaterial color={i ? "#e0bd80" : "#8ac4dd"} />
            </mesh>
            <Label
              text={`EVENT ${e.id} · EMISSION`}
              position={[0, 2.8, 0]}
              color={i ? "#e0bd80" : "#8ac4dd"}
            />
            <group
              ref={(g) => {
                flashes.current[i] = g;
              }}
            >
              <mesh position={[0, 1.8, 0]} rotation={[0, 0, -0.15]}>
                <cylinderGeometry args={[0.045, 0.025, 3.1, 6]} />
                <meshBasicMaterial color="#fff2c4" />
              </mesh>
              <pointLight position={[0, 1, 0]} intensity={4} distance={4} />
            </group>
          </group>
          <group
            ref={(g) => {
              pulses.current[i] = g;
            }}
            position={[e.station.x * SCALE, 0.95, 0]}
          >
            <mesh>
              <sphereGeometry args={[0.12, 20, 20]} />
              <meshBasicMaterial color={i ? "#e0bd80" : "#8ac4dd"} />
            </mesh>
            <mesh rotation={[0, Math.PI / 2, 0]}>
              <torusGeometry args={[0.48, 0.015, 8, 48]} />
              <meshBasicMaterial color={i ? "#e0bd80" : "#8ac4dd"} />
            </mesh>
          </group>
          <group
            ref={(g) => {
              receipts.current[i] = g;
            }}
            position={[0, 1.5, 0.7]}
          >
            <mesh rotation={[0, 0, Math.PI / 4]}>
              <boxGeometry args={[0.15, 0.15, 0.15]} />
              <meshBasicMaterial color={i ? "#e0bd80" : "#8ac4dd"} />
            </mesh>
            <Label
              text={`${e.id} RECEIVED`}
              position={[0, i ? 0.5 : 1, 0]}
              color={i ? "#e0bd80" : "#8ac4dd"}
            />
          </group>
        </group>
      ))}
    </>
  );
}
export function RelativityScene(props: SceneProps) {
  return (
    <Canvas
      camera={{ position: [8, 8, 13], fov: 43, near: 0.1, far: 200 }}
      dpr={[1, 2]}
      gl={{ antialias: true }}
      onCreated={({ gl, scene }) => {
        gl.domElement.dataset.worldId = scene.uuid;
      }}
      aria-label="Persistent 3D train experiment"
    >
      <World {...props} />
    </Canvas>
  );
}
