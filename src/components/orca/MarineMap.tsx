import { useMemo, useState } from "react";
import { Minus, Plus, Layers, RotateCcw } from "lucide-react";
import { AP_COAST, getRegion, placesFor, type RegionId } from "@/lib/orca/regions";
import { useOrca } from "@/lib/orca/store";
import { cn } from "@/lib/utils";

export interface MapPoint {
  id: string;
  lat: number;
  lon: number;
  label: string;
  sublabel?: string;
  color?: string;
  radiusKm?: number;
  kind?: "marker" | "zone" | "user" | "best";
}

export interface MapRoute {
  id: string;
  from: [number, number];
  to: [number, number];
  color?: string;
  label?: string;
}

export interface MapLayer {
  id: string;
  label: string;
  defaultOn?: boolean;
  points?: MapPoint[];
  routes?: MapRoute[];
  /** simple color band overlay for thermal/concentration maps */
  bands?: { color: string; opacity?: number; latFrom: number; latTo: number }[];
}

export interface LegendItem {
  color: string;
  label: string;
}

interface Props {
  region: RegionId;
  title: string;
  subtitle?: string;
  layers: MapLayer[];
  legend: LegendItem[];
  height?: number;
  className?: string;
}

const W = 640;
const H = 520;

export function MarineMap({
  region,
  title,
  subtitle,
  layers,
  legend,
  height = 420,
  className,
}: Props) {
  const { settings } = useOrca();
  const reg = getRegion(region);
  const [zoom, setZoom] = useState(1);
  const [enabled, setEnabled] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(layers.map((l) => [l.id, l.defaultOn !== false])),
  );
  const [showLayers, setShowLayers] = useState(false);

  const [lonMin, latMin, lonMax, latMax] = reg.bounds;
  const project = useMemo(() => {
    return (lat: number, lon: number): [number, number] => [
      ((lon - lonMin) / (lonMax - lonMin)) * W,
      H - ((lat - latMin) / (latMax - latMin)) * H,
    ];
  }, [lonMin, lonMax, latMin, latMax]);

  const kmToPx = (km: number) => (km / 111 / (latMax - latMin)) * H;

  const vb = useMemo(() => {
    const w = W / zoom;
    const h = H / zoom;
    return `${(W - w) / 2} ${(H - h) / 2} ${w} ${h}`;
  }, [zoom]);

  const places = placesFor(reg);
  const coastPath = AP_COAST.map(([lon, lat], i) => {
    const [x, y] = project(lat, lon);
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");

  // Land polygon: coast line closed inland (west of the coast).
  const landPath = reg.detailedAP
    ? `${coastPath} L${project(AP_COAST[AP_COAST.length - 1][1], lonMin - 1)[0]},${project(AP_COAST[AP_COAST.length - 1][1], lonMin - 1)[1]} L${project(latMax + 1, lonMin - 1)[0]},${project(latMax + 1, lonMin - 1)[1]} L${project(AP_COAST[0][1], AP_COAST[0][0])[0]},${project(latMax + 1, AP_COAST[0][0])[1]} Z`
    : "";

  const activeLayers = layers.filter((l) => enabled[l.id]);
  const gridLons = Array.from({ length: 6 }, (_, i) => lonMin + ((lonMax - lonMin) / 5) * i);
  const gridLats = Array.from({ length: 6 }, (_, i) => latMin + ((latMax - latMin) / 5) * i);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border bg-card shadow-sm",
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-border px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground">
            {subtitle ?? `${reg.name}${reg.localName ? ` / ${reg.localName}` : ""} · ${reg.waterBody}`}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {layers.length > 1 && (
            <button
              type="button"
              aria-label="Toggle map layers"
              onClick={() => setShowLayers((v) => !v)}
              className="rounded-md border border-border bg-background p-1.5 text-muted-foreground shadow-sm transition hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
            >
              <Layers className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            aria-label="Zoom out"
            onClick={() => setZoom((z) => Math.max(1, Math.round((z - 0.25) * 100) / 100))}
            className="rounded-md border border-border bg-background p-1.5 text-muted-foreground shadow-sm transition hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
          >
            <Minus className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Zoom in"
            onClick={() => setZoom((z) => Math.min(3, Math.round((z + 0.25) * 100) / 100))}
            className="rounded-md border border-border bg-background p-1.5 text-muted-foreground shadow-sm transition hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Reset map view"
            onClick={() => setZoom(1)}
            className="rounded-md border border-border bg-background p-1.5 text-muted-foreground shadow-sm transition hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {showLayers && layers.length > 1 && (
        <div className="flex flex-wrap gap-2 border-b border-border bg-muted/40 px-4 py-2">
          {layers.map((l) => (
            <label
              key={l.id}
              className="flex cursor-pointer items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground shadow-sm"
            >
              <input
                type="checkbox"
                className="h-3.5 w-3.5 accent-[oklch(0.52_0.13_240)]"
                checked={!!enabled[l.id]}
                onChange={(e) => setEnabled((p) => ({ ...p, [l.id]: e.target.checked }))}
              />
              {l.label}
            </label>
          ))}
        </div>
      )}

      <div className="bg-[oklch(0.97_0.02_230)] dark:bg-[oklch(0.28_0.04_240)]" style={{ height }}>
        <svg
          viewBox={vb}
          preserveAspectRatio="xMidYMid meet"
          className="h-full w-full"
          role="img"
          aria-label={`${title} map of ${reg.name}`}
        >
          <defs>
            <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.95 0.03 230)" />
              <stop offset="100%" stopColor="oklch(0.9 0.05 235)" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width={W} height={H} fill="url(#sea)" />

          {/* bands (thermal / concentration) */}
          {activeLayers.flatMap((l) =>
            (l.bands ?? []).map((b, i) => {
              const [, y1] = project(b.latTo, lonMin);
              const [, y2] = project(b.latFrom, lonMin);
              return (
                <rect
                  key={`${l.id}-band-${i}`}
                  x={0}
                  y={Math.min(y1, y2)}
                  width={W}
                  height={Math.abs(y2 - y1)}
                  fill={b.color}
                  opacity={b.opacity ?? 0.35}
                />
              );
            }),
          )}

          {/* graticule */}
          {settings.mapGrid && (
            <g stroke="oklch(0.75 0.03 235)" strokeWidth="0.5" opacity="0.5">
              {gridLons.map((lon) => (
                <line key={`gl${lon}`} x1={project(latMin, lon)[0]} y1={0} x2={project(latMin, lon)[0]} y2={H} />
              ))}
              {gridLats.map((lat) => (
                <line key={`ga${lat}`} x1={0} y1={project(lat, lonMin)[1]} x2={W} y2={project(lat, lonMin)[1]} />
              ))}
            </g>
          )}

          {/* landmass + coastline */}
          {reg.detailedAP && (
            <>
              <path d={landPath} fill="oklch(0.95 0.02 130)" stroke="none" />
              <path d={coastPath} fill="none" stroke="oklch(0.45 0.06 150)" strokeWidth="1.8" />
              <text
                x={project(latMin + (latMax - latMin) * 0.72, lonMin + (lonMax - lonMin) * 0.08)[0]}
                y={project(latMin + (latMax - latMin) * 0.72, lonMin)[1]}
                fill="oklch(0.45 0.05 150)"
                fontSize="11"
                fontWeight="600"
              >
                {settings.mapTelugu ? "ఆంధ్రప్రదేశ్ / Andhra Pradesh" : "Andhra Pradesh"}
              </text>
            </>
          )}
          <text
            x={W * 0.72}
            y={H * 0.12}
            fill="oklch(0.45 0.06 240)"
            fontSize="12"
            fontWeight="600"
            opacity="0.85"
          >
            {reg.waterBody}
          </text>

          {/* coastal places */}
          {settings.mapLabels &&
            places.map((p) => {
              const [x, y] = project(p.lat, p.lon);
              if (x < 0 || x > W || y < 0 || y > H) return null;
              return (
                <g key={p.name}>
                  <circle cx={x} cy={y} r={p.major ? 3.2 : 2.2} fill="oklch(0.35 0.04 250)" />
                  <text
                    x={x - 5}
                    y={y + 3}
                    textAnchor="end"
                    fontSize={p.major ? 9.5 : 8.5}
                    fill="oklch(0.32 0.04 255)"
                  >
                    {settings.mapTelugu && p.telugu ? `${p.telugu} / ${p.name}` : p.name}
                  </text>
                </g>
              );
            })}

          {/* routes (static) */}
          {activeLayers.flatMap((l) =>
            (l.routes ?? []).map((r) => {
              const [x1, y1] = project(r.from[0], r.from[1]);
              const [x2, y2] = project(r.to[0], r.to[1]);
              return (
                <g key={r.id}>
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={r.color ?? "oklch(0.5 0.14 250)"}
                    strokeWidth="2"
                    strokeDasharray="6 4"
                  />
                  {r.label && (
                    <text
                      x={(x1 + x2) / 2}
                      y={(y1 + y2) / 2 - 5}
                      fontSize="8.5"
                      textAnchor="middle"
                      fill="oklch(0.4 0.12 250)"
                    >
                      {r.label}
                    </text>
                  )}
                </g>
              );
            }),
          )}

          {/* points and zones */}
          {activeLayers.flatMap((l) =>
            (l.points ?? []).map((p) => {
              const [x, y] = project(p.lat, p.lon);
              const color = p.color ?? "oklch(0.5 0.14 250)";
              const r = p.radiusKm ? Math.max(6, kmToPx(p.radiusKm)) : 6;
              return (
                <g key={`${l.id}-${p.id}`}>
                  {p.kind === "zone" ? (
                    <>
                      <circle cx={x} cy={y} r={r} fill={color} opacity="0.24" />
                      <circle cx={x} cy={y} r={r} fill="none" stroke={color} strokeWidth="1.4" />
                    </>
                  ) : p.kind === "user" ? (
                    <>
                      <circle cx={x} cy={y} r="6" fill="oklch(0.55 0.16 250)" stroke="white" strokeWidth="2" />
                      <circle cx={x} cy={y} r="11" fill="none" stroke="oklch(0.55 0.16 250)" strokeWidth="1" />
                    </>
                  ) : p.kind === "best" ? (
                    <polygon
                      points={`${x},${y - 8} ${x + 7},${y + 6} ${x - 7},${y + 6}`}
                      fill={color}
                      stroke="white"
                      strokeWidth="1.5"
                    />
                  ) : (
                    <circle cx={x} cy={y} r="5" fill={color} stroke="white" strokeWidth="1.5" />
                  )}
                  {settings.mapLabels && (
                    <text x={x + r + 4} y={y + 3} fontSize="8.5" fill="oklch(0.28 0.04 255)">
                      {p.label}
                      {p.sublabel ? ` · ${p.sublabel}` : ""}
                    </text>
                  )}
                </g>
              );
            }),
          )}

          {/* scale bar */}
          <g>
            <rect x={16} y={H - 26} width={kmToPx(100)} height={4} fill="oklch(0.32 0.04 255)" />
            <text x={16} y={H - 30} fontSize="9" fill="oklch(0.32 0.04 255)">
              100 km
            </text>
          </g>
        </svg>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-border bg-muted/30 px-4 py-2.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Legend
        </span>
        {legend.map((l) => (
          <span key={l.label} className="flex items-center gap-1.5 text-xs text-foreground">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full border border-border"
              style={{ backgroundColor: l.color }}
            />
            {l.label}
          </span>
        ))}
        <span className="ml-auto text-xs text-muted-foreground">Zoom {zoom.toFixed(2)}×</span>
      </div>
    </div>
  );
}

export const MAP_COLORS = {
  low: "oklch(0.7 0.15 150)",
  medium: "oklch(0.78 0.15 85)",
  high: "oklch(0.62 0.2 30)",
  restricted: "oklch(0.45 0.1 300)",
  blue: "oklch(0.55 0.15 245)",
  green: "oklch(0.62 0.14 155)",
  teal: "oklch(0.65 0.11 200)",
  warm: "oklch(0.68 0.19 45)",
  hot: "oklch(0.58 0.22 25)",
  cool: "oklch(0.75 0.1 230)",
};
