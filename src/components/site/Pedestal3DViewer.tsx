import { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, useTexture } from "@react-three/drei";
import * as THREE from "three";
import plywoodNatural from "@/assets/pedestal-plywood-natural.jpg";
import acrylicClear from "@/assets/pedestal-acrylic-clear.jpg";
import acrylicBlack from "@/assets/pedestal-acrylic-black.jpg";
import acrylicWhite from "@/assets/pedestal-acrylic-white.jpg";
import marbleWhite from "@/assets/pedestal-marble-white.jpg";
import marbleBlack from "@/assets/pedestal-marble-black.jpg";

interface Pedestal3DViewerProps {
  height: number;
  width: number;
  depth: number;
  color: string;
  finish: "matte" | "lacquer" | "acrylic" | "marble" | "natural";
  /** Optional sub-variant to pick the correct photo texture (e.g. "black", "white", "clear") */
  variant?: string;
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

// Subtle paint tooth
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

// ---------- Photo-based texture (cropped from product photo) ----------
// Crops the central pedestal column from the flat product photo and uses it as a tiling texture.
const cropPhotoTexture = (img: HTMLImageElement, opts: { x: number; y: number; w: number; h: number; size?: number }) => {
  const size = opts.size ?? 512;
  const c = makeCanvas(size);
  const ctx = c.getContext("2d")!;
  const sx = opts.x * img.width;
  const sy = opts.y * img.height;
  const sw = opts.w * img.width;
  const sh = opts.h * img.height;
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
};

const PHOTO_FOR = {
  natural: plywoodNatural,
  marbleWhite,
  marbleBlack,
  acrylicClear,
  acrylicBlack,
  acrylicWhite,
} as const;

// ---------- Mesh ----------

const PedestalMesh = ({
  height,
  width,
  depth,
  color,
  finish,
  variant,
}: Pedestal3DViewerProps) => {
  const maxDim = Math.max(height || 1, width || 1, depth || 1);
  const scale = 2.4 / maxDim;
  const w = (width || 14) * scale;
  const h = (height || 36) * scale;
  const d = (depth || 14) * scale;

  // Pick photo texture path for materials that need real photo
  const photoUrl = useMemo(() => {
    if (finish === "natural") return PHOTO_FOR.natural;
    if (finish === "marble") return variant === "black" ? PHOTO_FOR.marbleBlack : PHOTO_FOR.marbleWhite;
    if (finish === "acrylic") {
      if (variant === "black") return PHOTO_FOR.acrylicBlack;
      if (variant === "white") return PHOTO_FOR.acrylicWhite;
      return PHOTO_FOR.acrylicClear;
    }
    return null;
  }, [finish, variant]);

  // Always call the hook; pass empty array if no photo to load
  const loadedPhoto = useTexture(photoUrl ? [photoUrl] : []);
  const photoTex = (loadedPhoto as THREE.Texture[])[0] ?? null;

  const materials = useMemo(() => {
    const baseColor = new THREE.Color(color);

    // Build per-face materials (right, left, top, bottom, front, back)
    const buildFromPhoto = (img: HTMLImageElement | undefined) => {
      if (!img) return null;
      // Side: vertical strip from middle of photo (the column itself)
      const sideTex = cropPhotoTexture(img, { x: 0.34, y: 0.06, w: 0.32, h: 0.9 });
      // Top: small strip near the top of the column
      const topTex = cropPhotoTexture(img, { x: 0.36, y: 0.06, w: 0.28, h: 0.18 });

      const isMarble = finish === "marble";
      const isAcrylic = finish === "acrylic";
      const isClearAcrylic = isAcrylic && variant !== "black" && variant !== "white";

      const makeMat = (map: THREE.Texture) => {
        if (isMarble) {
          return new THREE.MeshPhysicalMaterial({
            map,
            color: new THREE.Color("#ffffff"),
            roughness: 0.16,
            metalness: 0.02,
            clearcoat: 1,
            clearcoatRoughness: 0.08,
            envMapIntensity: 1.4,
          });
        }
        if (isAcrylic) {
          return new THREE.MeshPhysicalMaterial({
            map,
            color: new THREE.Color("#ffffff"),
            metalness: 0.0,
            roughness: 0.04,
            clearcoat: 1,
            clearcoatRoughness: 0.02,
            transmission: isClearAcrylic ? 0.35 : 0,
            thickness: isClearAcrylic ? 0.5 : 0,
            ior: 1.49,
            transparent: isClearAcrylic,
            opacity: isClearAcrylic ? 0.92 : 1,
            envMapIntensity: 1.6,
          });
        }
        // natural plywood
        return new THREE.MeshStandardMaterial({
          map,
          color: new THREE.Color("#ffffff"),
          roughness: 0.62,
          metalness: 0.04,
          envMapIntensity: 1.2,
        });
      };

      const sideMat = makeMat(sideTex);
      const topMat = makeMat(topTex);
      // order: +X, -X, +Y, -Y, +Z, -Z
      return [sideMat, sideMat, topMat, topMat, sideMat, sideMat];
    };

    if ((finish === "natural" || finish === "marble" || finish === "acrylic") && photoTex?.image) {
      const mats = buildFromPhoto(photoTex.image as HTMLImageElement);
      if (mats) return mats;
    }

    // Lacquer — boost metallic look, especially silver/gold
    if (finish === "lacquer") {
      const isSilver = Math.abs(baseColor.r - 0.749) < 0.08 && Math.abs(baseColor.g - 0.761) < 0.08 && Math.abs(baseColor.b - 0.78) < 0.08;
      const isGold = Math.abs(baseColor.r - 0.787) < 0.1 && Math.abs(baseColor.g - 0.643) < 0.1;
      const isMetallic = isSilver || isGold;
      const silverColor = isSilver ? new THREE.Color("#d8dade") : baseColor;
      const finalColor = isSilver ? silverColor : baseColor;
      const mat = new THREE.MeshPhysicalMaterial({
        color: finalColor,
        metalness: isMetallic ? 1.0 : 0.2,
        roughness: isSilver ? 0.18 : isGold ? 0.25 : 0.08,
        clearcoat: 1,
        clearcoatRoughness: 0.05,
        envMapIntensity: isMetallic ? 1.8 : 1.2,
      });
      return mat;
    }

    // matte paint
    const map = makePaintTexture(color);
    return new THREE.MeshStandardMaterial({
      map,
      color: baseColor,
      roughness: 0.78,
      metalness: 0.02,
    });
  }, [color, finish, variant, photoTex]);

  return (
    <group position={[0, h / 2 - 1.2, 0]}>
      <mesh castShadow receiveShadow material={materials as any}>
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
  variant,
}: Pedestal3DViewerProps) => {
  return (
    <div className="relative w-full h-[60vh] md:h-[70vh] bg-cream rounded-md overflow-hidden touch-none select-none">
      <Canvas
        shadows
        camera={{ position: [3.5, 2.2, 4.5], fov: 35 }}
        dpr={[1, 2]}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.25 }}
      >
        <color attach="background" args={["#ede4d6"]} />
        <ambientLight intensity={0.55} />
        <directionalLight
          position={[5, 8, 5]}
          intensity={1.6}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight position={[-5, 4, -3]} intensity={0.55} color="#fff4e0" />
        <directionalLight position={[0, 3, 6]} intensity={0.4} color="#e0ecff" />
        <Suspense fallback={null}>
          <PedestalMesh
            height={height}
            width={width}
            depth={depth}
            color={color}
            finish={finish}
            variant={variant}
          />
          <ContactShadows
            position={[0, -1.2, 0]}
            opacity={0.55}
            scale={10}
            blur={2.2}
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
