import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Anchor,
  CloudSun,
  Compass,
  Droplets,
  Fish,
  Gauge,
  LifeBuoy,
  ShieldAlert,
  Thermometer,
  Waves,
  Wind,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
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

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ORCA Dashboard — Marine Intelligence for the Bay of Bengal" },
      {
        name: "description",
        content:
          "Live marine dashboard with fishing zones, sea safety, weather and risk intelligence for the Andhra Pradesh coast.",
      },
      { property: "og:title", content: "ORCA Dashboard — Marine Intelligence" },
      {
        property: "og:description",
        content: "Fishing zones, sea safety, weather and risk intelligence for the Bay of Bengal.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { profile } = useOrca();
  return profile?.role === "analyst" ? <AnalystHome /> : <FishermanHome />;
}

/* --------------------------------------------------------------- fisherman */

function FishermanHome() {
  const { region, profile } = useOrca();
  const reg = getRegion(region);
  const status = marineDataService.getFishingStatus(region);
  const zones = marineDataService.getFishingZones(region);
  const weather = marineDataService.getWeather(region);
  const ocean = marineDataService.getOcean(region);
  const risk = marineDataService.getRisk(region);
  const best = zones[0];
  const user: [number, number] = [reg.center[0], reg.center[1] - 1.2];

  return (
    <>
      <PageHeader
        title={`Namaskaram, ${profile?.name ?? "Fisher"}`}
        description={`Marine conditions for ${reg.name}${reg.localName ? ` / ${reg.localName}` : ""} · ${reg.waterBody}`}
        actions={<RegionSelector />}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Fishing status" className="lg:col-span-1">
          <div className="flex items-center gap-4">
            <CircularScore value={100 - risk.overall} label="Favourability" />
            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2">
                <Fish className="h-4 w-4 text-primary" />
                <span className="font-semibold text-foreground">{status.status}</span>
              </p>
              <p className="flex items-center gap-2">
                <LifeBuoy className="h-4 w-4 text-primary" />
                Safety: <span className="font-semibold text-foreground">{status.safety}</span>
              </p>
              <p className="flex items-center gap-2">
                <Anchor className="h-4 w-4 text-primary" />
                Best time: <span className="font-semibold text-foreground">{status.bestTime}</span>
              </p>
              <p className="text-xs text-muted-foreground">{status.note}</p>
            </div>
          </div>
        </Panel>

        <Panel title="Best fishing zone" className="lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <p className="text-lg font-semibold text-foreground">
                {best.name}
                {best.telugu ? <span className="text-muted-foreground"> · {best.telugu}</span> : null}
              </p>
              <p className="text-sm text-muted-foreground">{best.reason}</p>
              <div className="flex flex-wrap gap-2 pt-1">
                {best.species.map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs text-foreground"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="Probability" value={`${best.probability}%`} tone="good" />
              <StatCard label="Distance" value={best.distanceKm} unit="km" />
              <StatCard label="Direction" value={best.direction} />
              <StatCard label="Window" value={best.bestTime} />
            </div>
          </div>
        </Panel>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <StatCard label="Sea condition" value={ocean.seaState} hint={`${ocean.waveHeight} m waves`} icon={<Waves className="h-4 w-4" />} />
        <StatCard label="Weather" value={weather.condition} hint={`${weather.cloudCover}% cloud`} icon={<CloudSun className="h-4 w-4" />} />
        <StatCard label="Wind" value={weather.windSpeed} unit="km/h" hint={weather.windDirection} icon={<Wind className="h-4 w-4" />} />
        <StatCard label="Tide" value={ocean.tideState} hint={`High ${ocean.highTide}`} icon={<Droplets className="h-4 w-4" />} />
        <StatCard
          label="Safety"
          value={status.safety}
          hint={`Risk ${risk.overall}%`}
          tone={status.safety === "Safe" ? "good" : status.safety === "Moderate" ? "warn" : "bad"}
          icon={<ShieldAlert className="h-4 w-4" />}
        />
        <StatCard label="Temperature" value={weather.temperature} unit="°C" hint={`SST ${marineDataService.getSST(region).current}°C`} icon={<Thermometer className="h-4 w-4" />} />
      </div>

      <MarineMap
        region={region}
        title="Marine operations map"
        subtitle={`${reg.name} · fishing grounds, recommended route and your position`}
        height={460}
        layers={[
          {
            id: "you",
            label: "Your position",
            points: [{ id: "me", lat: user[0], lon: user[1], label: "You", kind: "user" }],
            routes: [
              {
                id: "route",
                from: user,
                to: [best.lat, best.lon],
                label: `${best.distanceKm} km ${best.direction}`,
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
              radiusKm: 18,
              color: z.probability > 70 ? MAP_COLORS.green : MAP_COLORS.teal,
            })),
          },
          {
            id: "best",
            label: "Recommended zone",
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
          { color: MAP_COLORS.blue, label: "Your position" },
          { color: MAP_COLORS.warm, label: "Recommended zone" },
          { color: MAP_COLORS.green, label: "High probability zone" },
          { color: MAP_COLORS.teal, label: "Moderate zone" },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Zone probability comparison" className="lg:col-span-2">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={zones.slice(0, 6).map((z) => ({ name: z.name.split(" ")[0], value: z.probability }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 250)" />
                <XAxis dataKey="name" fontSize={11} />
                <YAxis fontSize={11} unit="%" />
                <Tooltip />
                <Bar dataKey="value" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Risk breakdown">
          <div className="space-y-3">
            <Meter label="Overall" value={risk.overall} />
            <Meter label="Wave" value={risk.wave} />
            <Meter label="Wind" value={risk.wind} />
            <Meter label="Cyclone" value={risk.cyclone} />
          </div>
          <Link
            to="/risk"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <Compass className="h-4 w-4" /> Open full risk map
          </Link>
        </Panel>
      </div>

      <InsightBar text={marineDataService.getInsight(region, "fishing")} />
    </>
  );
}

/* ----------------------------------------------------------------- analyst */

function AnalystHome() {
  const { region } = useOrca();
  const reg = getRegion(region);
  const risk = marineDataService.getRisk(region);
  const prod = marineDataService.getProductivity(region);
  const weather = marineDataService.getWeather(region);
  const alerts = marineDataService.getAlerts(region);
  const sst = marineDataService.getSST(region);

  return (
    <>
      <PageHeader
        title="Marine Intelligence Overview"
        description={`Consolidated intelligence for ${reg.name} · ${reg.waterBody}`}
        actions={<RegionSelector />}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MarineMap
            region={region}
            title="Regional marine intelligence"
            height={430}
            layers={[
              {
                id: "risk",
                label: "Risk zones",
                points: risk.zones.map((z) => ({
                  id: z.id,
                  lat: z.lat,
                  lon: z.lon,
                  label: `${z.risk}%`,
                  kind: "zone" as const,
                  radiusKm: 16,
                  color:
                    z.level === "high"
                      ? MAP_COLORS.high
                      : z.level === "restricted"
                        ? MAP_COLORS.restricted
                        : z.level === "medium"
                          ? MAP_COLORS.medium
                          : MAP_COLORS.low,
                })),
              },
              {
                id: "prod",
                label: "Productivity",
                defaultOn: false,
                points: prod.zones.map((z, i) => ({
                  id: `p${i}`,
                  lat: z.lat,
                  lon: z.lon,
                  label: `${z.value}%`,
                  color: MAP_COLORS.green,
                })),
              },
            ]}
            legend={[
              { color: MAP_COLORS.high, label: "High risk" },
              { color: MAP_COLORS.medium, label: "Medium risk" },
              { color: MAP_COLORS.low, label: "Low risk" },
              { color: MAP_COLORS.restricted, label: "Restricted" },
              { color: MAP_COLORS.green, label: "Productivity zone" },
            ]}
          />
        </div>
        <Panel title="Top risk insights" description="Ranked by composite exposure">
          <div className="space-y-3">
            {risk.zones.slice(0, 4).map((z) => (
              <div key={z.id} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">{z.name}</p>
                  <SeverityBadge severity={z.level} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{z.cause}</p>
                <div className="mt-2">
                  <Meter label="Risk" value={z.risk} />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="High productivity zones" className="lg:col-span-2">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={prod.zones.slice(0, 7).map((z) => ({ name: z.name.slice(0, 8), value: z.value }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 250)" />
                <XAxis dataKey="name" fontSize={11} />
                <YAxis fontSize={11} unit="%" />
                <Tooltip />
                <Bar dataKey="value" fill="var(--chart-2)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Weather">
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Temp" value={weather.temperature} unit="°C" icon={<Thermometer className="h-4 w-4" />} />
            <StatCard label="Wind" value={weather.windSpeed} unit="km/h" hint={weather.windDirection} icon={<Wind className="h-4 w-4" />} />
            <StatCard label="Humidity" value={weather.humidity} unit="%" icon={<Droplets className="h-4 w-4" />} />
            <StatCard label="Pressure" value={weather.pressure} unit="hPa" icon={<Gauge className="h-4 w-4" />} />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">{weather.condition}</p>
        </Panel>
      </div>

      <Panel title="Daily insights">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {[
            { t: "Risk", v: marineDataService.getInsight(region, "risk") },
            { t: "SST", v: marineDataService.getInsight(region, "sst") },
            { t: "Productivity", v: marineDataService.getInsight(region, "productivity") },
            { t: "Alerts", v: `${alerts.filter((a) => a.status === "Active").length} active alerts; highest severity ${alerts[0].severity} near ${alerts[0].location}.` },
          ].map((i) => (
            <div key={i.t} className="rounded-lg border border-border bg-muted/30 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {i.t}
              </p>
              <p className="mt-1 text-sm text-foreground">{i.v}</p>
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Overall risk" value={`${risk.overall}%`} tone={risk.overall > 60 ? "bad" : "warn"} />
        <StatCard label="Productivity" value={`${prod.score}/100`} tone="good" />
        <StatCard label="SST" value={sst.current} unit="°C" hint={`${sst.anomaly >= 0 ? "+" : ""}${sst.anomaly}°C anomaly`} />
        <StatCard label="Active alerts" value={alerts.filter((a) => a.status === "Active").length} />
      </div>

      <InsightBar text={marineDataService.getInsight(region, "risk")} />
    </>
  );
}
