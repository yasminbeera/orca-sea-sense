/**
 * marineDataService
 * -----------------
 * Single abstraction over all marine intelligence data used by ORCA.
 * Today it returns deterministic, realistic demo data derived from the
 * selected region + date. Swapping in real marine / weather / satellite
 * APIs later only requires replacing the function bodies below — the
 * returned shapes are the contract the UI depends on.
 */
import {
  AP_PLACES,
  getRegion,
  placesFor,
  type CoastalPlace,
  type Region,
  type RegionId,
} from "./regions";

/* ------------------------------------------------------------------ utils */

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/** deterministic 0..1 */
function rnd(seedStr: string): number {
  return (hash(seedStr) % 100000) / 100000;
}

function between(seedStr: string, min: number, max: number, decimals = 1): number {
  const v = min + rnd(seedStr) * (max - min);
  const p = Math.pow(10, decimals);
  return Math.round(v * p) / p;
}

function pick<T>(seedStr: string, arr: T[]): T {
  return arr[hash(seedStr) % arr.length];
}

const dayKey = (d = new Date()) => d.toISOString().slice(0, 10);

/* ---------------------------------------------------------------- weather */

export interface WeatherNow {
  temperature: number;
  condition: string;
  windSpeed: number;
  windDirection: string;
  humidity: number;
  visibility: number;
  pressure: number;
  rainfall: number;
  cloudCover: number;
}

const CONDITIONS = [
  "Clear sky",
  "Partly cloudy",
  "Mostly cloudy",
  "Light showers",
  "Humid & hazy",
  "Scattered thundershowers",
];
const DIRS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];

export function getWeather(region: RegionId, date = dayKey()): WeatherNow {
  const k = `${region}|${date}|w`;
  return {
    temperature: between(k + "t", 24, 34),
    condition: pick(k + "c", CONDITIONS),
    windSpeed: between(k + "ws", 6, 34),
    windDirection: pick(k + "wd", DIRS),
    humidity: Math.round(between(k + "h", 55, 92, 0)),
    visibility: between(k + "v", 3, 12),
    pressure: Math.round(between(k + "p", 998, 1014, 0)),
    rainfall: between(k + "r", 0, 26),
    cloudCover: Math.round(between(k + "cc", 10, 95, 0)),
  };
}

export interface SeriesPoint {
  label: string;
  temperature: number;
  rainfall: number;
  wind: number;
  humidity: number;
}

export function getWeatherSeries(
  region: RegionId,
  range: "past" | "today" | "future",
): SeriesPoint[] {
  const labels =
    range === "today"
      ? ["00:00", "03:00", "06:00", "09:00", "12:00", "15:00", "18:00", "21:00"]
      : range === "past"
        ? ["-7d", "-6d", "-5d", "-4d", "-3d", "-2d", "-1d"]
        : ["+1d", "+2d", "+3d", "+4d", "+5d", "+6d", "+7d"];
  return labels.map((label) => {
    const k = `${region}|${range}|${label}`;
    return {
      label,
      temperature: between(k + "t", 23, 35),
      rainfall: between(k + "r", 0, 30),
      wind: between(k + "w", 5, 38),
      humidity: Math.round(between(k + "h", 50, 95, 0)),
    };
  });
}

/* -------------------------------------------------------------------- SST */

export interface SSTData {
  current: number;
  anomaly: number;
  min: number;
  max: number;
  score: number;
  trend: { label: string; value: number }[];
  topRegions: { name: string; telugu?: string; value: number; delta: number }[];
  historical: { label: string; current: number; lastYear: number }[];
}

export function getSST(region: RegionId): SSTData {
  const places = placesFor(getRegion(region));
  const k = `${region}|sst`;
  const current = between(k, 26.5, 31.2, 2);
  return {
    current,
    anomaly: between(k + "a", -0.8, 1.6, 2),
    min: Math.round((current - between(k + "mn", 1, 2.5, 2)) * 100) / 100,
    max: Math.round((current + between(k + "mx", 0.8, 2.4, 2)) * 100) / 100,
    score: Math.round(between(k + "s", 55, 92, 0)),
    trend: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"].map((m) => ({
      label: m,
      value: between(k + m, 25.5, 31.5, 2),
    })),
    topRegions: places.slice(0, 5).map((p) => ({
      name: p.name,
      telugu: p.telugu,
      value: between(k + p.name, 26, 31.5, 2),
      delta: between(k + p.name + "d", -1.2, 1.5, 2),
    })),
    historical: ["Q1", "Q2", "Q3", "Q4"].map((q) => ({
      label: q,
      current: between(k + q, 26, 31, 2),
      lastYear: between(k + q + "ly", 25.5, 30.5, 2),
    })),
  };
}

/* ------------------------------------------------------------ chlorophyll */

export interface ChlorophyllData {
  concentration: number;
  score: number;
  distribution: { label: string; value: number }[];
  trend: { label: string; value: number }[];
  topRegions: { name: string; telugu?: string; value: number; productivity: number }[];
  productivityCorrelation: number;
}

export function getChlorophyll(region: RegionId): ChlorophyllData {
  const places = placesFor(getRegion(region));
  const k = `${region}|chl`;
  return {
    concentration: between(k, 0.4, 4.2, 2),
    score: Math.round(between(k + "s", 50, 94, 0)),
    distribution: [
      { label: "High (>2 mg/m³)", value: Math.round(between(k + "h", 15, 40, 0)) },
      { label: "Moderate (0.8–2)", value: Math.round(between(k + "m", 25, 45, 0)) },
      { label: "Low (<0.8)", value: Math.round(between(k + "l", 20, 45, 0)) },
    ],
    trend: ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"].map((w) => ({
      label: w,
      value: between(k + w, 0.3, 4.5, 2),
    })),
    topRegions: places.slice(0, 5).map((p) => ({
      name: p.name,
      telugu: p.telugu,
      value: between(k + p.name, 0.5, 4.6, 2),
      productivity: Math.round(between(k + p.name + "p", 45, 96, 0)),
    })),
    productivityCorrelation: between(k + "corr", 0.55, 0.92, 2),
  };
}

/* ------------------------------------------------------------------ ocean */

export interface OceanData {
  waveHeight: number;
  swell: number;
  swellPeriod: number;
  currentSpeed: number;
  currentDirection: string;
  seaState: string;
  tideState: string;
  highTide: string;
  lowTide: string;
  score: number;
  waveTrend: { label: string; wave: number; swell: number }[];
  tideCurve: { label: string; value: number }[];
}

const SEA_STATES = ["Calm", "Slight", "Moderate", "Rough", "Very rough"];

export function getOcean(region: RegionId): OceanData {
  const k = `${region}|ocean`;
  const wave = between(k + "w", 0.4, 3.6, 2);
  return {
    waveHeight: wave,
    swell: between(k + "s", 0.3, 2.6, 2),
    swellPeriod: between(k + "sp", 5, 14, 1),
    currentSpeed: between(k + "c", 0.1, 1.4, 2),
    currentDirection: pick(k + "cd", DIRS),
    seaState:
      wave < 0.8 ? SEA_STATES[0] : wave < 1.5 ? SEA_STATES[1] : wave < 2.4 ? SEA_STATES[2] : wave < 3.1 ? SEA_STATES[3] : SEA_STATES[4],
    tideState: pick(k + "t", ["Rising", "Falling", "High", "Low"]),
    highTide: pick(k + "ht", ["05:40", "06:15", "07:05", "11:20", "17:45"]),
    lowTide: pick(k + "lt", ["00:10", "12:35", "13:20", "23:05"]),
    score: Math.round(between(k + "sc", 45, 93, 0)),
    waveTrend: ["00", "04", "08", "12", "16", "20"].map((h) => ({
      label: `${h}:00`,
      wave: between(k + h + "w", 0.3, 3.8, 2),
      swell: between(k + h + "s", 0.2, 2.8, 2),
    })),
    tideCurve: ["00", "03", "06", "09", "12", "15", "18", "21"].map((h) => ({
      label: `${h}:00`,
      value: between(k + h + "tide", -1.2, 1.6, 2),
    })),
  };
}

/* ------------------------------------------------------------------- risk */

export interface RiskData {
  overall: number;
  weather: number;
  ocean: number;
  wave: number;
  wind: number;
  cyclone: number;
  lightning: number;
  level: "Low" | "Moderate" | "High" | "Severe";
  zones: RiskZone[];
  cause: string;
}

export interface RiskZone {
  id: string;
  name: string;
  telugu?: string;
  lat: number;
  lon: number;
  risk: number;
  level: "low" | "medium" | "high" | "restricted";
  cause: string;
}

const CAUSES = [
  "Strong offshore winds",
  "High wave activity",
  "Low pressure system nearby",
  "Lightning cluster over sea",
  "Rough sea state",
  "Squall line approaching",
  "Restricted naval zone",
];

export function getRisk(region: RegionId): RiskData {
  const k = `${region}|risk`;
  const weather = Math.round(between(k + "w", 15, 88, 0));
  const ocean = Math.round(between(k + "o", 12, 85, 0));
  const wave = Math.round(between(k + "wv", 10, 90, 0));
  const wind = Math.round(between(k + "wd", 14, 86, 0));
  const cyclone = Math.round(between(k + "cy", 3, 72, 0));
  const lightning = Math.round(between(k + "li", 5, 78, 0));
  const overall = Math.round((weather + ocean + wave + wind + cyclone + lightning) / 6);
  const places = placesFor(getRegion(region));
  const zones: RiskZone[] = places.map((p, i) => {
    const r = Math.round(between(k + p.name, 8, 94, 0));
    const level: RiskZone["level"] =
      i === places.length - 1 && r > 60 ? "restricted" : r >= 66 ? "high" : r >= 38 ? "medium" : "low";
    return {
      id: `${region}-rz-${i}`,
      name: `${p.name} Offshore`,
      telugu: p.telugu,
      lat: p.lat + between(k + p.name + "la", -0.15, 0.25, 3),
      lon: p.lon + between(k + p.name + "lo", 0.25, 0.9, 3),
      risk: r,
      level,
      cause: pick(k + p.name + "c", CAUSES),
    };
  });
  return {
    overall,
    weather,
    ocean,
    wave,
    wind,
    cyclone,
    lightning,
    level: overall >= 75 ? "Severe" : overall >= 55 ? "High" : overall >= 32 ? "Moderate" : "Low",
    zones: zones.sort((a, b) => b.risk - a.risk),
    cause: pick(k + "cause", CAUSES),
  };
}

/* ----------------------------------------------------------- fishing zones */

export interface FishingZone {
  id: string;
  name: string;
  telugu?: string;
  lat: number;
  lon: number;
  probability: number;
  distanceKm: number;
  direction: string;
  bestTime: string;
  depth: number;
  species: string[];
  reason: string;
}

const SPECIES = ["Indian mackerel", "Sardine", "Seer fish", "Tuna", "Pomfret", "Prawn", "Ribbonfish"];
const TIMES = ["04:30 – 08:00", "05:00 – 09:30", "16:00 – 19:30", "17:30 – 21:00"];

export function getFishingZones(region: RegionId, dateSeed = dayKey()): FishingZone[] {
  const places = placesFor(getRegion(region));
  const k = `${region}|${dateSeed}|fz`;
  const chl = getChlorophyll(region);
  const sst = getSST(region);
  return places
    .map((p, i) => {
      const prob = Math.round(between(k + p.name, 32, 95, 0));
      return {
        id: `${region}-fz-${i}`,
        name: `${p.name} Grounds`,
        telugu: p.telugu,
        lat: p.lat + between(k + p.name + "la", -0.2, 0.2, 3),
        lon: p.lon + between(k + p.name + "lo", 0.3, 1.1, 3),
        probability: prob,
        distanceKm: Math.round(between(k + p.name + "d", 6, 68, 0)),
        direction: pick(k + p.name + "dir", DIRS),
        bestTime: pick(k + p.name + "t", TIMES),
        depth: Math.round(between(k + p.name + "dp", 18, 120, 0)),
        species: [pick(k + p.name + "s1", SPECIES), pick(k + p.name + "s2", SPECIES)].filter(
          (v, idx, a) => a.indexOf(v) === idx,
        ),
        reason: `Chlorophyll ${chl.concentration} mg/m³ with SST ${sst.current}°C creates a favourable feeding band.`,
      };
    })
    .sort((a, b) => b.probability - a.probability);
}

/* ------------------------------------------------------------ productivity */

export interface ProductivityData {
  score: number;
  high: number;
  medium: number;
  low: number;
  sstInfluence: number;
  chlorophyllInfluence: number;
  oceanInfluence: number;
  trend: { label: string; value: number }[];
  zones: { name: string; telugu?: string; lat: number; lon: number; value: number }[];
}

export function getProductivity(region: RegionId): ProductivityData {
  const k = `${region}|prod`;
  const high = Math.round(between(k + "h", 18, 46, 0));
  const medium = Math.round(between(k + "m", 25, 45, 0));
  const places = placesFor(getRegion(region));
  return {
    score: Math.round(between(k + "s", 48, 94, 0)),
    high,
    medium,
    low: Math.max(0, 100 - high - medium),
    sstInfluence: Math.round(between(k + "si", 40, 92, 0)),
    chlorophyllInfluence: Math.round(between(k + "ci", 45, 96, 0)),
    oceanInfluence: Math.round(between(k + "oi", 35, 88, 0)),
    trend: ["Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"].map((m) => ({
      label: m,
      value: Math.round(between(k + m, 40, 95, 0)),
    })),
    zones: places.map((p) => ({
      name: p.name,
      telugu: p.telugu,
      lat: p.lat + between(k + p.name + "la", -0.1, 0.2, 3),
      lon: p.lon + between(k + p.name + "lo", 0.2, 0.95, 3),
      value: Math.round(between(k + p.name, 35, 97, 0)),
    })),
  };
}

/* ---------------------------------------------------------------- spatial */

export interface SpatialData {
  hotspots: { name: string; telugu?: string; lat: number; lon: number; intensity: number; type: string }[];
  clusters: { name: string; count: number; risk: number }[];
  correlation: { label: string; sst: number; chlorophyll: number; risk: number; productivity: number }[];
}

export function getSpatial(region: RegionId): SpatialData {
  const k = `${region}|sp`;
  const places = placesFor(getRegion(region));
  return {
    hotspots: places.map((p, i) => ({
      name: p.name,
      telugu: p.telugu,
      lat: p.lat + between(k + p.name + "la", -0.15, 0.25, 3),
      lon: p.lon + between(k + p.name + "lo", 0.3, 1.0, 3),
      intensity: Math.round(between(k + p.name, 30, 98, 0)),
      type: pick(k + p.name + "ty", ["Productivity", "Risk", "Thermal", "Upwelling"]) + ` #${i + 1}`,
    })),
    clusters: places.slice(0, 4).map((p) => ({
      name: `${p.name} cluster`,
      count: Math.round(between(k + p.name + "c", 3, 24, 0)),
      risk: Math.round(between(k + p.name + "r", 20, 92, 0)),
    })),
    correlation: places.slice(0, 6).map((p) => ({
      label: p.name.slice(0, 8),
      sst: between(k + p.name + "s", 26, 31, 1),
      chlorophyll: between(k + p.name + "ch", 0.4, 4.4, 2),
      risk: Math.round(between(k + p.name + "rk", 15, 90, 0)),
      productivity: Math.round(between(k + p.name + "pr", 35, 96, 0)),
    })),
  };
}

/* --------------------------------------------------------------- disaster */

export type DisasterType = "cyclone" | "flood" | "high-waves" | "lightning" | "storm" | "other";

export const DISASTER_TYPES: { id: DisasterType; label: string }[] = [
  { id: "cyclone", label: "Cyclone" },
  { id: "flood", label: "Flood" },
  { id: "high-waves", label: "High Waves" },
  { id: "lightning", label: "Lightning" },
  { id: "storm", label: "Storm" },
  { id: "other", label: "Other Marine Events" },
];

export interface DisasterData {
  totalEvents: number;
  severeEvents: number;
  trend: { label: string; events: number; severe: number }[];
  distribution: { label: string; value: number }[];
  severity: { label: string; current: number; previous: number }[];
  affected: { name: string; telugu?: string; impact: number; events: number }[];
  tracks: { name: string; points: [number, number][] }[];
}

export function getDisasters(
  region: RegionId,
  period: string,
  type: DisasterType,
): DisasterData {
  const k = `${region}|${period}|${type}`;
  const places = placesFor(getRegion(region));
  const total = Math.round(between(k + "t", 8, 68, 0));
  return {
    totalEvents: total,
    severeEvents: Math.round(total * between(k + "s", 0.12, 0.42, 2)),
    trend: ["2020", "2021", "2022", "2023", "2024", "2025", "2026"].map((y) => ({
      label: y,
      events: Math.round(between(k + y, 2, 22, 0)),
      severe: Math.round(between(k + y + "s", 0, 9, 0)),
    })),
    distribution: DISASTER_TYPES.map((d) => ({
      label: d.label,
      value: Math.round(between(k + d.id, 3, 30, 0)),
    })),
    severity: ["Low", "Moderate", "High", "Severe"].map((s) => ({
      label: s,
      current: Math.round(between(k + s, 2, 26, 0)),
      previous: Math.round(between(k + s + "p", 1, 24, 0)),
    })),
    affected: places
      .slice(0, 6)
      .map((p) => ({
        name: p.name,
        telugu: p.telugu,
        impact: Math.round(between(k + p.name, 20, 95, 0)),
        events: Math.round(between(k + p.name + "e", 1, 18, 0)),
      }))
      .sort((a, b) => b.impact - a.impact),
    tracks: [
      {
        name: `${type === "cyclone" ? "Cyclone" : "Event"} track A`,
        points: places.slice(0, 4).map((p, i) => [
          p.lat + between(k + p.name + "tla" + i, -0.4, 0.6, 3),
          p.lon + between(k + p.name + "tlo" + i, 0.6, 1.8, 3),
        ]) as [number, number][],
      },
    ],
  };
}

/* ----------------------------------------------------------------- alerts */

export type Severity = "critical" | "high" | "medium" | "resolved";

export interface MarineAlert {
  id: string;
  severity: Severity;
  title: string;
  location: string;
  telugu?: string;
  lat: number;
  lon: number;
  time: string;
  description: string;
  action: string;
  status: string;
  source: string;
}

const ALERT_TITLES: Record<Severity, string[]> = {
  critical: ["Cyclonic circulation detected", "Severe wave surge warning", "Do-not-venture advisory"],
  high: ["Strong wind warning", "Rough sea advisory", "Lightning activity over sea"],
  medium: ["Moderate swell advisory", "Visibility drop expected", "Tidal variation notice"],
  resolved: ["Wind warning withdrawn", "Sea condition normalised", "Advisory closed"],
};

export function getAlerts(region: RegionId): MarineAlert[] {
  const k = `${region}|alerts`;
  const places = placesFor(getRegion(region));
  const risk = getRisk(region);
  return places.map((p, i) => {
    const r = risk.zones[i % risk.zones.length];
    const severity: Severity =
      r.risk >= 78 ? "critical" : r.risk >= 60 ? "high" : r.risk >= 40 ? "medium" : "resolved";
    const hours = Math.round(between(k + p.name + "h", 0, 22, 0));
    return {
      id: `${region}-al-${i}`,
      severity,
      title: pick(k + p.name, ALERT_TITLES[severity]),
      location: `${p.name} sea area`,
      telugu: p.telugu,
      lat: p.lat + between(k + p.name + "la", -0.15, 0.3, 3),
      lon: p.lon + between(k + p.name + "lo", 0.25, 1.0, 3),
      time: `${String(hours).padStart(2, "0")}:${pick(k + p.name + "m", ["05", "18", "32", "47"])} IST`,
      description: `${r.cause} reported ${Math.round(between(k + p.name + "d", 8, 60, 0))} km off ${p.name}. Wave height near ${between(k + p.name + "wv", 0.6, 3.6, 1)} m with wind gusting to ${Math.round(between(k + p.name + "w", 18, 70, 0))} km/h.`,
      action:
        severity === "critical"
          ? "Return to nearest harbour immediately. Do not venture into the sea."
          : severity === "high"
            ? "Avoid the zone. Small vessels should stay within 5 nm of the coast."
            : severity === "medium"
              ? "Proceed with caution and monitor updates every 3 hours."
              : "No action required. Normal operations may resume.",
      status: severity === "resolved" ? "Resolved" : "Active",
      source: pick(k + p.name + "src", ["ORCA Risk Engine", "Satellite feed", "Buoy network", "Coastal radar"]),
    };
  });
}

/* ------------------------------------------------------- fishing/safety UI */

export interface FishingStatus {
  status: "Favourable" | "Caution" | "Not advised";
  safety: "Safe" | "Moderate" | "Unsafe";
  bestTime: string;
  note: string;
}

export function getFishingStatus(region: RegionId): FishingStatus {
  const risk = getRisk(region);
  const ocean = getOcean(region);
  const zones = getFishingZones(region);
  const status: FishingStatus["status"] =
    risk.overall >= 70 ? "Not advised" : risk.overall >= 45 ? "Caution" : "Favourable";
  return {
    status,
    safety: risk.overall >= 70 ? "Unsafe" : risk.overall >= 45 ? "Moderate" : "Safe",
    bestTime: zones[0].bestTime,
    note: `Sea is ${ocean.seaState.toLowerCase()} with ${ocean.waveHeight} m waves. Overall risk ${risk.overall}%.`,
  };
}

/* ---------------------------------------------------------------- reports */

export interface ReportRecord {
  id: string;
  title: string;
  type: "Risk" | "Weather" | "Productivity" | "Disaster" | "Alert Digest";
  region: RegionId;
  regionName: string;
  date: string;
  summary: string;
  rows: { label: string; value: string }[];
}

export function getReports(region: RegionId): ReportRecord[] {
  const r = getRegion(region);
  const risk = getRisk(region);
  const weather = getWeather(region);
  const prod = getProductivity(region);
  const dis = getDisasters(region, "12m", "cyclone");
  const alerts = getAlerts(region);
  const today = dayKey();
  const yest = dayKey(new Date(Date.now() - 86400000));
  const week = dayKey(new Date(Date.now() - 6 * 86400000));
  return [
    {
      id: `${region}-rep-risk`,
      title: `${r.name} — Marine Risk Report`,
      type: "Risk",
      region,
      regionName: r.name,
      date: today,
      summary: `Overall marine risk for ${r.name} stands at ${risk.overall}% (${risk.level}). Primary driver: ${risk.cause.toLowerCase()}.`,
      rows: [
        { label: "Overall risk", value: `${risk.overall}%` },
        { label: "Weather risk", value: `${risk.weather}%` },
        { label: "Ocean risk", value: `${risk.ocean}%` },
        { label: "Wave risk", value: `${risk.wave}%` },
        { label: "Cyclone risk", value: `${risk.cyclone}%` },
        { label: "Highest zone", value: `${risk.zones[0].name} (${risk.zones[0].risk}%)` },
      ],
    },
    {
      id: `${region}-rep-weather`,
      title: `${r.name} — Weather Summary`,
      type: "Weather",
      region,
      regionName: r.name,
      date: today,
      summary: `${weather.condition} with ${weather.temperature}°C and ${weather.windSpeed} km/h ${weather.windDirection} winds over the ${r.waterBody}.`,
      rows: [
        { label: "Temperature", value: `${weather.temperature} °C` },
        { label: "Condition", value: weather.condition },
        { label: "Wind", value: `${weather.windSpeed} km/h ${weather.windDirection}` },
        { label: "Humidity", value: `${weather.humidity}%` },
        { label: "Pressure", value: `${weather.pressure} hPa` },
        { label: "Visibility", value: `${weather.visibility} km` },
      ],
    },
    {
      id: `${region}-rep-prod`,
      title: `${r.name} — Productivity Assessment`,
      type: "Productivity",
      region,
      regionName: r.name,
      date: yest,
      summary: `Productivity score ${prod.score}/100 with ${prod.high}% of the shelf in the high productivity band.`,
      rows: [
        { label: "Productivity score", value: `${prod.score}/100` },
        { label: "High productivity", value: `${prod.high}%` },
        { label: "Medium productivity", value: `${prod.medium}%` },
        { label: "Low productivity", value: `${prod.low}%` },
        { label: "Chlorophyll influence", value: `${prod.chlorophyllInfluence}%` },
      ],
    },
    {
      id: `${region}-rep-dis`,
      title: `${r.name} — Disaster History (12 months)`,
      type: "Disaster",
      region,
      regionName: r.name,
      date: week,
      summary: `${dis.totalEvents} recorded marine events, of which ${dis.severeEvents} were severe. Most affected: ${dis.affected[0].name}.`,
      rows: [
        { label: "Total events", value: `${dis.totalEvents}` },
        { label: "Severe events", value: `${dis.severeEvents}` },
        { label: "Most affected", value: `${dis.affected[0].name} (${dis.affected[0].impact}%)` },
      ],
    },
    {
      id: `${region}-rep-alerts`,
      title: `${r.name} — Alert Digest`,
      type: "Alert Digest",
      region,
      regionName: r.name,
      date: today,
      summary: `${alerts.filter((a) => a.status === "Active").length} active alerts across ${alerts.length} monitored sea areas.`,
      rows: alerts
        .slice(0, 6)
        .map((a) => ({ label: a.location, value: `${a.severity.toUpperCase()} — ${a.title}` })),
    },
  ];
}

/* ------------------------------------------------------ automation engine */

export interface AutomationSignal {
  id: string;
  label: string;
  value: string;
  score: number;
  triggered: boolean;
}

export interface AutomationState {
  monitoring: boolean;
  signals: AutomationSignal[];
  score: number;
  threshold: number;
  triggered: boolean;
  lastRun: string;
  generatedAlerts: number;
}

export function runRiskAutomation(
  region: RegionId,
  opts: {
    enabled: boolean;
    threshold: number;
    detections: Record<string, boolean>;
  },
): AutomationState {
  const risk = getRisk(region);
  const weather = getWeather(region);
  const ocean = getOcean(region);
  const all: AutomationSignal[] = [
    { id: "weather", label: "Weather", value: `${weather.condition}, ${weather.temperature}°C`, score: risk.weather, triggered: false },
    { id: "ocean", label: "Ocean", value: `${ocean.seaState} sea, ${ocean.currentSpeed} m/s current`, score: risk.ocean, triggered: false },
    { id: "sst", label: "SST", value: `${getSST(region).current}°C`, score: Math.round(getSST(region).score * 0.6), triggered: false },
    { id: "wave", label: "Waves", value: `${ocean.waveHeight} m`, score: risk.wave, triggered: false },
    { id: "wind", label: "Wind", value: `${weather.windSpeed} km/h ${weather.windDirection}`, score: risk.wind, triggered: false },
    { id: "cyclone", label: "Cyclone", value: risk.cyclone > 50 ? "System forming" : "No system", score: risk.cyclone, triggered: false },
    { id: "lightning", label: "Lightning", value: risk.lightning > 45 ? "Active cells" : "Quiet", score: risk.lightning, triggered: false },
    { id: "geofence", label: "Geofence", value: `${risk.zones.filter((z) => z.level === "restricted").length} restricted zone(s)`, score: risk.zones.some((z) => z.level === "restricted") ? 70 : 12, triggered: false },
  ];
  const active = all.filter((s) => opts.detections[s.id] !== false);
  const score = active.length
    ? Math.round(active.reduce((sum, s) => sum + s.score, 0) / active.length)
    : 0;
  const signals = all.map((s) => ({
    ...s,
    triggered: opts.detections[s.id] !== false && s.score >= opts.threshold,
  }));
  return {
    monitoring: opts.enabled,
    signals,
    score,
    threshold: opts.threshold,
    triggered: opts.enabled && score >= opts.threshold,
    lastRun: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    generatedAlerts: signals.filter((s) => s.triggered).length,
  };
}

/* ------------------------------------------------------------- AI insight */

export function getInsight(region: RegionId, topic: string): string {
  const r = getRegion(region);
  const risk = getRisk(region);
  const sst = getSST(region);
  const chl = getChlorophyll(region);
  const ocean = getOcean(region);
  const weather = getWeather(region);
  const prod = getProductivity(region);
  const zones = getFishingZones(region);
  switch (topic) {
    case "sst":
      return `SST across ${r.name} averages ${sst.current}°C (${sst.anomaly >= 0 ? "+" : ""}${sst.anomaly}°C anomaly) — ${sst.anomaly > 0.6 ? "warmer than normal, pushing pelagic shoals deeper" : "close to seasonal normal, favourable for surface shoals"}.`;
    case "chlorophyll":
      return `Chlorophyll-a at ${chl.concentration} mg/m³ with ${chl.distribution[0].value}% of the shelf in the high band — ${chl.topRegions[0].name} shows the strongest bloom signal.`;
    case "weather":
      return `${weather.condition} over the ${r.waterBody}: ${weather.windSpeed} km/h ${weather.windDirection} winds and ${weather.visibility} km visibility ${weather.windSpeed > 25 ? "will make small-boat operations difficult" : "support normal coastal operations"}.`;
    case "ocean":
      return `${ocean.seaState} sea state with ${ocean.waveHeight} m waves and ${ocean.swell} m swell at ${ocean.swellPeriod}s — ${ocean.waveHeight > 2 ? "keep vessels within sheltered waters" : "conditions are workable for day trips"}.`;
    case "spatial":
      return `Risk and productivity hotspots overlap near ${prod.zones[0].name}; SST–chlorophyll correlation is ${chl.productivityCorrelation}, indicating ${chl.productivityCorrelation > 0.75 ? "strong" : "moderate"} coupling.`;
    case "productivity":
      return `Productivity index ${prod.score}/100 for ${r.name}; chlorophyll contributes ${prod.chlorophyllInfluence}% of the signal, making ${prod.zones[0].name} the priority ground.`;
    case "disaster":
      return `Historical marine events cluster around ${r.name}'s northern coast; severity is trending ${risk.cyclone > 45 ? "upward with active cyclogenesis potential" : "downward this season"}.`;
    case "risk":
      return `Overall marine risk ${risk.overall}% (${risk.level}) driven by ${risk.cause.toLowerCase()}; ${risk.zones[0].name} is the highest exposure zone at ${risk.zones[0].risk}%.`;
    case "fishing":
    default:
      return `${zones[0].name} offers ${zones[0].probability}% catch probability ${zones[0].distanceKm} km ${zones[0].direction} — best window ${zones[0].bestTime}, risk ${risk.overall}%.`;
  }
}

export const marineDataService = {
  getWeather,
  getWeatherSeries,
  getSST,
  getChlorophyll,
  getOcean,
  getRisk,
  getFishingZones,
  getFishingStatus,
  getProductivity,
  getSpatial,
  getDisasters,
  getAlerts,
  getReports,
  runRiskAutomation,
  getInsight,
};

export type { Region, RegionId, CoastalPlace };
export { AP_PLACES };
