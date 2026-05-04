import { useMemo, useState } from "react";
import { geoAlbersUsa, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import statesTopo from "us-atlas/states-10m.json";

type City = {
  name: string;
  state: string;
  coords: [number, number];
  labelDx?: number;
  labelDy?: number;
  anchor?: "start" | "end" | "middle";
};

const CITIES: City[] = [
  { name: "Los Angeles", state: "California", coords: [-118.2437, 34.0522], labelDx: 0, labelDy: 24, anchor: "middle" },
  { name: "Chicago", state: "Illinois", coords: [-87.6298, 41.8781], labelDx: 0, labelDy: -16, anchor: "middle" },
  { name: "New York", state: "New York", coords: [-74.006, 40.7128], labelDx: 14, labelDy: -8, anchor: "start" },
  { name: "Washington", state: "District of Columbia", coords: [-77.0369, 38.9072], labelDx: 14, labelDy: -8, anchor: "start" },
  { name: "Richmond", state: "Virginia", coords: [-77.436, 37.5407], labelDx: -14, labelDy: 6, anchor: "end" },
  { name: "Charlotte", state: "North Carolina", coords: [-80.8431, 35.2271], labelDx: 14, labelDy: -8, anchor: "start" },
  { name: "Charleston", state: "South Carolina", coords: [-79.9311, 32.7765], labelDx: 14, labelDy: 6, anchor: "start" },
  { name: "West Palm Beach", state: "Florida", coords: [-80.0534, 26.7153], labelDx: 14, labelDy: -8, anchor: "start" },
  { name: "Miami", state: "Florida", coords: [-80.1918, 25.7617], labelDx: 14, labelDy: 16, anchor: "start" },
];

const ROUTE_ORDER = ["Los Angeles", "Chicago", "New York", "Washington", "Richmond", "Charlotte", "Charleston", "West Palm Beach", "Miami"];

const W = 1100;
const H = 680;

const statesGeo: any = feature(statesTopo as any, (statesTopo as any).objects.states);

export const USRouteMap = ({ tagline }: { tagline: string }) => {
  const [hoverState, setHoverState] = useState<string | null>(null);

  const projection = useMemo(
    () => geoAlbersUsa().fitExtent([[18, 18], [W - 18, H - 18]], statesGeo),
    []
  );
  const pathGen = useMemo(() => geoPath(projection), [projection]);

  const projected = useMemo(
    () =>
      CITIES.map((c) => {
        const p = projection(c.coords);
        return { ...c, x: p?.[0] ?? 0, y: p?.[1] ?? 0 };
      }),
    [projection]
  );

  const routePath = useMemo(() => {
    const pts = ROUTE_ORDER.map((n) => projected.find((p) => p.name === n)!).filter(Boolean);
    return pts
      .map((c, i) => {
        if (i === 0) return `M ${c.x} ${c.y}`;
        const prev = pts[i - 1];
        const mx = (prev.x + c.x) / 2;
        const my = Math.min(prev.y, c.y) - Math.abs(c.x - prev.x) * 0.18;
        return `Q ${mx} ${my} ${c.x} ${c.y}`;
      })
      .join(" ");
  }, [projected]);

  const highlightStates = new Set(CITIES.map((c) => c.state));

  return (
    <div className="relative w-full rounded-xl bg-white border border-border overflow-hidden shadow-soft">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto block"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="US service route map"
      >
        {/* States */}
        <g>
          {statesGeo.features.map((feat: any, i: number) => {
            const stateName = feat.properties.name;
            const isHover = hoverState === stateName;
            const isHighlighted = highlightStates.has(stateName);
            const fill = isHover
              ? "#dc2626"
              : isHighlighted
              ? "#fca5a5"
              : "#cbd5e1";
            return (
              <path
                key={i}
                d={pathGen(feat) ?? ""}
                fill={fill}
                stroke="#ffffff"
                strokeWidth={1.2}
                style={{ transition: "fill 220ms ease" }}
              />
            );
          })}
        </g>

        {/* Route */}
        <path
          d={routePath}
          fill="none"
          stroke="#dc2626"
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray="2 9"
          opacity={0.9}
        >
          <animate attributeName="stroke-dashoffset" values="0;-110" dur="6s" repeatCount="indefinite" />
        </path>

        {/* Markers + labels */}
        {projected.map((c) => {
          const active = hoverState === c.state;
          return (
            <g
              key={c.name}
              onMouseEnter={() => setHoverState(c.state)}
              onMouseLeave={() => setHoverState(null)}
              style={{ cursor: "pointer" }}
            >
              {/* hit area */}
              <circle cx={c.x} cy={c.y} r={26} fill="transparent" />
              {/* pulse */}
              <circle cx={c.x} cy={c.y} r={20} fill="#dc2626" opacity={0.18}>
                <animate attributeName="r" values="14;26;14" dur="2.4s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.32;0.04;0.32" dur="2.4s" repeatCount="indefinite" />
              </circle>
              {/* dot */}
              <circle
                cx={c.x}
                cy={c.y}
                r={active ? 10 : 8}
                fill="#dc2626"
                stroke="white"
                strokeWidth={2.5}
                style={{ transition: "r 180ms ease" }}
              />
              {/* label */}
              <g transform={`translate(${c.x + (c.labelDx ?? 12)}, ${c.y + (c.labelDy ?? -10)})`}>
                <rect
                  x={c.anchor === "middle" ? -((c.name.length * 7) + 8) : -3}
                  y={-13}
                  width={c.name.length * 7.2 + 14}
                  height={20}
                  rx={4}
                  ry={4}
                  fill="white"
                  stroke="#dc2626"
                  strokeWidth={1.4}
                  transform={c.anchor === "middle" ? `translate(${(c.name.length * 7.2 + 14) / 2 - 3}, 0)` : undefined}
                />
                <text
                  x={c.anchor === "middle" ? 0 : 4}
                  y={1}
                  fontSize={13}
                  fontWeight={700}
                  fill="#111"
                  textAnchor={c.anchor ?? "start"}
                  fontFamily="ui-sans-serif, system-ui, -apple-system, sans-serif"
                >
                  {c.name}
                </text>
              </g>
            </g>
          );
        })}
      </svg>
      <div className="px-4 py-2.5 border-t border-border flex items-center gap-2 text-[11px] tracking-[0.18em] uppercase text-ink/60 font-semibold">
        <span className="inline-block h-[2px] w-6 bg-[#dc2626] rounded" />
        {tagline}
      </div>
    </div>
  );
};
