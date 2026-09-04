import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Play } from "lucide-react";
import { toast } from "sonner";
import { MarineMap, MAP_COLORS } from "@/components/orca/MarineMap";
import {
  CircularScore,
  InsightBar,
  Meter,
  PageHeader,
  Panel,
  RegionSelector,
  StatCard,
} from "@/components/orca/ui";
import { marineDataService } from "@/lib/orca/marineDataService";
import { getRegion } from "@/lib/orca/regions";
import { useOrca } from "@/lib/orca/store";

export const Route = createFileRoute("/zones")({
  head: () => ({
    meta: [
      { title: "Fish Zones — ORCA Trip Analysis" },
      {
        name: "description",
        content:
          "Plan a trip and analyse fishing probability, distance, direction, sea conditions and risk for the Bay of Bengal.",
      },
      { property: "og:title", content: "Fish Zones — ORCA Trip Analysis" },
      {
        property: "og:description",
        content: "Trip setup with fishing probability, route and risk analysis.",
      },
    ],
  }),
  component: ZonesPage,
});

const PURPOSES = ["Fishing", "Survey", "Research", "Transport"];

function ZonesPage() {
  const { region } = useOrca();
  const reg = getRegion(region);
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [time, setTime] = useState("05:00");
  const [purpose, setPurpose] = useState(PURPOSES[0]);
  const [run, setRun] = useState({ date: today, time: "05:00", purpose: PURPOSES[0], n: 0 });

  const zones = useMemo(
    () => marineDataService.getFishingZones(region, `${run.date}|${run.time}|${run.purpose}`),
    [region, run],
  );
  const weather = marineDataService.getWeather(region, run.date);
  const ocean = marineDataService.getOcean(region);
  const risk = marineDataService.getRisk(region);
  const best = zones[0];
  const user: [number, number] = [reg.center[0], reg.center[1] - 1.2];

  return (
    <>
      <PageHeader
        title="Fish Zones"
        description={`Trip analysis for ${reg.name} · ${reg.waterBody}`}
        actions={<RegionSelector />}
      />

      <Panel title="Trip setup" description="Set your trip parameters, then run the analysis.">
        <div className="grid gap-3 md:grid-cols-4">
          <label className="text-sm">
            <span className="font-medium text-muted-foreground">Region</span>
            <div className="mt-1.5">
              <RegionSelector label="" />
            </div>
          </label>
          <label className="text-sm">
            <span className="font-medium text-muted-foreground">Date</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-sm focus-visible:outline-2 focus-visible:outline-ring"
            />
          </label>
          <label className="text-sm">
            <span className="font-medium text-muted-foreground">Time</span>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-sm focus-visible:outline-2 focus-visible:outline-ring"
            />
          </label>
          <label className="text-sm">
            <span className="font-medium text-muted-foreground">Purpose</span>
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-sm focus-visible:outline-2 focus-visible:outline-ring"
            >
              {PURPOSES.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </label>
        </div>
        <button
          type="button"
          onClick={() => {
            setRun({ date, time, purpose, n: run.n + 1 });
            toast.success(`Analysis updated for ${reg.name} · ${purpose} on ${date} at ${time}`);
          }}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition hover:brightness-110"
        >
          <Play className="h-4 w-4" /> Analyze
        </button>
        <p className="mt-2 text-xs text-muted-foreground">
          Last analysis: {run.purpose} · {run.date} · {run.time} (run #{run.n + 1})
        </p>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Best zone" value={best.name} hint={best.telugu} />
            <StatCard label="Probability" value={`${best.probability}%`} tone="good" />
            <StatCard label="Distance" value={best.distanceKm} unit="km" hint={best.direction} />
            <StatCard label="Recommended time" value={best.bestTime} />
            <StatCard label="Weather" value={weather.condition} hint={`${weather.temperature}°C · ${weather.windSpeed} km/h`} />
            <StatCard label="Sea condition" value={ocean.seaState} hint={`${ocean.waveHeight} m waves`} />
            <StatCard label="Risk" value={`${risk.overall}%`} tone={risk.overall > 60 ? "bad" : "warn"} />
            <StatCard label="Depth" value={best.depth} unit="m" />
          </div>

          <Panel title="AI reasoning">
            <div className="flex flex-wrap items-center gap-5">
              <CircularScore value={best.probability} label="Catch probability" />
              <CircularScore value={risk.overall} label="Trip risk" />
              <p className="max-w-md flex-1 text-sm text-foreground">
                {best.reason} For a <strong>{run.purpose.toLowerCase()}</strong> trip departing{" "}
                {run.time}, ORCA recommends heading {best.direction} toward {best.name} and returning
                before the wind peaks at {weather.windSpeed} km/h.
              </p>
            </div>
          </Panel>

          <Panel title="All analysed zones">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="py-2">Zone</th>
                    <th>Probability</th>
                    <th>Distance</th>
                    <th>Direction</th>
                    <th>Best time</th>
                  </tr>
                </thead>
                <tbody>
                  {zones.map((z) => (
                    <tr key={z.id} className="border-b border-border/60 last:border-0">
                      <td className="py-2 font-medium text-foreground">
                        {z.name}
                        {z.telugu && <span className="block text-xs text-muted-foreground">{z.telugu}</span>}
                      </td>
                      <td className="w-40">
                        <Meter label="" value={z.probability} />
                      </td>
                      <td>{z.distanceKm} km</td>
                      <td>{z.direction}</td>
                      <td>{z.bestTime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>

        <MarineMap
          region={region}
          title="Trip planning map"
          subtitle={`${run.purpose} · ${run.date}`}
          height={520}
          layers={[
            {
              id: "user",
              label: "Departure point",
              points: [{ id: "me", lat: user[0], lon: user[1], label: "Harbour", kind: "user" }],
              routes: [
                {
                  id: "r",
                  from: user,
                  to: [best.lat, best.lon],
                  label: `${best.distanceKm} km`,
                },
              ],
            },
            {
              id: "zones",
              label: "Fishing zones",
              points: zones.slice(1).map((z) => ({
                id: z.id,
                lat: z.lat,
                lon: z.lon,
                label: `${z.probability}%`,
                kind: "zone" as const,
                radiusKm: 16,
                color: z.probability > 70 ? MAP_COLORS.green : MAP_COLORS.teal,
              })),
            },
            {
              id: "best",
              label: "Best zone",
              points: [
                {
                  id: best.id,
                  lat: best.lat,
                  lon: best.lon,
                  label: `${best.name} ${best.probability}%`,
                  kind: "best" as const,
                  color: MAP_COLORS.warm,
                },
              ],
            },
          ]}
          legend={[
            { color: MAP_COLORS.blue, label: "Departure" },
            { color: MAP_COLORS.warm, label: "Best zone" },
            { color: MAP_COLORS.green, label: "High probability" },
            { color: MAP_COLORS.teal, label: "Moderate" },
          ]}
        />
      </div>

      <InsightBar text={marineDataService.getInsight(region, "fishing")} />
    </>
  );
}
