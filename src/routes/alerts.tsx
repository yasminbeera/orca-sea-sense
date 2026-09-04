import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Bell, CheckCircle2, X, Zap } from "lucide-react";
import { MarineMap, MAP_COLORS } from "@/components/orca/MarineMap";
import {
  InsightBar,
  PageHeader,
  Panel,
  RegionSelector,
  SeverityBadge,
  StatCard,
  Tabs,
} from "@/components/orca/ui";
import { marineDataService, type MarineAlert, type Severity } from "@/lib/orca/marineDataService";
import { getRegion } from "@/lib/orca/regions";
import { useOrca } from "@/lib/orca/store";

export const Route = createFileRoute("/alerts")({
  head: () => ({
    meta: [
      { title: "Marine Alerts — ORCA" },
      {
        name: "description",
        content:
          "Active marine alerts with severity filters, alert map, recommended actions and an automated alert pipeline.",
      },
      { property: "og:title", content: "Marine Alerts — ORCA" },
      {
        property: "og:description",
        content: "Severity-filtered marine alerts with map and recommended actions.",
      },
    ],
  }),
  component: AlertsPage,
});

type Filter = "all" | Severity;

function AlertsPage() {
  const { region, settings, saveSettings, profile } = useOrca();
  const reg = getRegion(region);
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<MarineAlert | null>(null);
  const alerts = useMemo(() => marineDataService.getAlerts(region), [region]);
  const filtered = filter === "all" ? alerts : alerts.filter((a) => a.severity === filter);
  const automation = marineDataService.runRiskAutomation(region, {
    enabled: settings.alertAutomation,
    threshold: settings.riskThreshold,
    detections: settings.detections,
  });
  const counts = {
    critical: alerts.filter((a) => a.severity === "critical").length,
    high: alerts.filter((a) => a.severity === "high").length,
    medium: alerts.filter((a) => a.severity === "medium").length,
    resolved: alerts.filter((a) => a.severity === "resolved").length,
  };

  const colorOf = (s: Severity) =>
    s === "critical" ? MAP_COLORS.high : s === "high" ? MAP_COLORS.warm : s === "medium" ? MAP_COLORS.medium : MAP_COLORS.low;

  return (
    <>
      <PageHeader
        title="Alerts"
        description={`${alerts.filter((a) => a.status === "Active").length} active alerts across ${reg.name}`}
        actions={<RegionSelector />}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Critical" value={counts.critical} tone="bad" icon={<Bell className="h-4 w-4" />} />
        <StatCard label="High" value={counts.high} tone="warn" />
        <StatCard label="Medium" value={counts.medium} />
        <StatCard label="Resolved" value={counts.resolved} tone="good" icon={<CheckCircle2 className="h-4 w-4" />} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs
          value={filter}
          onChange={setFilter}
          tabs={[
            { id: "all" as Filter, label: `All (${alerts.length})` },
            { id: "critical" as Filter, label: `Critical (${counts.critical})` },
            { id: "high" as Filter, label: `High (${counts.high})` },
            { id: "medium" as Filter, label: `Medium (${counts.medium})` },
            { id: "resolved" as Filter, label: `Resolved (${counts.resolved})` },
          ]}
        />
        {profile?.role === "analyst" && (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={settings.alertAutomation}
              onChange={(e) => saveSettings({ alertAutomation: e.target.checked })}
              className="h-4 w-4 accent-[oklch(0.52_0.14_245)]"
            />
            Alert automation
          </label>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {filtered.length === 0 && (
            <Panel>
              <p className="py-8 text-center text-sm text-muted-foreground">
                No alerts match this filter for {reg.name}.
              </p>
            </Panel>
          )}
          {filtered.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => setSelected(a)}
              className="w-full rounded-xl border border-border bg-card p-4 text-left shadow-sm transition hover:border-primary/50 hover:shadow-md focus-visible:outline-2 focus-visible:outline-ring"
            >
              <div className="flex flex-wrap items-center gap-2">
                <SeverityBadge severity={a.severity} />
                <span className="text-sm font-semibold text-foreground">{a.title}</span>
                <span className="ml-auto text-xs text-muted-foreground">{a.time}</span>
              </div>
              <p className="mt-1 text-xs font-medium text-muted-foreground">
                {a.location}
                {a.telugu ? ` · ${a.telugu}` : ""} · {a.source}
              </p>
              <p className="mt-2 text-sm text-foreground">{a.description}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Action:</span> {a.action}
              </p>
              <p className="mt-1 text-xs font-medium text-primary">Status: {a.status} · view details</p>
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <MarineMap
            region={region}
            title="Alert map"
            height={340}
            layers={[
              {
                id: "alerts",
                label: "Alert locations",
                points: filtered.map((a) => ({
                  id: a.id,
                  lat: a.lat,
                  lon: a.lon,
                  label: a.severity,
                  kind: "zone" as const,
                  radiusKm: a.severity === "critical" ? 24 : 16,
                  color: colorOf(a.severity),
                })),
              },
            ]}
            legend={[
              { color: MAP_COLORS.high, label: "Critical" },
              { color: MAP_COLORS.warm, label: "High" },
              { color: MAP_COLORS.medium, label: "Medium" },
              { color: MAP_COLORS.low, label: "Resolved" },
            ]}
          />
          <Panel title="Alert automation flow">
            <ol className="space-y-2 text-sm">
              {[
                { s: "Live data", d: `${automation.signals.filter((x) => settings.detections[x.id] !== false).length} feeds active` },
                { s: "Risk engine", d: `Composite score ${automation.score}%` },
                { s: "Threshold", d: `${automation.threshold}% ${automation.score >= automation.threshold ? "crossed" : "not crossed"}` },
                { s: "Classify alert", d: `${automation.generatedAlerts} alert(s) classified` },
                { s: "Notify", d: settings.notifications ? "Notifications enabled" : "Notifications muted" },
              ].map((step, i) => (
                <li key={step.s} className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 p-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                  <span>
                    <span className="font-semibold text-foreground">{step.s}</span>
                    <span className="block text-xs text-muted-foreground">{step.d}</span>
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Zap className="h-3.5 w-3.5 text-primary" />
              {settings.alertAutomation ? "Automation running" : "Automation disabled in Settings"}
            </p>
          </Panel>
          <Panel title="Top alert regions">
            <ul className="space-y-2 text-sm">
              {alerts.slice(0, 5).map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-2">
                  <span className="truncate text-foreground">{a.location}</span>
                  <SeverityBadge severity={a.severity} />
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>

      <InsightBar text={marineDataService.getInsight(region, "risk")} />

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close alert details"
            className="absolute inset-0 bg-foreground/40"
            onClick={() => setSelected(null)}
          />
          <div className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-card p-5 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <SeverityBadge severity={selected.severity} />
                <h2 className="mt-2 text-lg font-semibold text-foreground">{selected.title}</h2>
                <p className="text-xs text-muted-foreground">
                  {selected.location} · {selected.time} · {selected.source}
                </p>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setSelected(null)}
                className="rounded-lg border border-border p-1.5 hover:bg-accent"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-3 text-sm text-foreground">{selected.description}</p>
            <div className="mt-3 rounded-lg border border-border bg-muted/40 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Recommended action
              </p>
              <p className="mt-1 text-sm text-foreground">{selected.action}</p>
            </div>
            <p className="mt-3 text-sm">
              Status: <span className="font-semibold text-foreground">{selected.status}</span>
            </p>
          </div>
        </div>
      )}
    </>
  );
}
