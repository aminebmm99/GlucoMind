import { Canvas, useFrame } from "@react-three/fiber";
import { Line, PointMaterial, Points, Sphere, Stars } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "../hooks/useReducedMotion";
import type { GlucoseReading } from "../types/api";
import type { Group } from "three";

interface ImmersiveSceneProps {
  readings?: GlucoseReading[];
  variant?: "auth" | "dashboard" | "profile";
  className?: string;
}

function Molecule() {
  const group = useRef<Group>(null);

  useFrame(() => {
    if (!group.current) return;
    const elapsed = performance.now() / 1000;
    group.current.rotation.y = elapsed * 0.09;
    group.current.rotation.x = Math.sin(elapsed * 0.15) * 0.12;
  });

  return (
    <group ref={group}>
      <Line points={[[0, 0, 0], [1.35, 0.62, 0.15], [2.55, -0.15, -0.12], [3.7, 0.55, 0.18]]} color="#84dec0" lineWidth={1.3} transparent opacity={0.48} />
      <Sphere args={[0.27, 32, 32]} position={[0, 0, 0]}>
        <meshPhysicalMaterial color="#a8f2da" roughness={0.22} metalness={0.16} transmission={0.24} thickness={0.8} clearcoat={0.8} />
      </Sphere>
      <Sphere args={[0.18, 24, 24]} position={[1.35, 0.62, 0.15]}>
        <meshPhysicalMaterial color="#5bc9ab" roughness={0.2} metalness={0.25} clearcoat={1} />
      </Sphere>
      <Sphere args={[0.3, 32, 32]} position={[2.55, -0.15, -0.12]}>
        <meshPhysicalMaterial color="#d5f6e9" roughness={0.18} metalness={0.08} transmission={0.3} thickness={1} clearcoat={1} />
      </Sphere>
      <Sphere args={[0.2, 28, 28]} position={[3.7, 0.55, 0.18]}>
        <meshPhysicalMaterial color="#73d7b9" roughness={0.25} metalness={0.2} clearcoat={0.9} />
      </Sphere>
      <Sphere args={[0.13, 20, 20]} position={[-0.9, -0.5, -0.2]}>
        <meshPhysicalMaterial color="#83dbbf" roughness={0.3} metalness={0.12} />
      </Sphere>
      <Line points={[[0, 0, 0], [-0.9, -0.5, -0.2]]} color="#84dec0" lineWidth={1} transparent opacity={0.36} />
    </group>
  );
}

function ParticleField({ reducedMotion }: { reducedMotion: boolean }) {
  const ref = useRef<import("three").Points>(null);
  const positions = useMemo(() => {
    const count = reducedMotion ? 80 : 260;
    const values = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const seedA = Math.sin((i + 1) * 127.1) * 43758.5453;
      const seedB = Math.sin((i + 1) * 269.5) * 24634.6345;
      const seedC = Math.sin((i + 1) * 419.2) * 56445.2341;
      values[i * 3] = (seedA - Math.floor(seedA) - 0.5) * 11;
      values[i * 3 + 1] = (seedB - Math.floor(seedB) - 0.5) * 7;
      values[i * 3 + 2] = (seedC - Math.floor(seedC) - 0.5) * 5;
    }
    return values;
  }, [reducedMotion]);

  useFrame(() => {
    if (!ref.current || reducedMotion) return;
    const elapsed = performance.now() / 1000;
    ref.current.rotation.y = elapsed * 0.012;
    ref.current.position.y = Math.sin(elapsed * 0.12) * 0.12;
  });

  return (
    <Points positions={positions} ref={ref} stride={3}>
      <PointMaterial transparent color="#9be3ca" size={0.025} sizeAttenuation depthWrite={false} opacity={0.62} />
    </Points>
  );
}

function SceneMotion({ reducedMotion }: { reducedMotion: boolean }) {
  useFrame((state, delta) => {
    if (reducedMotion) return;
    const targetX = state.pointer.x * 0.22;
    const targetY = state.pointer.y * 0.12;
    state.camera.position.x += (targetX - state.camera.position.x) * Math.min(delta * 0.55, 0.025);
    state.camera.position.y += (targetY - state.camera.position.y) * Math.min(delta * 0.55, 0.025);
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

function DataSpine({ readings }: { readings: GlucoseReading[] }) {
  const normalized = readings.slice(0, 32).reverse();
  if (normalized.length < 2) return null;
  const points = normalized.map((reading, index) => {
    const raw = reading.unit === "mmol/L" ? reading.glucoseValue * 18.0182 : reading.glucoseValue;
    const bounded = Math.max(40, Math.min(raw, 300));
    const position = (bounded - 40) / 260;
    return [index * 0.19 - ((normalized.length - 1) * 0.19) / 2, (position - 0.5) * 2.3, Math.sin(index * 0.45) * 0.12] as [number, number, number];
  });

  return (
    <group position={[0, -1.7, 0.1]}>
      <Line points={points} color="#81e0bd" lineWidth={2} transparent opacity={0.75} />
      {points.map((point, index) => (
        <Sphere key={`${normalized[index].measuredAt}-${index}`} args={[0.055, 14, 14]} position={point}>
          <meshStandardMaterial color="#c2f5e3" emissive="#55bd9d" emissiveIntensity={0.35} />
        </Sphere>
      ))}
    </group>
  );
}

function SceneContent({ readings, variant, reducedMotion, compact }: Required<Pick<ImmersiveSceneProps, "readings" | "variant">> & { reducedMotion: boolean; compact: boolean }) {
  const isDashboard = variant === "dashboard";
  const isProfile = variant === "profile";

  return (
    <>
      <color attach="background" args={isDashboard ? ["#0c2728"] : ["#092d2d"]} />
      <fog attach="fog" args={[isDashboard ? "#0c2728" : "#092d2d", 7, 18]} />
      <ambientLight intensity={0.85} />
      <pointLight position={[3, 4, 5]} color="#a9f4d5" intensity={26} distance={15} />
      <pointLight position={[-5, -3, 3]} color="#32a58c" intensity={18} distance={14} />
      <SceneMotion reducedMotion={reducedMotion} />
      {!reducedMotion && <Stars radius={28} depth={20} count={compact ? 150 : 550} factor={1.1} saturation={0} fade speed={0.08} />}
      <ParticleField reducedMotion={reducedMotion} />
      {isDashboard ? <DataSpine readings={readings} /> : <Molecule />}
      <mesh position={[0, -3.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 30, 1, 1]} />
        <meshStandardMaterial color="#0a2427" roughness={0.82} metalness={0.12} transparent opacity={isProfile ? 0.38 : 0.58} />
      </mesh>
      <mesh position={[0, -3.13, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.7, 3.72, 96]} />
        <meshBasicMaterial color="#77dbb9" transparent opacity={0.2} />
      </mesh>
    </>
  );
}

export default function ImmersiveScene({ readings = [], variant = "auth", className = "" }: ImmersiveSceneProps) {
  const reducedMotion = useReducedMotion();
  const [compact, setCompact] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(max-width: 720px)").matches,
  );

  useEffect(() => {
    const query = window.matchMedia("(max-width: 720px)");
    const update = () => setCompact(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return (
    <div className={`immersive-scene ${className}`} aria-hidden="true">
      <Canvas
        dpr={compact ? [0.75, 1] : [1, 1.5]}
        camera={{ position: [0, 0.1, 8], fov: 43 }}
        gl={{ alpha: false, antialias: false, powerPreference: "low-power" }}
        frameloop={reducedMotion ? "demand" : "always"}
      >
        <Suspense fallback={null}>
          <SceneContent readings={readings} variant={variant} reducedMotion={reducedMotion} compact={compact} />
        </Suspense>
      </Canvas>
      <div className="scene-grain" />
      <div className="scene-vignette" />
    </div>
  );
}