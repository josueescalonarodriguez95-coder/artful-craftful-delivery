import { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, useTexture } from "@react-three/drei";
import * as THREE from "three";

interface Pedestal3DViewerProps {
  /** Height in inches (Y axis) */
  height: number;
  /** Width in inches (X axis) */
  width: number;
  /** Depth in inches (Z axis) */
  depth: number;
  /** Hex color fallback for the pedestal surface */
  color: string;
  /** Material finish style */
  finish: "matte" | "lacquer" | "acrylic" | "marble" | "natural";
  /** Texture URL (the same flat photo) used to skin the pedestal realistically */
  textureUrl: string;
}

const PedestalMesh = ({
  height,
  width,
  depth,
  color,
  finish,
  textureUrl,
}: Pedestal3DViewerProps) => {
  // Normalize to a viewer-friendly size while preserving proportions
  const maxDim = Math.max(height || 1, width || 1, depth || 1);
  const scale = 2.4 / maxDim;
  const w = (width || 14) * scale;
  const h = (height || 36) * scale;
  const d = (depth || 14) * scale;

  const baseTex = useTexture(textureUrl);

  // Build per-face textures by cropping the source image:
  // - Front/back/left/right: a vertical slice in the middle (the pedestal itself)
  // - Top/bottom: a smaller square crop centered horizontally
  const { sideMat, topMat } = useMemo(() => {
    const baseColor = new THREE.Color(color);

    const makeTex = (cropRect?: { x: number; y: number; w: number; h: number }, flipY = false) => {
      const t = baseTex.clone();
      t.needsUpdate = true;
      t.colorSpace = THREE.SRGBColorSpace;
      t.wrapS = THREE.ClampToEdgeWrapping;
      t.wrapT = THREE.ClampToEdgeWrapping;
      t.anisotropy = 8;
      if (cropRect) {
        t.repeat.set(cropRect.w, cropRect.h);
        t.offset.set(cropRect.x, cropRect.y);
      }
      if (flipY) t.repeat.y = -Math.abs(t.repeat.y);
      return t;
    };

    // Vertical strip down the middle of the photo (assumes pedestal is centered)
    const sideTex = makeTex({ x: 0.32, y: 0.05, w: 0.36, h: 0.92 });
    // Top — small square near upper portion
    const topTex = makeTex({ x: 0.34, y: 0.78, w: 0.32, h: 0.12 });

    const baseProps = {
      map: sideTex,
      color: baseColor,
    } as const;

    let side: THREE.Material;
    let top: THREE.Material;

    switch (finish) {
      case "lacquer":
        side = new THREE.MeshPhysicalMaterial({
          ...baseProps,
          metalness: 0.25,
          roughness: 0.12,
          clearcoat: 0.9,
          clearcoatRoughness: 0.08,
        });
        top = new THREE.MeshPhysicalMaterial({
          map: topTex,
          color: baseColor,
          metalness: 0.25,
          roughness: 0.12,
          clearcoat: 0.9,
          clearcoatRoughness: 0.08,
        });
        break;
      case "acrylic":
        side = new THREE.MeshPhysicalMaterial({
          ...baseProps,
          metalness: 0.1,
          roughness: 0.08,
          clearcoat: 1,
          clearcoatRoughness: 0.05,
          transmission: 0.35,
          thickness: 0.4,
          ior: 1.49,
          transparent: true,
          opacity: 0.92,
        });
        top = new THREE.MeshPhysicalMaterial({
          map: topTex,
          color: baseColor,
          metalness: 0.1,
          roughness: 0.08,
          clearcoat: 1,
          clearcoatRoughness: 0.05,
        });
        break;
      case "marble":
        side = new THREE.MeshPhysicalMaterial({
          ...baseProps,
          roughness: 0.28,
          metalness: 0.04,
          clearcoat: 0.5,
          clearcoatRoughness: 0.18,
        });
        top = new THREE.MeshPhysicalMaterial({
          map: topTex,
          color: baseColor,
          roughness: 0.28,
          metalness: 0.04,
          clearcoat: 0.5,
          clearcoatRoughness: 0.18,
        });
        break;
      case "natural":
        side = new THREE.MeshStandardMaterial({
          ...baseProps,
          roughness: 0.7,
          metalness: 0.02,
        });
        top = new THREE.MeshStandardMaterial({
          map: topTex,
          color: baseColor,
          roughness: 0.7,
          metalness: 0.02,
        });
        break;
      case "matte":
      default:
        side = new THREE.MeshStandardMaterial({
          ...baseProps,
          roughness: 0.55,
          metalness: 0.04,
        });
        top = new THREE.MeshStandardMaterial({
          map: topTex,
          color: baseColor,
          roughness: 0.55,
          metalness: 0.04,
        });
    }
    return { sideMat: side, topMat: top };
  }, [baseTex, color, finish]);

  // BoxGeometry material order: +X, -X, +Y, -Y, +Z, -Z
  const materials = useMemo(
    () => [sideMat, sideMat, topMat, topMat, sideMat, sideMat],
    [sideMat, topMat]
  );

  return (
    <group position={[0, h / 2 - 1.2, 0]}>
      <mesh castShadow receiveShadow material={materials}>
        <boxGeometry args={[w, h, d]} />
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
  textureUrl,
}: Pedestal3DViewerProps) => {
  return (
    <div className="relative w-full h-[60vh] md:h-[70vh] bg-cream rounded-md overflow-hidden touch-none select-none">
      <Canvas
        shadows
        camera={{ position: [3.5, 2.2, 4.5], fov: 35 }}
        dpr={[1, 2]}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
      >
        <color attach="background" args={["#f4ede4"]} />
        <ambientLight intensity={0.45} />
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
            textureUrl={textureUrl}
          />
          <ContactShadows
            position={[0, -1.2, 0]}
            opacity={0.45}
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
