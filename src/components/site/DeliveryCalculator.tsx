import { useState, useMemo, useRef, useEffect } from "react";
import * as THREE from "three";

/* ============================================================
   TARIFAS — edítalas con tus costos reales
   ============================================================ */
const TIERS = {
  eco: { name: "Económico", matFt3: 9,  laborFt3: 11, base: 85,  min: 145, ins: 0.010 },
  std: { name: "Estándar",  matFt3: 14, laborFt3: 18, base: 130, min: 240, ins: 0.015 },
  mus: { name: "Museo",     matFt3: 24, laborFt3: 34, base: 210, min: 480, ins: 0.025 },
} as const;

const MILE_RATE = 2.25;
const MILE_BASE = 65;
const IN_CM = 2.54;

type TierKey = keyof typeof TIERS;
type ViewMode = "solid" | "interior" | "exploded";
type Axis = "l" | "w" | "h";

const round = (n: number, d = 2) => {
  const f = Math.pow(10, d);
  return Math.round((n + Number.EPSILON) * f) / f;
};

/* ============================================================
   TEXTURAS PROCEDURALES (sin archivos externos)
   ============================================================ */
function woodMaps(base: string, dark: string, light: string, grain: number) {
  const S = 512;
  const mk = () => {
    const c = document.createElement("canvas");
    c.width = c.height = S;
    return [c, c.getContext("2d")!] as const;
  };
  const [ca, a] = mk();
  const [cb, b] = mk();
  a.fillStyle = base; a.fillRect(0, 0, S, S);
  b.fillStyle = "#808080"; b.fillRect(0, 0, S, S);

  for (let i = 0; i < grain; i++) {
    const y = Math.random() * S;
    const amp = 3 + Math.random() * 12;
    const w = 0.5 + Math.random() * 2;
    const d = Math.random() > 0.45;
    ([[a, d ? dark : light, 0.075], [b, d ? "#6a6a6a" : "#9c9c9c", 0.28]] as const).forEach(
      ([ctx, st, al]) => {
        ctx.strokeStyle = st as string;
        ctx.globalAlpha = al as number;
        ctx.lineWidth = w;
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x <= S; x += 24) ctx.lineTo(x, y + Math.sin(x / 60 + i * 0.7) * amp);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    );
  }
  for (let i = 0; i < 4; i++) {
    const kx = Math.random() * S, ky = Math.random() * S, r = 18 + Math.random() * 30;
    for (let ring = r; ring > 2; ring -= 3) {
      a.strokeStyle = dark; a.globalAlpha = 0.08; a.lineWidth = 2;
      a.beginPath(); a.ellipse(kx, ky, ring, ring * 0.62, 0, 0, Math.PI * 2); a.stroke();
    }
    a.globalAlpha = 1;
  }
  const tex = (c: HTMLCanvasElement) => {
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = 8;
    return t;
  };
  return { map: tex(ca), bumpMap: tex(cb) };
}

function plyEdge() {
  const c = document.createElement("canvas");
  c.width = 64; c.height = 256;
  const x = c.getContext("2d")!;
  for (let i = 0; i < 7; i++) {
    x.fillStyle = i % 2 ? "#D3B075" : "#B99257";
    x.fillRect(0, (i * 256) / 7, 64, 256 / 7);
    x.fillStyle = "rgba(105,78,45,.4)";
    x.fillRect(0, (i * 256) / 7, 64, 1.5);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

function stencilTex() {
  const c = document.createElement("canvas");
  c.width = 1024; c.height = 512;
  const x = c.getContext("2d")!;
  x.fillStyle = "rgba(58,46,34,.78)";
  x.font = "bold 88px -apple-system,'Helvetica Neue',Impact,sans-serif";
  x.textAlign = "center";
  x.fillText("FRÁGIL", 512, 244);
  x.font = "bold 38px -apple-system,'Helvetica Neue',sans-serif";
  x.fillText("ESTE LADO ARRIBA", 512, 316);
  x.beginPath();
  [300, 724].forEach((px) => {
    x.moveTo(px, 196); x.lineTo(px - 32, 254); x.lineTo(px - 12, 254);
    x.lineTo(px - 12, 312); x.lineTo(px + 12, 312); x.lineTo(px + 12, 254);
    x.lineTo(px + 32, 254); x.closePath();
  });
  x.fill();
  x.globalCompositeOperation = "destination-out";
  for (let i = 0; i < 2600; i++) {
    x.beginPath();
    x.arc(Math.random() * 1024, Math.random() * 512, Math.random() * 3.4, 0, Math.PI * 2);
    x.fill();
  }
  return new THREE.CanvasTexture(c);
}

/* ============================================================
   COMPONENTE
   ============================================================ */
export default function DeliveryCalculator() {
  const [unit, setUnit] = useState<"in" | "cm">("in");
  const [dims, setDims] = useState({ l: 40, w: 30, h: 4 });
  const [padding, setPadding] = useState(2);
  const [ply, setPly] = useState(0.375);
  const [frame, setFrame] = useState(1.5);
  const [tier, setTier] = useState<TierKey>("eco");
  const [view, setView] = useState<ViewMode>("solid");
  const [declared, setDeclared] = useState(5000);
  const [miles, setMiles] = useState(0);
  const [focusAxis, setFocusAxis] = useState<Axis | null>(null);

  const toIn = (v: number) => (unit === "cm" ? v / IN_CM : v);
  const fromIn = (v: number) => (unit === "cm" ? v * IN_CM : v);

  const calc = useMemo(() => {
    const pos = (v: number) => (Number.isFinite(v) && v > 0 ? v : 0);
    const L = pos(toIn(dims.l)), W = pos(toIn(dims.w)), H = pos(toIn(dims.h));
    const pad = pos(toIn(padding)), plyT = pos(toIn(ply)), frmT = pos(toIn(frame));
    const iL = L + pad * 2, iW = W + pad * 2, iH = H + pad * 2;
    const eL = iL + frmT * 2, eW = iW + frmT * 2, eH = iH + frmT * 2;
    return {
      L, W, H, pad, plyT, frmT, iL, iW, iH, eL, eW, eH,
      volFt3: (eL * eW * eH) / 1728,
      valid: L > 0 && W > 0 && H > 0,
    };
  }, [dims, padding, ply, frame, unit]);

  const fmt = (v: number) =>
    unit === "cm" ? `${round(fromIn(v), 1)} cm` : `${round(v, 2)}"`;
  const money = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

  const estimate = useMemo(() => {
    if (!calc.valid) return null;
    const T = TIERS[tier];
    const mat = calc.volFt3 * T.matFt3;
    const labor = calc.volFt3 * T.laborFt3;
    const ins = (declared || 0) * T.ins;
    const transp = miles > 0 ? MILE_BASE + miles * MILE_RATE : 0;
    const total = Math.max(T.base + mat + labor + ins + transp, T.min + transp);
    return { T, mat, labor, ins, transp, lo: total * 0.92, hi: total * 1.15 };
  }, [calc, tier, declared, miles]);

  /* ---------------- THREE ---------------- */
  const mountRef = useRef<HTMLDivElement>(null);
  const T3 = useRef<any>({});
  const drag = useRef({ down: false, x: 0, y: 0 });

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.set(3.9, 2.9, 4.6);
    camera.lookAt(0, 0.15, 0);

    scene.add(new THREE.AmbientLight(0x6a6478, 0.35));
    const key = new THREE.DirectionalLight(0xfff2dd, 2.1);
    key.position.set(4.5, 6.5, 3.5);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xc4736a, 1.15);
    rim.position.set(-5, 2.4, -3.5);
    scene.add(rim);
    const bounce = new THREE.PointLight(0x8a9e6b, 0.75, 14);
    bounce.position.set(-2.2, 1.4, 3.2);
    scene.add(bounce);

    const group = new THREE.Group();
    scene.add(group);
    T3.current = { renderer, scene, camera, group, mount, guides: [] as any[] };

    let raf = 0;
    const clock = new THREE.Clock();
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const t = clock.getElapsedTime();
      if (!drag.current.down) group.rotation.y += 0.0022;
      T3.current.guides.forEach((m: any) => {
        m.material.opacity = 0.6 + Math.sin(t * 3.2) * 0.28;
      });
      renderer.render(scene, camera);
    };
    loop();

    const onResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", onResize);

    const px = (e: any) => e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    const py = (e: any) => e.clientY ?? e.touches?.[0]?.clientY ?? 0;
    const onDown = (e: any) => { drag.current = { down: true, x: px(e), y: py(e) }; };
    const onMove = (e: any) => {
      if (!drag.current.down) return;
      group.rotation.y += (px(e) - drag.current.x) * 0.008;
      group.rotation.x = Math.max(-0.65, Math.min(0.65, group.rotation.x + (py(e) - drag.current.y) * 0.008));
      drag.current.x = px(e);
      drag.current.y = py(e);
    };
    const onUp = () => { drag.current.down = false; };
    renderer.domElement.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      renderer.domElement.removeEventListener("pointerdown", onDown);
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    const group = T3.current.group as THREE.Group | undefined;
    if (!group) return;

    group.traverse((o: any) => {
      o.geometry?.dispose?.();
      if (Array.isArray(o.material)) o.material.forEach((m: any) => m.dispose?.());
      else o.material?.dispose?.();
    });
    while (group.children.length) group.remove(group.children[0]);
    T3.current.guides = [];

    if (!calc.valid) return;

    const s = 2.5 / Math.max(calc.eL, calc.eW, calc.eH, 1);
    const L = calc.eL * s, W = calc.eW * s, H = calc.eH * s;
    const skin = Math.max(0.014, calc.plyT * s);
    const post = Math.max(0.04, calc.frmT * s);
    const explode = view === "exploded" ? Math.max(0.28, H * 0.32) : 0;
    const clear = view === "interior";

    const pw = woodMaps("#C39A63", "#8A6435", "#DFC08C", 110);
    pw.map.repeat.set(1.6, 1.6);
    pw.bumpMap.repeat.set(1.6, 1.6);
    const pine = woodMaps("#A67F4C", "#6F4E24", "#C4A272", 80);

    const skinMat = new THREE.MeshStandardMaterial({
      ...pw, bumpScale: 0.01, roughness: 0.86,
      transparent: clear, opacity: clear ? 0.26 : 1,
      depthWrite: !clear, side: THREE.DoubleSide,
    });
    const edgeMat = new THREE.MeshStandardMaterial({
      map: plyEdge(), roughness: 0.9, transparent: clear, opacity: clear ? 0.3 : 1,
    });
    const frameMat = new THREE.MeshStandardMaterial({ ...pine, bumpScale: 0.014, roughness: 0.82 });
    const brass = new THREE.MeshStandardMaterial({ color: 0xb08a4e, roughness: 0.4, metalness: 0.82 });

    const add = (g: THREE.BufferGeometry, m: any, x: number, y: number, z: number) => {
      const me = new THREE.Mesh(g, m);
      me.position.set(x, y, z);
      group.add(me);
      return me;
    };
    const mZ = [edgeMat, edgeMat, edgeMat, edgeMat, skinMat, skinMat];
    const mX = [edgeMat, edgeMat, skinMat, skinMat, edgeMat, edgeMat];

    add(new THREE.BoxGeometry(L, H, skin), mZ, 0, H / 2, W / 2 + explode * 0.9);
    add(new THREE.BoxGeometry(L, H, skin), mZ, 0, H / 2, -W / 2 - explode * 0.9);
    add(new THREE.BoxGeometry(skin, H, W), mX, L / 2 + explode * 0.9, H / 2, 0);
    add(new THREE.BoxGeometry(skin, H, W), mX, -L / 2 - explode * 0.9, H / 2, 0);
    add(new THREE.BoxGeometry(L, skin, W), mZ, 0, H + explode, 0);
    add(new THREE.BoxGeometry(L, skin, W), mZ, 0, 0, 0);

    const st = new THREE.Mesh(
      new THREE.PlaneGeometry(L * 0.72, H * 0.42),
      new THREE.MeshStandardMaterial({
        map: stencilTex(), transparent: true, roughness: 0.95, opacity: clear ? 0.3 : 0.9,
      })
    );
    st.position.set(0, H * 0.56, W / 2 + skin / 2 + 0.004 + explode * 0.9);
    group.add(st);

    const cx = L / 2 - post / 2, cz = W / 2 - post / 2;
    const corners: [number, number][] = [[cx, cz], [-cx, cz], [cx, -cz], [-cx, -cz]];
    corners.forEach(([x, z]) => add(new THREE.BoxGeometry(post, H, post), frameMat, x, H / 2, z));
    [H - post / 2, post / 2].forEach((y) => {
      add(new THREE.BoxGeometry(L - post * 2, post * 0.85, post), frameMat, 0, y, cz);
      add(new THREE.BoxGeometry(L - post * 2, post * 0.85, post), frameMat, 0, y, -cz);
      add(new THREE.BoxGeometry(post, post * 0.85, W - post * 2), frameMat, cx, y, 0);
      add(new THREE.BoxGeometry(post, post * 0.85, W - post * 2), frameMat, -cx, y, 0);
    });
    const skidH = post * 1.1;
    [-W / 2 + post, 0, W / 2 - post].forEach((z) =>
      add(new THREE.BoxGeometry(L, skidH, post * 1.5), frameMat, 0, -skidH / 2, z)
    );

    const screw = new THREE.CylinderGeometry(post * 0.11, post * 0.11, skin * 1.6, 10);
    const n = Math.max(3, Math.min(24, Math.round(L / 0.42)));
    for (let i = 0; i < n; i++) {
      const x = -L / 2 + post + (i * (L - post * 2)) / (n - 1);
      [W / 2 + skin / 2, -W / 2 - skin / 2].forEach((z) =>
        [post * 0.6, H - post * 0.6].forEach((y) => {
          const m = add(screw, brass, x, y, z + (z > 0 ? explode * 0.9 : -explode * 0.9));
          m.rotation.x = Math.PI / 2;
        })
      );
    }
    const br = new THREE.BoxGeometry(post * 1.5, post * 0.12, post * 1.5);
    corners.forEach(([x, z]) => {
      add(br, brass, x, H - post * 0.05, z);
      add(br, brass, x, post * 0.05, z);
    });

    if (view !== "solid") {
      add(
        new THREE.BoxGeometry(calc.iL * s, calc.iH * s, calc.iW * s),
        new THREE.MeshStandardMaterial({ color: 0x8a9e6b, roughness: 1, transparent: true, opacity: 0.5 }),
        0, H / 2, 0
      );
      add(
        new THREE.BoxGeometry(calc.L * s, calc.H * s, calc.W * s),
        new THREE.MeshStandardMaterial({ color: 0xf2eadb, roughness: 0.65 }),
        0, H / 2, 0
      );
    }

    if (focusAxis) {
      const gm = () =>
        new THREE.MeshBasicMaterial({ color: 0xe8637e, transparent: true, opacity: 0.9, depthTest: false });
      const th = 0.018;
      let geo: THREE.BufferGeometry, pos: [number, number, number], ends: [number, number, number][];
      if (focusAxis === "l") {
        geo = new THREE.BoxGeometry(L, th, th);
        pos = [0, -0.13, W / 2 + 0.14];
        ends = [[-L / 2, -0.13, W / 2 + 0.14], [L / 2, -0.13, W / 2 + 0.14]];
      } else if (focusAxis === "w") {
        geo = new THREE.BoxGeometry(th, th, W);
        pos = [L / 2 + 0.14, -0.13, 0];
        ends = [[L / 2 + 0.14, -0.13, -W / 2], [L / 2 + 0.14, -0.13, W / 2]];
      } else {
        geo = new THREE.BoxGeometry(th, H, th);
        pos = [L / 2 + 0.14, H / 2, W / 2 + 0.14];
        ends = [[L / 2 + 0.14, 0, W / 2 + 0.14], [L / 2 + 0.14, H, W / 2 + 0.14]];
      }
      const bar = new THREE.Mesh(geo, gm());
      bar.position.set(...pos);
      bar.renderOrder = 999;
      group.add(bar);
      T3.current.guides.push(bar);
      ends.forEach((p) => {
        const cap = new THREE.Mesh(new THREE.SphereGeometry(0.032, 12, 12), gm());
        cap.position.set(...p);
        cap.renderOrder = 999;
        group.add(cap);
        T3.current.guides.push(cap);
      });
    }

    group.position.y = -H / 2 + 0.1;
  }, [calc, view, focusAxis]);

  /* ---------------- ESTILOS (paleta vino del sitio) ---------------- */
  const card: React.CSSProperties = {
    background: "rgba(255,255,255,.07)",
    backdropFilter: "blur(30px) saturate(140%)",
    WebkitBackdropFilter: "blur(30px) saturate(140%)",
    border: ".5px solid rgba(255,255,255,.14)",
    borderRadius: 24,
    boxShadow: "0 1px 0 rgba(255,255,255,.14) inset, 0 14px 40px rgba(20,4,10,.4)",
    color: "#F6ECEA",
  };
  const inputStyle = (on: boolean): React.CSSProperties => ({
    width: "100%",
    background: on ? "rgba(255,255,255,.14)" : "rgba(255,255,255,.07)",
    border: `.5px solid ${on ? "rgba(232,99,126,.6)" : "rgba(255,255,255,.16)"}`,
    boxShadow: on ? "0 0 0 3px rgba(232,99,126,.16)" : "none",
    borderRadius: 15,
    padding: "12px 14px",
    color: "#FFF6F4",
    fontSize: 16.5,
    fontWeight: 500,
    outline: "none",
    transition: "all .28s cubic-bezier(.32,.72,0,1)",
  });
  const pill = (on: boolean, tone = "#E8637E"): React.CSSProperties => ({
    border: `.5px solid ${on ? "rgba(255,255,255,.3)" : "rgba(255,255,255,.16)"}`,
    background: on ? tone : "rgba(255,255,255,.07)",
    color: on ? "#2A0710" : "rgba(246,236,234,.7)",
    borderRadius: 999,
    padding: "9px 16px",
    fontSize: 13.5,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all .3s cubic-bezier(.32,.72,0,1)",
  });
  const sec: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: 1.8,
    textTransform: "uppercase",
    color: "rgba(246,236,234,.42)",
    display: "block",
    marginBottom: 15,
  };
  const lbl = (on: boolean): React.CSSProperties => ({
    fontSize: 13,
    fontWeight: 500,
    color: on ? "#E8637E" : "rgba(246,236,234,.66)",
    display: "block",
    marginBottom: 6,
    transition: "color .25s",
  });
  const row: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 0",
    borderBottom: ".5px solid rgba(255,255,255,.1)",
    color: "rgba(246,236,234,.66)",
    fontSize: 14.5,
    fontWeight: 500,
  };

  const cuts = calc.valid
    ? [
        ["Tapa / Fondo", 2, `${fmt(calc.eL)} × ${fmt(calc.eW)}`],
        ["Frente / Atrás", 2, `${fmt(calc.eL)} × ${fmt(calc.eH)}`],
        ["Laterales", 2, `${fmt(calc.eW)} × ${fmt(calc.eH)}`],
        ["Postes de marco", 4, fmt(calc.eH)],
        ["Largueros (largo)", 4, fmt(calc.eL)],
        ["Largueros (ancho)", 4, fmt(calc.eW)],
      ]
    : [];

  const switchUnit = (u: "in" | "cm") => {
    if (u === unit) return;
    const conv = (v: number) => round(u === "cm" ? v * IN_CM : v / IN_CM, 3);
    setDims({ l: conv(dims.l), w: conv(dims.w), h: conv(dims.h) });
    setPadding(conv(padding));
    setPly(conv(ply));
    setFrame(conv(frame));
    setUnit(u);
  };

  const reset = () => {
    setUnit("in");
    setDims({ l: 40, w: 30, h: 4 });
    setPadding(2); setPly(0.375); setFrame(1.5);
    setTier("eco"); setView("solid"); setDeclared(5000); setMiles(0);
  };

  const axisFields: { key: Axis; label: string }[] = [
    { key: "l", label: "Largo" },
    { key: "w", label: "Ancho" },
    { key: "h", label: "Grosor / Alto" },
  ];

  return (
    <section id="calculadora" style={{ padding: "72px 20px", position: "relative" }}>
      <div style={{ maxWidth: 1060, margin: "0 auto" }}>
        <div style={{ marginBottom: 32 }}>
          <span
            style={{
              display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: 2.2,
              textTransform: "uppercase", color: "#E8637E", padding: "6px 14px",
              borderRadius: 999, background: "rgba(232,99,126,.12)",
              border: ".5px solid rgba(232,99,126,.28)", marginBottom: 16,
            }}
          >
            Calculadora de huacales
          </span>
          <h2 style={{ fontSize: "clamp(30px,4.6vw,48px)", fontWeight: 600, lineHeight: 1.06, letterSpacing: -0.8, color: "#FFF6F4" }}>
            Diseña tu huacal,{" "}
            <span style={{ color: "#E8637E", fontStyle: "italic" }}>al detalle</span>
          </h2>
          <p style={{ color: "rgba(246,236,234,.68)", marginTop: 13, maxWidth: 520, fontSize: 15.5, lineHeight: 1.6 }}>
            Ingresa las medidas de la obra y mira el huacal construirse en 3D.
            Obtén la lista de cortes y un estimado al instante.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(280px,.84fr) minmax(320px,1.16fr)",
            gap: 16,
          }}
        >
          {/* CONTROLES */}
          <div style={{ ...card, padding: 24 }}>
            <span style={sec}>Medidas de la obra</span>
            <div style={{ display: "inline-flex", gap: 4, padding: 3, borderRadius: 999, background: "rgba(255,255,255,.06)", marginBottom: 18 }}>
              {(["in", "cm"] as const).map((u) => (
                <button key={u} onClick={() => switchUnit(u)} style={{ ...pill(unit === u, "#EFE0DE"), padding: "7px 15px", fontSize: 12.5 }}>
                  {u === "in" ? "Pulgadas" : "Centímetros"}
                </button>
              ))}
            </div>

            {axisFields.map((f) => (
              <label key={f.key} style={{ display: "block", marginBottom: 13 }}>
                <span style={lbl(focusAxis === f.key)}>{f.label}</span>
                <input
                  type="number" min={0} step={0.1} value={dims[f.key]}
                  onFocus={() => setFocusAxis(f.key)}
                  onBlur={() => setFocusAxis(null)}
                  onChange={(e) => setDims({ ...dims, [f.key]: parseFloat(e.target.value) })}
                  style={inputStyle(focusAxis === f.key)}
                />
              </label>
            ))}

            <div style={{ height: 0.5, background: "rgba(255,255,255,.12)", margin: "22px 0" }} />
            <span style={sec}>Construcción</span>
            {[
              { label: "Acolchado por lado", val: padding, set: setPadding },
              { label: "Grosor del plywood", val: ply, set: setPly },
              { label: "Grosor del marco", val: frame, set: setFrame },
            ].map((f) => (
              <label key={f.label} style={{ display: "block", marginBottom: 13 }}>
                <span style={lbl(false)}>{f.label}</span>
                <input
                  type="number" min={0} step={0.05} value={f.val}
                  onChange={(e) => f.set(parseFloat(e.target.value))}
                  style={inputStyle(false)}
                />
              </label>
            ))}

            <div style={{ height: 0.5, background: "rgba(255,255,255,.12)", margin: "22px 0" }} />
            <span style={sec}>Estimado</span>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 15 }}>
              {(Object.keys(TIERS) as TierKey[]).map((k) => (
                <button key={k} onClick={() => setTier(k)} style={pill(tier === k)}>
                  {TIERS[k].name}
                </button>
              ))}
            </div>
            <label style={{ display: "block", marginBottom: 13 }}>
              <span style={lbl(false)}>Valor declarado ($)</span>
              <input type="number" min={0} step={100} value={declared}
                onChange={(e) => setDeclared(parseFloat(e.target.value) || 0)} style={inputStyle(false)} />
            </label>
            <label style={{ display: "block", marginBottom: 13 }}>
              <span style={lbl(false)}>Millas de traslado</span>
              <input type="number" min={0} step={1} value={miles}
                onChange={(e) => setMiles(parseFloat(e.target.value) || 0)} style={inputStyle(false)} />
            </label>

            <button onClick={reset} style={{ ...pill(false), marginTop: 4 }}>Restablecer</button>

            {!calc.valid && (
              <div style={{ marginTop: 14, fontSize: 13.5, color: "#FFD9E0", background: "rgba(232,99,126,.16)", border: ".5px solid rgba(232,99,126,.36)", borderRadius: 15, padding: "11px 13px" }}>
                Ingresa largo, ancho y alto mayores a 0.
              </div>
            )}
          </div>

          {/* VISOR + RESULTADOS */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ ...card, padding: 0, height: 390, position: "relative", overflow: "hidden", background: "radial-gradient(120% 95% at 50% 4%, #2E161D 0%, #1B0D12 50%, #100608 100%)" }}>
              <div ref={mountRef} style={{ width: "100%", height: "100%", cursor: "grab", position: "relative", zIndex: 1 }} />
              <div style={{ position: "absolute", top: 14, right: 14, zIndex: 3, display: "flex", gap: 5, padding: 3, borderRadius: 999, background: "rgba(0,0,0,.3)" }}>
                {([["solid", "Cerrado"], ["interior", "Interior"], ["exploded", "Despiece"]] as const).map(([v, label]) => (
                  <button key={v} onClick={() => setView(v)} style={{ ...pill(view === v, "#EFE0DE"), padding: "7px 13px", fontSize: 12 }}>
                    {label}
                  </button>
                ))}
              </div>
              <div style={{ position: "absolute", bottom: 14, left: 18, zIndex: 3, fontSize: 11.5, color: "rgba(255,255,255,.45)" }}>
                Arrastra para girar
              </div>
            </div>

            {/* ESTIMADO */}
            <div style={{ ...card, padding: 24, background: "linear-gradient(165deg,#F7EFED,#EADCD9)", color: "#2A1017", border: ".5px solid rgba(255,255,255,.6)" }}>
              <span style={{ ...sec, color: "rgba(42,16,23,.45)" }}>Estimado para el cliente</span>
              <div style={{ fontSize: "clamp(34px,4.8vw,48px)", fontWeight: 700, letterSpacing: -1.4, color: "#8E1030", fontVariantNumeric: "tabular-nums" }}>
                {estimate ? `${money(estimate.lo)} – ${money(estimate.hi)}` : "—"}
              </div>
              {estimate && (
                <div style={{ marginTop: 16 }}>
                  {[
                    ["Nivel", estimate.T.name],
                    ["Base", money(estimate.T.base)],
                    ["Materiales", money(estimate.mat)],
                    ["Mano de obra", money(estimate.labor)],
                    ["Seguro / valor declarado", money(estimate.ins)],
                    ["Traslado" + (miles ? ` (${miles} mi)` : ""), estimate.transp ? money(estimate.transp) : "—"],
                  ].map(([a, b], i, arr) => (
                    <div key={a as string} style={{ ...row, color: "rgba(42,16,23,.68)", borderBottom: i === arr.length - 1 ? "none" : ".5px solid rgba(42,16,23,.1)" }}>
                      <span>{a}</span>
                      <span style={{ color: "#2A1017", fontWeight: 600 }}>{b}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* MEDIDAS */}
            <div style={{ ...card, padding: 24 }}>
              <span style={sec}>Tamaño exterior del huacal</span>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 9 }}>
                {([["Largo", calc.eL, "l"], ["Ancho", calc.eW, "w"], ["Alto", calc.eH, "h"]] as const).map(
                  ([label, v, ax]) => (
                    <div
                      key={label}
                      onMouseEnter={() => setFocusAxis(ax as Axis)}
                      onMouseLeave={() => setFocusAxis(null)}
                      style={{
                        background: focusAxis === ax ? "rgba(232,99,126,.18)" : "rgba(255,255,255,.06)",
                        border: `.5px solid ${focusAxis === ax ? "rgba(232,99,126,.42)" : "rgba(255,255,255,.12)"}`,
                        borderRadius: 15, padding: "14px 8px", textAlign: "center",
                        transform: focusAxis === ax ? "scale(1.03)" : "none",
                        transition: "all .3s cubic-bezier(.32,.72,0,1)",
                      }}
                    >
                      <div style={{ fontSize: 11.5, color: "rgba(246,236,234,.45)", marginBottom: 4 }}>{label}</div>
                      <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: -0.5, color: "#E8637E" }}>
                        {calc.valid ? fmt(v) : "—"}
                      </div>
                    </div>
                  )
                )}
              </div>
              <div style={{ marginTop: 13, fontSize: 13, color: "rgba(246,236,234,.45)" }}>
                Volumen aprox:{" "}
                <span style={{ color: "#FFF6F4", fontWeight: 600 }}>
                  {calc.valid ? round(calc.volFt3, 2) : "—"}
                </span>{" "}
                ft³
              </div>
            </div>

            {/* LISTA DE CORTES */}
            <div style={{ ...card, padding: 24, flex: 1 }}>
              <span style={sec}>Lista de cortes</span>
              {cuts.length === 0 && <div style={{ color: "rgba(246,236,234,.42)" }}>—</div>}
              {cuts.map(([name, qty, val], i) => (
                <div key={name as string} style={{ ...row, borderBottom: i === cuts.length - 1 ? "none" : row.borderBottom }}>
                  <span>
                    {name}{" "}
                    <span style={{ color: "rgba(246,236,234,.42)" }}>×{qty}</span>
                  </span>
                  <span style={{ color: "#FFF6F4", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p style={{ color: "rgba(246,236,234,.4)", fontSize: 12.5, marginTop: 28, maxWidth: 600, marginLeft: "auto", marginRight: "auto", textAlign: "center", lineHeight: 1.65 }}>
          Estimado de referencia · Válido por 30 días. El precio final se confirma
          tras revisar la pieza, el acceso al sitio y el destino.
        </p>
      </div>
    </section>
  );
}
