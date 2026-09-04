import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";
import { REGIONS, type RegionId } from "@/lib/orca/regions";
import { useOrca } from "@/lib/orca/store";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions}
    </div>
  );
}

export function RegionSelector({ label = "Region" }: { label?: string }) {
  const { region, setRegion } = useOrca();
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="font-medium text-muted-foreground">{label}</span>
      <select
        value={region}
        onChange={(e) => setRegion(e.target.value as RegionId)}
        className="rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground shadow-sm transition focus-visible:outline-2 focus-visible:outline-ring"
      >
        {REGIONS.map((r) => (
          <option key={r.id} value={r.id}>
            {r.name}
            {r.localName ? ` — ${r.localName}` : ""}
          </option>
        ))}
      </select>
    </label>
  );
}

export function StatCard({
  label,
  value,
  unit,
  hint,
  icon,
  tone = "default",
}: {
  label: string;
  value: string | number;
  unit?: string;
  hint?: string;
  icon?: ReactNode;
  tone?: "default" | "good" | "warn" | "bad";
}) {
  const toneClass =
    tone === "good"
      ? "text-[oklch(0.5_0.13_155)]"
      : tone === "warn"
        ? "text-[oklch(0.58_0.15_75)]"
        : tone === "bad"
          ? "text-[oklch(0.55_0.2_28)]"
          : "text-foreground";
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        {icon && <span className="text-muted-foreground">{icon}</span>}
      </div>
      <p className={cn("mt-2 text-2xl font-semibold tabular-nums", toneClass)}>
        {value}
        {unit && <span className="ml-1 text-sm font-medium text-muted-foreground">{unit}</span>}
      </p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function Panel({
  title,
  description,
  children,
  actions,
  className,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-xl border border-border bg-card shadow-sm", className)}>
      {(title || actions) && (
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
          <div>
            {title && <h2 className="text-sm font-semibold text-foreground">{title}</h2>}
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
          </div>
          {actions}
        </header>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}

export function CircularScore({
  value,
  label,
  size = 96,
  color,
}: {
  value: number;
  label?: string;
  size?: number;
  color?: string;
}) {
  const r = size / 2 - 8;
  const c = 2 * Math.PI * r;
  const stroke =
    color ??
    (value >= 70
      ? "oklch(0.58 0.2 28)"
      : value >= 45
        ? "oklch(0.72 0.16 80)"
        : "oklch(0.6 0.14 155)");
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} role="img" aria-label={`${label ?? "Score"} ${value}%`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="oklch(0.92 0.01 250)"
          strokeWidth="8"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={stroke}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${(c * value) / 100} ${c}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text
          x="50%"
          y="52%"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={size / 4.5}
          fontWeight="600"
          fill="currentColor"
          className="text-foreground"
        >
          {value}%
        </text>
      </svg>
      {label && <span className="text-xs text-muted-foreground">{label}</span>}
    </div>
  );
}

export function Meter({ label, value, unit = "%" }: { label: string; value: number; unit?: string }) {
  const color =
    value >= 70
      ? "oklch(0.58 0.2 28)"
      : value >= 45
        ? "oklch(0.72 0.16 80)"
        : "oklch(0.6 0.14 155)";
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold tabular-nums text-foreground">
          {value}
          {unit}
        </span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full"
          style={{ width: `${Math.min(100, value)}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export function InsightBar({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-[oklch(0.88_0.05_230)] bg-[oklch(0.97_0.02_230)] p-4 dark:border-border dark:bg-muted/40">
      <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[oklch(0.52_0.14_245)]" />
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[oklch(0.45_0.1_245)]">
          ORCA AI Insight
        </p>
        <p className="mt-1 text-sm text-foreground">{text}</p>
      </div>
    </div>
  );
}

export function SeverityBadge({ severity }: { severity: string }) {
  const map: Record<string, string> = {
    critical: "bg-[oklch(0.95_0.05_25)] text-[oklch(0.45_0.19_28)] border-[oklch(0.85_0.09_28)]",
    high: "bg-[oklch(0.96_0.05_65)] text-[oklch(0.48_0.15_60)] border-[oklch(0.88_0.09_65)]",
    medium: "bg-[oklch(0.97_0.04_95)] text-[oklch(0.48_0.11_90)] border-[oklch(0.9_0.07_95)]",
    resolved: "bg-[oklch(0.96_0.04_155)] text-[oklch(0.44_0.11_155)] border-[oklch(0.87_0.07_155)]",
    restricted: "bg-[oklch(0.95_0.04_300)] text-[oklch(0.45_0.12_300)] border-[oklch(0.87_0.06_300)]",
    low: "bg-[oklch(0.96_0.04_155)] text-[oklch(0.44_0.11_155)] border-[oklch(0.87_0.07_155)]",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize",
        map[severity] ?? map.medium,
      )}
    >
      {severity}
    </span>
  );
}

export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex flex-wrap gap-1 rounded-lg border border-border bg-muted/50 p-1">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          aria-pressed={value === t.id}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-ring",
            value === t.id
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
