import { marineDataService } from "./marineDataService";
import { getRegion, type RegionId } from "./regions";
import type { ChatMessage, Role } from "./store";

export const QUICK_PROMPTS = [
  "Where is the best fishing zone today?",
  "Is the sea safe?",
  "What is the weather?",
  "Should I go fishing now?",
  "Which area has high fish productivity?",
  "What are today's risks?",
];

export interface AssistantContext {
  region: RegionId;
  role: Role;
  page: string;
  history: ChatMessage[];
  userName: string;
}

const has = (text: string, ...words: string[]) =>
  words.some((w) => text.toLowerCase().includes(w));

/**
 * Local demo intelligence service. If an AI API becomes available later,
 * replace the body of `askOrca` with a server-function call — the return
 * shape stays identical.
 */
export function askOrca(
  question: string,
  ctx: AssistantContext,
): Omit<ChatMessage, "id" | "time"> {
  const q = question.trim();
  const reg = getRegion(ctx.region);
  const risk = marineDataService.getRisk(ctx.region);
  const weather = marineDataService.getWeather(ctx.region);
  const ocean = marineDataService.getOcean(ctx.region);
  const zones = marineDataService.getFishingZones(ctx.region);
  const prod = marineDataService.getProductivity(ctx.region);
  const sst = marineDataService.getSST(ctx.region);
  const chl = marineDataService.getChlorophyll(ctx.region);
  const alerts = marineDataService.getAlerts(ctx.region);
  const status = marineDataService.getFishingStatus(ctx.region);
  const prevUser = [...ctx.history].reverse().find((m) => m.role === "user")?.text ?? "";
  const followUp = has(q, "why", "and", "what about", "more", "explain") && prevUser;

  const base = (text: string, extra: Partial<ChatMessage> = {}) => ({
    role: "orca" as const,
    text,
    ...extra,
  });

  if (has(q, "hello", "hi ", "hey", "namaste") || q.toLowerCase() === "hi") {
    return base(
      `Hello ${ctx.userName || "there"}. I'm ORCA, monitoring ${reg.name} (${reg.waterBody}). You are on the ${ctx.page} page. Ask me about fishing zones, sea safety, weather, productivity or risks.`,
    );
  }

  if (has(q, "best fishing", "fishing zone", "where", "catch", "zone today")) {
    const z = zones[0];
    return base(
      `Best ground right now is ${z.name}${z.telugu ? ` (${z.telugu})` : ""} — ${z.probability}% catch probability, ${z.distanceKm} km ${z.direction} of the coast at ~${z.depth} m depth. Recommended window ${z.bestTime}. ${z.reason}`,
      {
        cards: [
          { label: "Zone", value: z.name },
          { label: "Probability", value: `${z.probability}%` },
          { label: "Distance", value: `${z.distanceKm} km ${z.direction}` },
          { label: "Best time", value: z.bestTime },
        ],
        chart: zones.slice(0, 5).map((x) => ({ label: x.name.split(" ")[0], value: x.probability })),
      },
    );
  }

  if (has(q, "safe", "safety", "danger", "should i go")) {
    return base(
      `Sea safety for ${reg.name}: ${status.safety.toUpperCase()}. ${status.note} ${
        status.status === "Not advised"
          ? "Do not venture out — return to harbour if already at sea."
          : status.status === "Caution"
            ? "You may sail but stay within 10 nautical miles and monitor alerts."
            : "Conditions are workable for day trips."
      }`,
      {
        cards: [
          { label: "Fishing status", value: status.status },
          { label: "Safety", value: status.safety },
          { label: "Overall risk", value: `${risk.overall}%` },
          { label: "Sea state", value: ocean.seaState },
        ],
      },
    );
  }

  if (has(q, "weather", "rain", "wind", "temperature", "humidity")) {
    return base(
      `${weather.condition} over ${reg.name}. Air temperature ${weather.temperature}°C, wind ${weather.windSpeed} km/h from ${weather.windDirection}, humidity ${weather.humidity}%, visibility ${weather.visibility} km, pressure ${weather.pressure} hPa.`,
      {
        cards: [
          { label: "Temperature", value: `${weather.temperature} °C` },
          { label: "Wind", value: `${weather.windSpeed} km/h ${weather.windDirection}` },
          { label: "Humidity", value: `${weather.humidity}%` },
          { label: "Visibility", value: `${weather.visibility} km` },
        ],
        chart: marineDataService
          .getWeatherSeries(ctx.region, "today")
          .map((p) => ({ label: p.label, value: p.temperature })),
      },
    );
  }

  if (has(q, "productiv", "chlorophyll", "plankton", "fish density")) {
    return base(
      `Productivity index for ${reg.name} is ${prod.score}/100. Chlorophyll-a averages ${chl.concentration} mg/m³ and ${prod.high}% of the shelf is in the high band. Priority ground: ${prod.zones[0].name} (${prod.zones[0].value}%).`,
      {
        cards: [
          { label: "Productivity", value: `${prod.score}/100` },
          { label: "Chlorophyll", value: `${chl.concentration} mg/m³` },
          { label: "High band", value: `${prod.high}%` },
          { label: "SST", value: `${sst.current} °C` },
        ],
        chart: prod.zones.slice(0, 5).map((z) => ({ label: z.name.slice(0, 7), value: z.value })),
      },
    );
  }

  if (has(q, "risk", "cyclone", "lightning", "wave", "storm", "hazard")) {
    return base(
      `Overall marine risk for ${reg.name} is ${risk.overall}% (${risk.level}), driven mainly by ${risk.cause.toLowerCase()}. Highest exposure: ${risk.zones[0].name} at ${risk.zones[0].risk}%.`,
      {
        cards: [
          { label: "Overall", value: `${risk.overall}%` },
          { label: "Wave", value: `${risk.wave}%` },
          { label: "Wind", value: `${risk.wind}%` },
          { label: "Cyclone", value: `${risk.cyclone}%` },
        ],
        chart: [
          { label: "Weather", value: risk.weather },
          { label: "Ocean", value: risk.ocean },
          { label: "Wave", value: risk.wave },
          { label: "Wind", value: risk.wind },
          { label: "Cyclone", value: risk.cyclone },
          { label: "Lightning", value: risk.lightning },
        ],
      },
    );
  }

  if (has(q, "alert", "warning", "advisory")) {
    const active = alerts.filter((a) => a.status === "Active");
    return base(
      `${active.length} active alert(s) for ${reg.name}. Most severe: ${active[0]?.title ?? "none"}${active[0] ? ` at ${active[0].location} — ${active[0].action}` : ""}.`,
      {
        cards: active
          .slice(0, 4)
          .map((a) => ({ label: a.location, value: `${a.severity} · ${a.time}` })),
      },
    );
  }

  if (has(q, "sst", "sea surface", "water temp")) {
    return base(
      `Sea surface temperature in ${reg.name} is ${sst.current}°C with a ${sst.anomaly >= 0 ? "+" : ""}${sst.anomaly}°C anomaly. Range ${sst.min}–${sst.max}°C. Thermal condition score ${sst.score}/100.`,
      { chart: sst.trend.map((t) => ({ label: t.label, value: t.value })) },
    );
  }

  if (has(q, "tide", "current", "swell", "sea state", "ocean")) {
    return base(
      `Ocean state: ${ocean.seaState}, wave height ${ocean.waveHeight} m, swell ${ocean.swell} m at ${ocean.swellPeriod}s, current ${ocean.currentSpeed} m/s toward ${ocean.currentDirection}. Tide is ${ocean.tideState.toLowerCase()} — high tide ${ocean.highTide}, low tide ${ocean.lowTide}.`,
      {
        cards: [
          { label: "Wave height", value: `${ocean.waveHeight} m` },
          { label: "Swell", value: `${ocean.swell} m` },
          { label: "Current", value: `${ocean.currentSpeed} m/s ${ocean.currentDirection}` },
          { label: "Tide", value: ocean.tideState },
        ],
      },
    );
  }

  if (has(q, "region", "where am i", "which area")) {
    return base(
      `You are monitoring ${reg.name}${reg.localName ? ` / ${reg.localName}` : ""} over the ${reg.waterBody}. Change the region from any page selector and every chart, map and alert updates with it.`,
    );
  }

  if (has(q, "report")) {
    return base(
      `You can open the Reports page to view or generate reports for ${reg.name}. Latest summary: risk ${risk.overall}%, productivity ${prod.score}/100, ${alerts.filter((a) => a.status === "Active").length} active alerts.`,
    );
  }

  return base(
    `${followUp ? `Continuing from "${prevUser}" — ` : ""}Here is the current picture for ${reg.name}: ${marineDataService.getInsight(ctx.region, ctx.role === "fisherman" ? "fishing" : "risk")} Ask me about fishing zones, sea safety, weather, SST, chlorophyll, productivity, risks or alerts.`,
    {
      cards: [
        { label: "Region", value: reg.name },
        { label: "Risk", value: `${risk.overall}%` },
        { label: "Sea", value: ocean.seaState },
        { label: "Weather", value: weather.condition },
      ],
    },
  );
}
