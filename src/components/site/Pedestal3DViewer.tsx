import { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

interface Pedestal3DViewerProps {
  /** Height in inches (Y axis) */
  height: number;
  /** Width in inches (X axis) */
  width: number;
  /** Depth in inches (Z axis) */
  depth: number;
  /** Hex color for the pedestal surface */
  color: string;
  /** Material finish style */
  finish: "matte" | "lacquer" | "acrylic" | "marble" | "natural";
  /** Optional texture URL (image) wrapped on the pedestal */
  textureUrl?: string;
}

const PedestalMesh = ({
  height,
  width,
  depth,
  color,
  finish,
}: Omit<Pedestal3DViewerProps, "textureUrl">) => {
  // Normalize to a viewer-friendly size while preserving proportions
  const maxDim = Math.max(height || 1, width || 1, depth || 1);
  const scale = 2.4 / maxDim;
  const w = (width || 14) * scale;
  const h = (height || 36) * scale;
  const d = (depth || 14) * scale;

  const material = useMemo(() => {
    const baseColor = new THREE.Color(color);
    switch (finish) {
      case "lacquer":
        return new THREE.MeshPhysicalMaterial({
          color: baseColor,
          metalness: 0.3,
          roughness: 0.08,
          clearcoat: 1,
          clearcoatRoughness: 0.05,
        });
      case "acrylic":
        return new THREE.MeshPhysicalMaterial({
          color: baseColor,
          metalness: 0.1,
          roughness: 0.05,
          transmission: 0.85,
          thickness: 0.5,
          ior: 1.49,
          transparent: true,
          opacity: 0.6,
        });
      case "marble":
        return new THREE.MeshPhysicalMaterial({
          color: baseColor,
          metalness: 0.05,
          roughness: 0.25,
          clearcoat: 0.4,
          clearcoatRoughness: 0.2,
        });
      case "natural":
        return new THREE.MeshStandardMaterial({
          color: baseColor,
          roughness: 0.75,
          metalness: 0.02,
        });
      case "matte":
      default:
        return new THREE.MeshStandardMaterial({
          color: baseColor,
          roughness: 0.6,
          metalness: 0.05,
        });
    }
  }, [color, finish]);

  return (
    <group position={[0, h / 2 - 1.2, 0]}>
      <mesh castShadow receiveShadow material={material}>
        <boxGeometry args={[w, h, d]} />
      </mesh>
      {/* Subtle top edge highlight via slightly inset top plate for definition */}
      <mesh position={[0, h / 2 + 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w * 0.999, d * 0.999]} />
        <meshStandardMaterial
          color={color}
          roughness={finish === "lacquer" ? 0.1 : 0.5}
          metalness={0.05}
        />
      </mesh>
    </group>
  );
};

export const Pedestal3DViewer = ({
  height,
  width,
  depth,
  color,
  finish,
}: Pedestal3DViewerProps) => {
  return (
    <div className="relative w-full h-[60vh] md:h-[70vh] bg-cream rounded-md overflow-hidden touch-none select-none">
      <Canvas
        shadows
        camera={{ position: [3.5, 2.2, 4.5], fov: 35 }}
        dpr={[1, 2]}
      >
        <color attach="background" args={["#f4ede4"]} />
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[5, 8, 5]}
          intensity={1.1}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight position={[-4, 3, -3]} intensity={0.3} />
        <Suspense fallback={null}>
          <PedestalMesh
            height={height}
            width={width}
            depth={depth}
            color={color}
            finish={finish}
          />
          <ContactShadows
            position={[0, -1.2, 0]}
            opacity={0.4}
            scale={10}
            blur={2.4}
            far={4}
          />
          <Environment preset="studio" />
        </Suspense>
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={3}
          maxDistance={10}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.05}
          autoRotate={false}
        />
      </Canvas>
      <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-2 rounded-full bg-ink/80 text-cream text-[10px] uppercase tracking-[0.2em] px-3 py-1.5 backdrop-blur-sm">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 4v5h-5"/></svg>
        Arrastra para rotar · Pinch / scroll para zoom
      </div>
    </div>
  );
};
