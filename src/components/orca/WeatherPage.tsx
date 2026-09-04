import { useState } from "react";
import { CloudSun, Droplets, Eye, Gauge, Thermometer, Wind } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { MarineMap, MAP_COLORS } from "./MarineMap";
import { InsightBar, PageHeader, Panel, RegionSelector, StatCard, Tabs } from "./ui";
import { marineDataService } from "@/lib/orca/marineDataService";
import { getRegion, placesFor } from "@/lib/orca/regions";
import { useOrca } from "@/lib/orca/store";

type Range = "past" | "today" | "future";

export function WeatherPage({ title }: { title: string }) {
  const { region } = useOrca();
  const reg = getRegion(region);
  const [range, setRange] = useState<Range>("today");
  const weather = marineDataService.getWeather(region);
  const series = marineDataService.getWeatherSeries(region, range);
  const places = placesFor(reg);

  return (
    <>
      <PageHeader
        title={title}
        description={`${reg.name}${reg.localName ? ` / ${reg.localName}` : ""} · ${reg.waterBody}`}
        actions={<RegionSelector />}
      />

      <Panel>
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-4">
            <CloudSun className="h-14 w-14 text-primary" />
            <div>
              <p className="text-4xl font-semibold tabular-nums text-foreground">
                {weather.temperature}
                <span className="text-xl text-muted-foreground">°C</span>
              </p>
              <p className="text-sm text-muted-foreground">{weather.condition}</p>
            </div>
          </div>
          <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
            <StatCard label="Wind" value={weather.windSpeed} unit="km/h" hint={weather.windDirection} icon={<Wind className="h-4 w-4" />} />
            <StatCard label="Humidity" value={weather.humidity} unit="%" icon={<Droplets className="h-4 w-4" />} />
            <StatCard label="Visibility" value={weather.visibility} unit="km" icon={<Eye className="h-4 w-4" />} />
            <StatCard label="Pressure" value={weather.pressure} unit="hPa" icon={<Gauge className="h-4 w-4" />} />
            <StatCard label="Rainfall" value={weather.rainfall} unit="mm" icon={<Thermometer className="h-4 w-4" />} />
          </div>
        </div>
      </Panel>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs
          value={range}
          onChange={setRange}
          tabs={[
            { id: "past" as Range, label: "Past" },
            { id: "today" as Range, label: "Today" },
            { id: "future" as Range, label: "Future" },
          ]}
        />
        <span className="text-xs text-muted-foreground">
          Showing {range} readings for {reg.name}
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Panel title="Temperature (°C)">
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={series}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 250)" />
                  <XAxis dataKey="label" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip />
                  <Area dataKey="temperature" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.18} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Panel>
          <div className="grid gap-4 md:grid-cols-2">
            <Panel title="Rainfall (mm)">
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={series}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 250)" />
                    <XAxis dataKey="label" fontSize={11} />
                    <YAxis fontSize={11} />
                    <Tooltip />
                    <Bar dataKey="rainfall" fill="var(--chart-5)" radius={[5, 5, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Panel>
            <Panel title="Wind (km/h)">
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={series}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 250)" />
                    <XAxis dataKey="label" fontSize={11} />
                    <YAxis fontSize={11} />
                    <Tooltip />
                    <Line dataKey="wind" stroke="var(--chart-2)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Panel>
          </div>
        </div>

        <MarineMap
          region={region}
          title="Weather observation map"
          subtitle={`${weather.condition} · wind ${weather.windSpeed} km/h ${weather.windDirection}`}
          height={520}
          layers={[
            {
              id: "stations",
              label: "Coastal stations",
              points: places.map((p, i) => ({
                id: `st${i}`,
                lat: p.lat,
                lon: p.lon + 0.35,
                label: `${Math.round(weather.temperature + ((i % 3) - 1))}°C`,
                color: MAP_COLORS.blue,
              })),
            },
            {
              id: "cloud",
              label: "Cloud cover band",
              bands: [
                {
                  color: "oklch(0.8 0.02 250)",
                  opacity: Math.min(0.5, weather.cloudCover / 200),
                  latFrom: reg.bounds[1],
                  latTo: (reg.bounds[1] + reg.bounds[3]) / 2,
                },
              ],
            },
            {
              id: "rain",
              label: "Rain cells",
              defaultOn: weather.rainfall > 5,
              points: places.slice(0, 3).map((p, i) => ({
                id: `rn${i}`,
                lat: p.lat + 0.2,
                lon: p.lon + 0.8,
                label: `${Math.round(weather.rainfall)} mm`,
                kind: "zone" as const,
                radiusKm: 22,
                color: MAP_COLORS.cool,
              })),
            },
          ]}
          legend={[
            { color: MAP_COLORS.blue, label: "Station temperature" },
            { color: MAP_COLORS.cool, label: "Rain cell" },
            { color: "oklch(0.8 0.02 250)", label: "Cloud band" },
          ]}
        />
      </div>

      <InsightBar text={marineDataService.getInsight(region, "weather")} />
    </>
  );
}
