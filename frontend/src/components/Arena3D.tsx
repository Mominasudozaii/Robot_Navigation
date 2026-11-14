import { ContactShadows, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { memo, useEffect, useMemo, useRef } from "react";
import type { Coordinate, EditMode, Simulation } from "../types";

export type CameraMode = "overview" | "robot" | "aisle";

type ArenaProps = {
  width: number;
  depth: number;
  start: Coordinate;
  goal: Coordinate;
  obstacles: Coordinate[];
  simulation: Simulation | null;
  editMode: EditMode;
  cameraMode: CameraMode;
  onCellClick: (cell: Coordinate) => void;
};

const cellKey = (cell: Coordinate) => cell.x + ":" + cell.z;

function createConcreteTexture(width: number, depth: number) {
  const size = 96;
  const data = new Uint8Array(size * size * 4);
  for (let index = 0; index < size * size; index += 1) {
    const grain = Math.sin(index * 12.9898) * 43758.5453;
    const noise = Math.floor((grain - Math.floor(grain)) * 20);
    const value = 91 + noise;
    data[index * 4] = value;
    data[index * 4 + 1] = value + 7;
    data[index * 4 + 2] = value + 11;
    data[index * 4 + 3] = 255;
  }
  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(Math.max(3, width / 2.2), Math.max(3, depth / 2.2));
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return texture;
}

function WarehouseFloor({ width, depth }: { width: number; depth: number }) {
  const concrete = useMemo(() => createConcreteTexture(width, depth), [width, depth]);
  useEffect(() => () => concrete.dispose(), [concrete]);
  const centerX = (width - 1) / 2;
  const centerZ = (depth - 1) / 2;
  const crossAisles = [depth * 0.27, depth * 0.69];
  return (
    <>
      <mesh receiveShadow position={[centerX, -0.12, centerZ]}>
        <boxGeometry args={[width + 3.2, 0.22, depth + 3.2]} />
        <meshStandardMaterial map={concrete} color="#67727c" roughness={0.9} metalness={0.08} />
      </mesh>
      <mesh receiveShadow position={[centerX, -0.001, 0.08]}>
        <boxGeometry args={[width - 0.35, 0.012, 0.075]} />
        <meshStandardMaterial color="#eeb74f" roughness={0.38} metalness={0.18} />
      </mesh>
      <mesh receiveShadow position={[centerX, -0.001, depth - 1.08]}>
        <boxGeometry args={[width - 0.35, 0.012, 0.075]} />
        <meshStandardMaterial color="#eeb74f" roughness={0.38} metalness={0.18} />
      </mesh>
      {crossAisles.map((z, index) => (
        <group key={index} position={[centerX, 0.001, z]}>
          <mesh receiveShadow><boxGeometry args={[width - 0.8, 0.009, 0.026]} /><meshStandardMaterial color="#c6ccd0" roughness={0.72} /></mesh>
          {Array.from({ length: 10 }, (_, stripe) => (
            <mesh key={stripe} position={[-width / 2 + 0.85 + stripe * 1.33, 0.013, 0]}>
              <boxGeometry args={[0.58, 0.01, 0.12]} />
              <meshStandardMaterial color="#d9e0de" roughness={0.7} />
            </mesh>
          ))}
        </group>
      ))}
      {Array.from({ length: 4 }, (_, index) => (
        <mesh key={index} receiveShadow position={[centerX - width / 2 + 2.15 + index * 3.25, 0.002, centerZ]}>
          <boxGeometry args={[0.025, 0.007, depth - 0.5]} />
          <meshStandardMaterial color="#4c5660" roughness={0.78} />
        </mesh>
      ))}
    </>
  );
}

function RackBay({ position, rotation = 0, seed }: { position: [number, number, number]; rotation?: number; seed: number }) {
  const cartonColors = ["#c87e45", "#3f7491", "#9b6b72", "#718a5a", "#ac8238"];
  const labelColor = cartonColors[seed % cartonColors.length];
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {[-0.78, 0.78].map((x) => (
        <mesh key={x} castShadow position={[x, 1.78, 0]}>
          <boxGeometry args={[0.1, 3.56, 0.78]} />
          <meshStandardMaterial color="#26333b" metalness={0.83} roughness={0.31} />
        </mesh>
      ))}
      {[0.24, 1.25, 2.26, 3.48].map((y) => (
        <mesh key={y} castShadow position={[0, y, 0]}>
          <boxGeometry args={[1.68, 0.1, 0.82]} />
          <meshStandardMaterial color="#e6a338" metalness={0.34} roughness={0.44} />
        </mesh>
      ))}
      {[0.52, 1.52, 2.53].map((y, shelf) => (
        <group key={y}>
          <mesh castShadow position={[-0.38, y, shelf % 2 ? 0.04 : -0.07]}>
            <boxGeometry args={[0.52, 0.42, 0.5]} />
            <meshStandardMaterial color={cartonColors[(seed + shelf) % cartonColors.length]} roughness={0.67} metalness={0.04} />
          </mesh>
          <mesh castShadow position={[0.29, y + 0.035, shelf % 2 ? -0.06 : 0.08]}>
            <boxGeometry args={[0.47, 0.49, 0.52]} />
            <meshStandardMaterial color={cartonColors[(seed + shelf + 2) % cartonColors.length]} roughness={0.67} metalness={0.04} />
          </mesh>
          <mesh position={[-0.38, y + 0.01, 0.256]}>
            <planeGeometry args={[0.23, 0.09]} />
            <meshBasicMaterial color={labelColor} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function WarehouseShell({ width, depth }: { width: number; depth: number }) {
  const centerX = (width - 1) / 2;
  const centerZ = (depth - 1) / 2;
  const sideBays = Array.from({ length: Math.max(3, Math.floor(depth / 2.15)) }, (_, index) => 0.85 + index * 2.15);
  const rearBays = Array.from({ length: Math.max(4, Math.floor(width / 2.15)) }, (_, index) => 0.8 + index * 2.15);
  const lamps: Array<[number, number]> = [[2.2, 1.9], [centerX, 4.8], [width - 3.2, 7.5]];
  return (
    <>
      <WarehouseFloor width={width} depth={depth} />
      <group>
        {[-1.42, width + 0.42].map((x, side) => sideBays.map((z, index) => (
          <RackBay key={side + "-" + index} position={[x, 0, z]} rotation={Math.PI / 2} seed={index + side * 3} />
        )))}
        {rearBays.map((x, index) => (
          <RackBay key={"rear-" + index} position={[x, 0, depth + 1.1]} seed={index + 8} />
        ))}
      </group>
      <mesh receiveShadow position={[centerX, 2.45, depth + 2.04]}>
        <boxGeometry args={[width + 4.4, 4.9, 0.2]} />
        <meshStandardMaterial color="#273139" roughness={0.61} metalness={0.31} />
      </mesh>
      <mesh receiveShadow position={[centerX, 2.18, depth + 1.9]}>
        <boxGeometry args={[3.25, 3.85, 0.12]} />
        <meshStandardMaterial color="#131c22" roughness={0.42} metalness={0.55} />
      </mesh>
      <mesh position={[centerX, 4.18, depth + 1.83]}>
        <boxGeometry args={[3.5, 0.28, 0.24]} />
        <meshStandardMaterial color="#f0ad43" metalness={0.55} roughness={0.35} />
      </mesh>
      {[-1.95, width + 1.95].map((x) => (
        <mesh key={x} castShadow position={[x, 2.45, centerZ]}>
          <boxGeometry args={[0.22, 4.9, depth + 4]} />
          <meshStandardMaterial color="#334049" roughness={0.46} metalness={0.62} />
        </mesh>
      ))}
      {Array.from({ length: 6 }, (_, index) => (
        <mesh key={"beam-" + index} castShadow position={[centerX, 4.7, -1.5 + index * 2.45]}>
          <boxGeometry args={[width + 3.8, 0.14, 0.16]} />
          <meshStandardMaterial color="#404e57" metalness={0.74} roughness={0.27} />
        </mesh>
      ))}
      {lamps.map(([x, z], index) => (
        <group key={"lamp-" + index} position={[x, 4.25, z]}>
          <mesh castShadow><boxGeometry args={[1.08, 0.09, 0.38]} /><meshStandardMaterial color="#d8e2e2" metalness={0.72} roughness={0.22} emissive="#c4f5ff" emissiveIntensity={0.55} /></mesh>
          <spotLight castShadow color="#dff8ff" intensity={14} distance={10} angle={0.46} penumbra={0.78} position={[0, -0.08, 0]} rotation={[-Math.PI / 2, 0, 0]} />
        </group>
      ))}
      <group position={[width - 1.15, 0, -1.05]}>
        <mesh castShadow position={[0, 0.5, 0]}><boxGeometry args={[1.45, 1, 0.82]} /><meshStandardMaterial color="#2c6268" metalness={0.48} roughness={0.45} /></mesh>
        <mesh position={[0, 0.52, 0.416]}><boxGeometry args={[0.75, 0.34, 0.02]} /><meshStandardMaterial color="#143135" emissive="#2e9fb1" emissiveIntensity={0.72} /></mesh>
        <mesh castShadow position={[-0.7, 0.12, 0]}><cylinderGeometry args={[0.13, 0.13, 0.17, 18]} /><meshStandardMaterial color="#1d252c" roughness={0.82} /></mesh>
        <mesh castShadow position={[0.7, 0.12, 0]}><cylinderGeometry args={[0.13, 0.13, 0.17, 18]} /><meshStandardMaterial color="#1d252c" roughness={0.82} /></mesh>
      </group>
    </>
  );
}

function PalletStack({ accent }: { accent: string }) {
  return (
    <group>
      <mesh castShadow position={[0, 0.06, 0]}><boxGeometry args={[0.88, 0.12, 0.82]} /><meshStandardMaterial color="#6e452b" roughness={0.86} /></mesh>
      {[-0.31, 0.31].map((x) => <mesh key={x} castShadow position={[x, 0.13, 0]}><boxGeometry args={[0.1, 0.1, 0.84]} /><meshStandardMaterial color="#bb763c" roughness={0.69} /></mesh>)}
      <mesh castShadow position={[-0.05, 0.41, 0]}><boxGeometry args={[0.73, 0.56, 0.65]} /><meshStandardMaterial color={accent} roughness={0.58} metalness={0.08} /></mesh>
      <mesh castShadow position={[0.1, 0.83, -0.03]}><boxGeometry args={[0.58, 0.3, 0.55]} /><meshStandardMaterial color="#c7d1d0" roughness={0.63} /></mesh>
      <mesh position={[-0.05, 0.41, 0.331]}><planeGeometry args={[0.3, 0.11]} /><meshBasicMaterial color="#edf0e5" /></mesh>
    </group>
  );
}

function DrumCluster({ accent }: { accent: string }) {
  return (
    <group>
      {[-0.23, 0.23].map((x, index) => (
        <group key={x} position={[x, 0, index ? -0.08 : 0.08]}>
          <mesh castShadow position={[0, 0.38, 0]}><cylinderGeometry args={[0.18, 0.18, 0.76, 24]} /><meshStandardMaterial color={accent} metalness={0.44} roughness={0.35} /></mesh>
          <mesh castShadow position={[0, 0.03, 0]}><cylinderGeometry args={[0.19, 0.19, 0.05, 24]} /><meshStandardMaterial color="#35424b" metalness={0.74} roughness={0.24} /></mesh>
          <mesh position={[0, 0.76, 0]}><torusGeometry args={[0.15, 0.014, 7, 24]} /><meshStandardMaterial color="#dbe4e3" metalness={0.7} roughness={0.23} /></mesh>
        </group>
      ))}
    </group>
  );
}

function SafetyBarrier() {
  return (
    <group>
      {[-0.36, 0.36].map((x) => <mesh key={x} castShadow position={[x, 0.43, 0]}><cylinderGeometry args={[0.048, 0.055, 0.86, 16]} /><meshStandardMaterial color="#f1ae35" metalness={0.42} roughness={0.36} /></mesh>)}
      {[0.3, 0.62].map((y) => <mesh key={y} castShadow position={[0, y, 0]}><boxGeometry args={[0.82, 0.07, 0.1]} /><meshStandardMaterial color="#f1ae35" metalness={0.43} roughness={0.35} /></mesh>)}
      <mesh castShadow position={[0, 0.07, 0]}><boxGeometry args={[0.95, 0.12, 0.4]} /><meshStandardMaterial color="#303c43" roughness={0.62} metalness={0.35} /></mesh>
    </group>
  );
}

function MobileCage({ accent }: { accent: string }) {
  return (
    <group>
      <mesh castShadow position={[0, 0.07, 0]}><boxGeometry args={[0.85, 0.14, 0.72]} /><meshStandardMaterial color="#38474f" metalness={0.7} roughness={0.25} /></mesh>
      {[-0.37, 0.37].flatMap((x) => [-0.29, 0.29].map((z) => <mesh key={x + "-" + z} castShadow position={[x, 0.12, z]}><sphereGeometry args={[0.09, 14, 14]} /><meshStandardMaterial color="#1b2227" roughness={0.83} /></mesh>))}
      {[-0.35, 0.35].map((x) => <mesh key={x} castShadow position={[x, 0.68, 0]}><boxGeometry args={[0.045, 1.16, 0.65]} /><meshStandardMaterial color="#b9c5c4" metalness={0.78} roughness={0.23} /></mesh>)}
      <mesh castShadow position={[0, 1.22, 0]}><boxGeometry args={[0.76, 0.045, 0.67]} /><meshStandardMaterial color="#b9c5c4" metalness={0.78} roughness={0.23} /></mesh>
      <mesh castShadow position={[0, 0.62, 0]}><boxGeometry args={[0.57, 0.72, 0.51]} /><meshStandardMaterial color={accent} roughness={0.5} metalness={0.09} /></mesh>
    </group>
  );
}

function WarehouseObstacle({ index }: { index: number }) {
  const accents = ["#d57542", "#337d91", "#a86068", "#788b52"];
  const accent = accents[index % accents.length];
  const type = index % 4;
  return (
    <group>
      {type === 0 && <PalletStack accent={accent} />}
      {type === 1 && <DrumCluster accent={accent} />}
      {type === 2 && <SafetyBarrier />}
      {type === 3 && <MobileCage accent={accent} />}
    </group>
  );
}

function RouteRibbon({ route }: { route: Coordinate[] }) {
  const geometry = useMemo(() => {
    if (route.length < 2) return null;
    const points = route.map((point) => new THREE.Vector3(point.x, 0.045, point.z));
    const curve = new THREE.CatmullRomCurve3(points, false, "centripetal", 0.18);
    return new THREE.TubeGeometry(curve, Math.max(24, route.length * 12), 0.037, 8, false);
  }, [route]);
  useEffect(() => () => geometry?.dispose(), [geometry]);
  if (!geometry) return null;
  return (
    <group>
      <mesh geometry={geometry}>
        <meshStandardMaterial color="#58d8d0" emissive="#137c79" emissiveIntensity={1.4} metalness={0.18} roughness={0.3} />
      </mesh>
      {route.filter((_, index) => index > 0 && index < route.length - 1 && index % 2 === 0).map((point, index) => (
        <mesh key={index} position={[point.x, 0.08, point.z]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.09, 0.14, 20]} />
          <meshBasicMaterial color="#a8fff5" transparent opacity={0.88} />
        </mesh>
      ))}
    </group>
  );
}

function StartBeacon() {
  return (
    <group position={[0, 0.02, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.24, 0.36, 32]} /><meshBasicMaterial color="#49b8ff" /></mesh>
      <mesh position={[0, 0.1, 0]}><cylinderGeometry args={[0.11, 0.2, 0.18, 24]} /><meshStandardMaterial color="#1f5a8f" emissive="#1774a4" emissiveIntensity={1.2} /></mesh>
      <pointLight color="#4ecfff" intensity={2.4} distance={2.5} position={[0, 0.45, 0]} />
    </group>
  );
}

function GoalDock() {
  return (
    <group position={[0, 0.02, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.27, 0.43, 32]} /><meshBasicMaterial color="#ffb84d" /></mesh>
      <mesh position={[0, 0.04, 0]}><cylinderGeometry args={[0.23, 0.25, 0.08, 32]} /><meshStandardMaterial color="#9d542d" metalness={0.5} roughness={0.37} /></mesh>
      <mesh position={[0, 0.14, 0]}><cylinderGeometry args={[0.14, 0.14, 0.12, 24]} /><meshStandardMaterial color="#ffd68a" emissive="#e8802b" emissiveIntensity={1.8} /></mesh>
      <pointLight color="#ffad4f" intensity={2.8} distance={3.2} position={[0, 0.6, 0]} />
    </group>
  );
}

function Limb({ side, phase, arm, active }: { side: -1 | 1; phase: number; arm: boolean; active: boolean }) {
  const upper = useRef<THREE.Group>(null);
  const lower = useRef<THREE.Group>(null);
  useFrame((state) => {
    const cycle = active
      ? Math.sin(state.clock.elapsedTime * 6.5 + phase) * 0.48
      : Math.sin(state.clock.elapsedTime * 1.6 + phase) * 0.025;
    const swing = cycle * (side === 1 ? 1 : -1);
    if (upper.current) upper.current.rotation.x = swing;
    if (lower.current) lower.current.rotation.x = arm ? -swing * 0.58 : -swing * 0.48;
  });
  if (arm) {
    return (
      <group ref={upper} position={[side * 0.36, 1.86, 0]} rotation={[0, 0, side * -0.08]}>
        <mesh castShadow position={[0, -0.27, 0]}><capsuleGeometry args={[0.105, 0.36, 8, 16]} /><meshPhysicalMaterial color="#e1e9e7" metalness={0.78} roughness={0.28} /></mesh>
        <group ref={lower} position={[0, -0.48, 0.05]}>
          <mesh castShadow position={[0, -0.1, 0]}><capsuleGeometry args={[0.088, 0.32, 8, 16]} /><meshPhysicalMaterial color="#c8d6d5" metalness={0.72} roughness={0.31} /></mesh>
          <mesh castShadow position={[0, -0.31, 0.03]}><sphereGeometry args={[0.12, 18, 18]} /><meshStandardMaterial color="#2e5157" metalness={0.68} roughness={0.25} /></mesh>
        </group>
        <mesh position={[0, -0.27, 0.105]}><sphereGeometry args={[0.08, 16, 16]} /><meshStandardMaterial color="#37d6d2" emissive="#0d7776" emissiveIntensity={1.35} /></mesh>
      </group>
    );
  }
  return (
    <group ref={upper} position={[side * 0.19, 1.12, 0]}>
      <mesh castShadow position={[0, -0.3, 0]}><capsuleGeometry args={[0.135, 0.43, 8, 16]} /><meshPhysicalMaterial color="#dce6e5" metalness={0.78} roughness={0.28} /></mesh>
      <group ref={lower} position={[0, -0.55, 0.045]}>
        <mesh castShadow position={[0, -0.14, 0]}><capsuleGeometry args={[0.115, 0.43, 8, 16]} /><meshPhysicalMaterial color="#c5d4d2" metalness={0.73} roughness={0.31} /></mesh>
        <mesh castShadow position={[0, -0.44, 0.07]}><boxGeometry args={[0.25, 0.12, 0.44]} /><meshStandardMaterial color="#1d292e" metalness={0.55} roughness={0.45} /></mesh>
      </group>
      <mesh position={[0, -0.3, 0.12]}><sphereGeometry args={[0.084, 16, 16]} /><meshStandardMaterial color="#f1ae43" emissive="#bd681f" emissiveIntensity={1.05} /></mesh>
    </group>
  );
}

function HumanoidRobot({ position, route, routeIndex, active }: { position: Coordinate; route: Coordinate[]; routeIndex: number; active: boolean }) {
  const robot = useRef<THREE.Group>(null);
  const target = useRef(new THREE.Vector3(position.x, 0, position.z));
  const current = useRef(new THREE.Vector3(position.x, 0, position.z));
  const yaw = useRef(0);

  useEffect(() => {
    target.current.set(position.x, 0, position.z);
    const next = route[routeIndex + 1] ?? route[routeIndex] ?? position;
    yaw.current = Math.atan2(next.x - position.x, next.z - position.z);
  }, [position.x, position.z, route, routeIndex]);

  useFrame((state, delta) => {
    if (!robot.current) return;
    current.current.lerp(target.current, Math.min(1, delta * 4.9));
    robot.current.position.copy(current.current);
    robot.current.rotation.y = THREE.MathUtils.damp(robot.current.rotation.y, yaw.current, 8, delta);
    robot.current.position.y = active ? Math.abs(Math.sin(state.clock.elapsedTime * 6.5)) * 0.035 : 0;
  });

  return (
    <group ref={robot}>
      <mesh castShadow receiveShadow position={[0, 0.08, 0]}><cylinderGeometry args={[0.33, 0.39, 0.13, 32]} /><meshStandardMaterial color="#1d3036" metalness={0.72} roughness={0.32} /></mesh>
      <Limb side={-1} phase={0} arm={false} active={active} />
      <Limb side={1} phase={Math.PI} arm={false} active={active} />
      <mesh castShadow position={[0, 1.4, 0]}><capsuleGeometry args={[0.3, 0.55, 10, 20]} /><meshPhysicalMaterial color="#e7efed" metalness={0.8} roughness={0.24} clearcoat={0.32} /></mesh>
      <mesh castShadow position={[0, 1.5, 0.25]}><boxGeometry args={[0.38, 0.42, 0.06]} /><meshPhysicalMaterial color="#183a43" metalness={0.65} roughness={0.2} clearcoat={0.55} /></mesh>
      <mesh position={[0, 1.47, 0.286]}><boxGeometry args={[0.2, 0.08, 0.02]} /><meshStandardMaterial color="#57eee0" emissive="#159a92" emissiveIntensity={2.2} /></mesh>
      <mesh castShadow position={[0, 1.91, -0.1]}><boxGeometry args={[0.47, 0.62, 0.19]} /><meshStandardMaterial color="#31484c" metalness={0.74} roughness={0.28} /></mesh>
      <Limb side={-1} phase={Math.PI} arm active={active} />
      <Limb side={1} phase={0} arm active={active} />
      <mesh castShadow position={[0, 1.93, 0]}><cylinderGeometry args={[0.09, 0.09, 0.16, 20]} /><meshStandardMaterial color="#536c70" metalness={0.82} roughness={0.22} /></mesh>
      <group position={[0, 2.2, 0.02]}>
        <mesh castShadow><boxGeometry args={[0.54, 0.47, 0.46]} /><meshPhysicalMaterial color="#e5eeec" metalness={0.8} roughness={0.19} clearcoat={0.42} /></mesh>
        <mesh position={[0, -0.015, 0.239]}><boxGeometry args={[0.43, 0.2, 0.026]} /><meshPhysicalMaterial color="#122d37" metalness={0.56} roughness={0.14} emissive="#14586a" emissiveIntensity={0.42} /></mesh>
        <mesh position={[0, 0.005, 0.258]}><boxGeometry args={[0.25, 0.036, 0.012]} /><meshStandardMaterial color="#58f4e7" emissive="#159c95" emissiveIntensity={2.5} /></mesh>
        <mesh position={[0, 0.28, 0]}><cylinderGeometry args={[0.08, 0.08, 0.05, 20]} /><meshStandardMaterial color="#31494d" metalness={0.82} roughness={0.19} /></mesh>
      </group>
      <pointLight color="#61eee1" intensity={1.7} distance={2.4} position={[0, 1.9, 0.5]} />
    </group>
  );
}

function InteractionLayer({ width, depth, onCellClick }: Pick<ArenaProps, "width" | "depth" | "onCellClick">) {
  return (
    <>
      {Array.from({ length: width * depth }, (_, index) => {
        const cell = { x: index % width, z: Math.floor(index / width) };
        return (
          <mesh
            key={cellKey(cell)}
            position={[cell.x, 0.026, cell.z]}
            rotation={[-Math.PI / 2, 0, 0]}
            onClick={(event) => {
              event.stopPropagation();
              onCellClick(cell);
            }}
          >
            <planeGeometry args={[0.93, 0.93]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
        );
      })}
    </>
  );
}

function CameraRig({ mode, width, depth, focus }: { mode: CameraMode; width: number; depth: number; focus: Coordinate }) {
  const { camera } = useThree();
  const targetPosition = useRef(new THREE.Vector3());
  const targetLookAt = useRef(new THREE.Vector3());
  const active = useRef(1);

  useEffect(() => {
    const center = new THREE.Vector3((width - 1) / 2, 0.65, (depth - 1) / 2);
    if (mode === "robot") {
      targetPosition.current.set(focus.x + 4.6, 4.15, focus.z + 5.6);
      targetLookAt.current.set(focus.x, 1.15, focus.z);
    } else if (mode === "aisle") {
      targetPosition.current.set(width - 0.45, 2.9, 1.7);
      targetLookAt.current.set(center.x - 1.3, 0.72, center.z);
    } else {
      targetPosition.current.set(width * 0.92, Math.max(9.2, depth * 0.95), depth * 1.38);
      targetLookAt.current.copy(center);
    }
    active.current = 1.05;
  }, [depth, focus.x, focus.z, mode, width]);

  useFrame((_, delta) => {
    if (active.current <= 0) return;
    const speed = 1 - Math.exp(-delta * 4.4);
    camera.position.lerp(targetPosition.current, speed);
    camera.lookAt(targetLookAt.current);
    active.current -= delta;
  });
  return null;
}

const ArenaScene = memo(function ArenaScene(props: ArenaProps) {
  const obstacleSet = new Set(props.obstacles.map(cellKey));
  const route = props.simulation?.route ?? [];
  const robotPosition = props.simulation?.position ?? props.start;
  const active = props.simulation?.status === "running";
  const centerX = (props.width - 1) / 2;
  const centerZ = (props.depth - 1) / 2;
  return (
    <>
      <color attach="background" args={["#10191c"]} />
      <fog attach="fog" args={["#10191c", 15, 36]} />
      <hemisphereLight intensity={1.18} color="#d7edf2" groundColor="#172226" />
      <directionalLight castShadow position={[7, 12, 3]} intensity={2.45} color="#fff2d2" shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-bias={-0.00015} />
      <pointLight color="#4fd5cf" intensity={3.2} distance={10} position={[-4, 3.5, 2]} />
      <group position={[-centerX, 0, -centerZ]}>
        <WarehouseShell width={props.width} depth={props.depth} />
        <RouteRibbon route={route} />
        <InteractionLayer width={props.width} depth={props.depth} onCellClick={props.onCellClick} />
        {props.obstacles.map((obstacle, index) => (
          <group key={cellKey(obstacle)} position={[obstacle.x, 0, obstacle.z]}><WarehouseObstacle index={index} /></group>
        ))}
        {!obstacleSet.has(cellKey(props.start)) && <group position={[props.start.x, 0, props.start.z]}><StartBeacon /></group>}
        {!obstacleSet.has(cellKey(props.goal)) && <group position={[props.goal.x, 0, props.goal.z]}><GoalDock /></group>}
        <HumanoidRobot position={robotPosition} route={route} routeIndex={props.simulation?.route_index ?? 0} active={active} />
      </group>
      <ContactShadows position={[0, -0.105, 0]} opacity={0.45} scale={34} blur={2.8} far={18} color="#071115" />
      <CameraRig mode={props.cameraMode} width={props.width} depth={props.depth} focus={robotPosition} />
      <OrbitControls makeDefault target={[0, 0.4, 0]} minDistance={5.5} maxDistance={32} maxPolarAngle={Math.PI / 2.04} enableDamping dampingFactor={0.08} />
    </>
  );
});

export function Arena3D(props: ArenaProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      camera={{ position: [11, 10, 14], fov: 43, near: 0.1, far: 100 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
    >
      <ArenaScene {...props} />
    </Canvas>
  );
}
