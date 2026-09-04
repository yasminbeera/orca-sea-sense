import { createFileRoute } from "@tanstack/react-router";
import { Activity, ShieldAlert, Zap } from "lucide-react";
import { MarineMap, MAP_COLORS } from "@/components/orca/MarineMap";
import {
  CircularScore,
  InsightBar,
  Meter,
  PageHeader,
  Panel,
  RegionSelector,
  SeverityBadge,
  StatCard,
} from "@/components/orca/ui";
import { marineDataService } from "@/lib/orca/marineDataService";
import { getRegion } from "@/lib/orca/regions";
import { useOrca } from "@/lib/orca/store";

export const Route = createFileRoute("/risk")({
  head: () => ({
    meta: [
      { title: "Risk & Danger Zones — ORCA" },
      {
        name: "description",
        content:
          "Composite marine risk scoring with high, medium, low and restricted zones plus an automated risk detection pipeline.",
      },
      { property: "og:title", content: "Risk & Danger Zones — ORCA" },
      {
        property: "og:description",
        content: "Marine risk zones, scores and automated risk detection for the Bay of Bengal.",
      },
    ],
  }),
  component: RiskPage,
});

function RiskPage() {
  const { region, settings, saveSettings } = useOrca();
  const reg = getRegion(region);
  const risk = marineDataService.getRisk(region);
  const automation = marineDataService.runRiskAutomation(region, {
    enabled: settings.riskAutomation,
    threshold: settings.riskThreshold,
    detections: settings.detections,
  });

  return (
    <>
      <PageHeader
        title="Risk / Danger Zones"
        description={`Composite marine risk for ${reg.name} · ${reg.waterBody}`}
        actions={<RegionSelector />}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Panel title="Risk analytics">
            <div className="flex flex-wrap items-center gap-6">
              <CircularScore value={risk.overall} label={`Overall — ${risk.level}`} size={120} />
              <div className="grid flex-1 gap-3 sm:grid-cols-2">
                <Meter label="Weather risk" value={risk.weather} />
                <Meter label="Ocean risk" value={risk.ocean} />
                <Meter label="Wave risk" value={risk.wave} />
                <Meter label="Wind risk" value={risk.wind} />
                <Meter label="Cyclone risk" value={risk.cyclone} />
                <Meter label="Lightning risk" value={risk.lightning} />
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Primary driver: <span className="font-medium text-foreground">{risk.cause}</span>
            </p>
          </Panel>

          <Panel
            title="Risk automation engine"
            description="Region → live marine data → detection → score → alert trigger"
            actions={
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={settings.riskAutomation}
                  onChange={(e) => saveSettings({ riskAutomation: e.target.checked })}
                  className="h-4 w-4 accent-[oklch(0.52_0.14_245)]"
                />
                Automation {settings.riskAutomation ? "on" : "off"}
              </label>
            }
          >
            <div className="grid gap-3 sm:grid-cols-4">
              <StatCard
                label="Monitoring"
                value={automation.monitoring ? "Active" : "Paused"}
                hint={`Last run ${automation.lastRun}`}
                tone={automation.monitoring ? "good" : "warn"}
                icon={<Activity className="h-4 w-4" />}
              />
              <StatCard label="Current score" value={`${automation.score}%`} tone={automation.score >= automation.threshold ? "bad" : "good"} />
              <StatCard label="Threshold" value={`${automation.threshold}%`} icon={<ShieldAlert className="h-4 w-4" />} />
              <StatCard
                label="Trigger status"
                value={automation.triggered ? "Alerts triggered" : "Below threshold"}
                hint={`${automation.generatedAlerts} signal(s) over limit`}
                tone={automation.triggered ? "bad" : "good"}
                icon={<Zap className="h-4 w-4" />}
              />
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              {automation.signals.map((s) => (
                <div
                  key={s.id}
                  className={`rounded-lg border p-3 ${s.triggered ? "border-[oklch(0.85_0.09_28)] bg-[oklch(0.97_0.03_28)]" : "border-border bg-muted/30"}`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground">{s.label}</p>
                    <span className="text-xs font-semibold tabular-nums text-muted-foreground">
                      {s.score}%
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{s.value}</p>
                  <p className="mt-1 text-xs font-medium">
                    {settings.detections[s.id] === false
                      ? "Detection disabled"
                      : s.triggered
                        ? "Threshold crossed → alert generated"
                        : "Normal"}
                  </p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Top high-risk zones">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {risk.zones.slice(0, 6).map((z) => (
                <div key={z.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                  <CircularScore value={z.risk} size={72} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{z.name}</p>
                    {z.telugu && <p className="text-xs text-muted-foreground">{z.telugu}</p>}
                    <div className="mt-1">
                      <SeverityBadge severity={z.level} />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{z.cause}</p>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <MarineMap
          region={region}
          title="Risk zone map"
          subtitle={`${risk.level} overall risk · ${risk.zones.length} monitored zones`}
          height={520}
          layers={[
            {
              id: "high",
              label: "High risk",
              points: risk.zones
                .filter((z) => z.level === "high")
                .map((z) => ({ id: z.id, lat: z.lat, lon: z.lon, label: `${z.risk}%`, kind: "zone" as const, radiusKm: 22, color: MAP_COLORS.high })),
            },
            {
              id: "medium",
              label: "Medium risk",
              points: risk.zones
                .filter((z) => z.level === "medium")
                .map((z) => ({ id: z.id, lat: z.lat, lon: z.lon, label: `${z.risk}%`, kind: "zone" as const, radiusKm: 18, color: MAP_COLORS.medium })),
            },
            {
              id: "low",
              label: "Low risk",
              points: risk.zones
                .filter((z) => z.level === "low")
                .map((z) => ({ id: z.id, lat: z.lat, lon: z.lon, label: `${z.risk}%`, kind: "zone" as const, radiusKm: 14, color: MAP_COLORS.low })),
            },
            {
              id: "restricted",
              label: "Restricted",
              points: risk.zones
                .filter((z) => z.level === "restricted")
                .map((z) => ({ id: z.id, lat: z.lat, lon: z.lon, label: "Restricted", kind: "zone" as const, radiusKm: 16, color: MAP_COLORS.restricted })),
            },
          ]}
          legend={[
            { color: MAP_COLORS.high, label: "High" },
            { color: MAP_COLORS.medium, label: "Medium" },
            { color: MAP_COLORS.low, label: "Low" },
            { color: MAP_COLORS.restricted, label: "Restricted" },
          ]}
        />
      </div>

      <InsightBar text={marineDataService.getInsight(region, "risk")} />
    </>
  );
}
