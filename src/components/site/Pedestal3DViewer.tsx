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
}

// ---------- Procedural texture helpers ----------

const makeCanvas = (size = 512) => {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  return c;
};

const toTexture = (canvas: HTMLCanvasElement, repeat = 1) => {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat, repeat);
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
};

// Subtle paper/paint tooth — barely-there speckle so flat colors don't look CG
const makePaintTexture = (hex: string) => {
  const c = makeCanvas(256);
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = hex;
  ctx.fillRect(0, 0, 256, 256);
  const img = ctx.getImageData(0, 0, 256, 256);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 6;
    img.data[i] = Math.max(0, Math.min(255, img.data[i] + n));
    img.data[i + 1] = Math.max(0, Math.min(255, img.data[i + 1] + n));
    img.data[i + 2] = Math.max(0, Math.min(255, img.data[i + 2] + n));
  }
  ctx.putImageData(img, 0, 0);
  return toTexture(c, 1);
};

// Wood grain — concentric rings + longitudinal streaks tinted from base color
const makeWoodTexture = (hex: string) => {
  const c = makeCanvas(512);
  const ctx = c.getContext("2d")!;
  const base = new THREE.Color(hex);
  const dark = base.clone().multiplyScalar(0.78);
  const light = base.clone().lerp(new THREE.Color("#ffffff"), 0.18);
  // base wash
  ctx.fillStyle = `rgb(${(base.r * 255) | 0},${(base.g * 255) | 0},${(base.b * 255) | 0})`;
  ctx.fillRect(0, 0, 512, 512);
  // vertical streaks
  for (let x = 0; x < 512; x += 1) {
    const t = (Math.sin(x * 0.06) + Math.sin(x * 0.013) * 0.6 + Math.random() * 0.3) * 0.5 + 0.5;
    const col = base.clone().lerp(t > 0.5 ? light : dark, Math.abs(t - 0.5) * 0.9);
    ctx.fillStyle = `rgb(${(col.r * 255) | 0},${(col.g * 255) | 0},${(col.b * 255) | 0})`;
    ctx.fillRect(x, 0, 1, 512);
  }
  // knots / rings
  for (let k = 0; k < 3; k++) {
    const cx = Math.random() * 512;
    const cy = Math.random() * 512;
    for (let r = 4; r < 70; r += 2) {
      ctx.strokeStyle = `rgba(60,35,15,${0.04 + Math.random() * 0.05})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, r + Math.random() * 1.2, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  return toTexture(c, 1);
};

// Marble veins — soft turbulent base + a few thin veins
const makeMarbleTexture = (hex: string) => {
  const c = makeCanvas(512);
  const ctx = c.getContext("2d")!;
  const base = new THREE.Color(hex);
  const isDark = (base.r + base.g + base.b) / 3 < 0.3;
  ctx.fillStyle = `rgb(${(base.r * 255) | 0},${(base.g * 255) | 0},${(base.b * 255) | 0})`;
  ctx.fillRect(0, 0, 512, 512);
  // cloudy noise
  const img = ctx.getImageData(0, 0, 512, 512);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (Math.random() - 0.5) * (isDark ? 18 : 14);
    img.data[i] = Math.max(0, Math.min(255, img.data[i] + n));
    img.data[i + 1] = Math.max(0, Math.min(255, img.data[i + 1] + n));
    img.data[i + 2] = Math.max(0, Math.min(255, img.data[i + 2] + n));
  }
  ctx.putImageData(img, 0, 0);
  // veins
  const veinColor = isDark ? "rgba(220,220,220,0.55)" : "rgba(120,120,130,0.35)";
  ctx.strokeStyle = veinColor;
  ctx.lineWidth = 1.2;
  for (let v = 0; v < 7; v++) {
    ctx.beginPath();
    let x = Math.random() * 512;
    let y = Math.random() * 512;
    ctx.moveTo(x, y);
    for (let s = 0; s < 60; s++) {
      x += (Math.random() - 0.5) * 28;
      y += (Math.random() - 0.5) * 28;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  // thin secondary veins
  ctx.strokeStyle = isDark ? "rgba(255,255,255,0.18)" : "rgba(80,80,90,0.18)";
  ctx.lineWidth = 0.6;
  for (let v = 0; v < 18; v++) {
    ctx.beginPath();
    let x = Math.random() * 512;
    let y = Math.random() * 512;
    ctx.moveTo(x, y);
    for (let s = 0; s < 25; s++) {
      x += (Math.random() - 0.5) * 18;
      y += (Math.random() - 0.5) * 18;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  return toTexture(c, 1);
};

// ---------- Mesh ----------

const PedestalMesh = ({
  height,
  width,
  depth,
  color,
  finish,
}: Pedestal3DViewerProps) => {
  const maxDim = Math.max(height || 1, width || 1, depth || 1);
  const scale = 2.4 / maxDim;
  const w = (width || 14) * scale;
  const h = (height || 36) * scale;
  const d = (depth || 14) * scale;

  const material = useMemo(() => {
    const baseColor = new THREE.Color(color);

    if (finish === "marble") {
      const map = makeMarbleTexture(color);
      return new THREE.MeshPhysicalMaterial({
        map,
        color: baseColor,
        roughness: 0.18,
        metalness: 0.02,
        clearcoat: 0.85,
        clearcoatRoughness: 0.12,
        sheen: 0.2,
      });
    }

    if (finish === "natural") {
      const map = makeWoodTexture(color);
      return new THREE.MeshStandardMaterial({
        map,
        color: baseColor,
        roughness: 0.72,
        metalness: 0.02,
      });
    }

    if (finish === "acrylic") {
      // Clean glossy plastic; transparency only when light color
      const isClear = baseColor.r + baseColor.g + baseColor.b > 2.0;
      return new THREE.MeshPhysicalMaterial({
        color: baseColor,
        metalness: 0.05,
        roughness: 0.06,
        clearcoat: 1,
        clearcoatRoughness: 0.04,
        transmission: isClear ? 0.55 : 0,
        thickness: isClear ? 0.6 : 0,
        ior: 1.49,
        transparent: isClear,
        opacity: isClear ? 0.9 : 1,
      });
    }

    if (finish === "lacquer") {
      const isMetallic =
        Math.abs(baseColor.r - 0.79) < 0.1 && Math.abs(baseColor.g - 0.64) < 0.1 // gold
        || Math.abs(baseColor.r - 0.75) < 0.05 && Math.abs(baseColor.g - 0.76) < 0.05; // silver
      return new THREE.MeshPhysicalMaterial({
        color: baseColor,
        metalness: isMetallic ? 0.85 : 0.18,
        roughness: isMetallic ? 0.22 : 0.1,
        clearcoat: 1,
        clearcoatRoughness: 0.06,
      });
    }

    // matte paint
    const map = makePaintTexture(color);
    return new THREE.MeshStandardMaterial({
      map,
      color: baseColor,
      roughness: 0.78,
      metalness: 0.02,
    });
  }, [color, finish]);

  return (
    <group position={[0, h / 2 - 1.2, 0]}>
      <mesh castShadow receiveShadow material={material}>
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
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[5, 8, 5]}
          intensity={1.15}
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
