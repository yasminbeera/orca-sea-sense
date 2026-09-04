import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Send, Sparkles, Trash2 } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader, Panel, RegionSelector } from "@/components/orca/ui";
import { askOrca, QUICK_PROMPTS } from "@/lib/orca/assistant";
import { getRegion } from "@/lib/orca/regions";
import { useOrca, type ChatMessage } from "@/lib/orca/store";
import { MarineMap, MAP_COLORS } from "@/components/orca/MarineMap";
import { marineDataService } from "@/lib/orca/marineDataService";

export const Route = createFileRoute("/ask")({
  head: () => ({
    meta: [
      { title: "Ask ORCA — Marine AI Assistant" },
      {
        name: "description",
        content:
          "Multi-turn marine assistant answering fishing, weather, ocean and risk questions with live regional context.",
      },
      { property: "og:title", content: "Ask ORCA — Marine AI Assistant" },
      {
        property: "og:description",
        content: "Contextual marine assistant for fishing zones, safety, weather and risk.",
      },
    ],
  }),
  component: AskPage,
});

const now = () =>
  new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

function AskPage() {
  const { region, chat, setChat, profile } = useOrca();
  const reg = getRegion(region);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const risk = marineDataService.getRisk(region);
  const zones = marineDataService.getFishingZones(region);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest" });
  }, [chat.length]);

  const send = (text: string) => {
    const q = text.trim();
    if (!q) return;
    const userMsg: ChatMessage = {
      id: `u${Date.now()}`,
      role: "user",
      text: q,
      time: now(),
    };
    setChat((prev) => {
      const reply = askOrca(q, {
        region,
        role: profile?.role ?? "fisherman",
        page: "Ask ORCA",
        history: prev,
        userName: profile?.name ?? "",
      });
      return [...prev, userMsg, { ...reply, id: `o${Date.now()}`, time: now() }];
    });
    setInput("");
  };

  return (
    <>
      <PageHeader
        title="Ask ORCA"
        description={`Contextual marine assistant · ${reg.name} · role: ${profile?.role === "analyst" ? "Marine Intelligence User" : "Fisherman"}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <RegionSelector />
            <button
              type="button"
              onClick={() => setChat([])}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium shadow-sm transition hover:bg-accent"
            >
              <Trash2 className="h-4 w-4" /> Clear chat
            </button>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2" title="Conversation">
          <div className="flex flex-wrap gap-2 pb-3">
            {QUICK_PROMPTS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => send(p)}
                className="rounded-full border border-border bg-muted/50 px-3 py-1.5 text-xs font-medium text-foreground shadow-sm transition hover:bg-accent"
              >
                {p}
              </button>
            ))}
          </div>

          <div className="max-h-[480px] min-h-[280px] space-y-3 overflow-y-auto rounded-lg border border-border bg-muted/20 p-3">
            {chat.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center gap-2 py-12 text-center">
                <Sparkles className="h-6 w-6 text-primary" />
                <p className="text-sm font-medium text-foreground">
                  Ask about fishing zones, sea safety, weather, SST or risks.
                </p>
                <p className="text-xs text-muted-foreground">
                  ORCA remembers your role, region, page and previous messages.
                </p>
              </div>
            )}
            {chat.map((m) => (
              <div
                key={m.id}
                className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
              >
                <div
                  className={
                    m.role === "user"
                      ? "max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3.5 py-2.5 text-sm text-primary-foreground shadow-sm"
                      : "max-w-[92%] rounded-2xl rounded-bl-sm border border-border bg-card px-3.5 py-2.5 text-sm text-foreground shadow-sm"
                  }
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                  {m.cards && (
                    <div className="mt-2.5 grid grid-cols-2 gap-2">
                      {m.cards.map((c) => (
                        <div key={c.label} className="rounded-lg border border-border bg-muted/40 p-2">
                          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                            {c.label}
                          </p>
                          <p className="text-sm font-semibold text-foreground">{c.value}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {m.chart && (
                    <div className="mt-3 h-40">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={m.chart}>
                          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 250)" />
                          <XAxis dataKey="label" fontSize={10} />
                          <YAxis fontSize={10} />
                          <Tooltip />
                          <Bar dataKey="value" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                  <p className="mt-1.5 text-[10px] opacity-70">{m.time}</p>
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>

          <form
            className="mt-3 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              aria-label="Message ORCA"
              placeholder={`Ask about ${reg.name}…`}
              className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2.5 text-sm shadow-sm focus-visible:outline-2 focus-visible:outline-ring"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition hover:brightness-110"
            >
              <Send className="h-4 w-4" /> Send
            </button>
          </form>
        </Panel>

        <div className="space-y-4">
          <MarineMap
            region={region}
            title="Conversation context"
            height={300}
            layers={[
              {
                id: "ctx",
                label: "Discussed zones",
                points: zones.slice(0, 4).map((z) => ({
                  id: z.id,
                  lat: z.lat,
                  lon: z.lon,
                  label: `${z.probability}%`,
                  kind: "zone" as const,
                  radiusKm: 14,
                  color: MAP_COLORS.green,
                })),
              },
              {
                id: "risk",
                label: "Risk zones",
                defaultOn: false,
                points: risk.zones.slice(0, 4).map((z) => ({
                  id: z.id,
                  lat: z.lat,
                  lon: z.lon,
                  label: `${z.risk}%`,
                  color: MAP_COLORS.high,
                })),
              },
            ]}
            legend={[
              { color: MAP_COLORS.green, label: "Fishing zone" },
              { color: MAP_COLORS.high, label: "Risk zone" },
            ]}
          />
          <Panel title="Assistant memory">
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li>
                Role: <span className="font-medium text-foreground">{profile?.role === "analyst" ? "Marine Intelligence User" : "Fisherman"}</span>
              </li>
              <li>
                Region: <span className="font-medium text-foreground">{reg.name}</span>
              </li>
              <li>
                Page context: <span className="font-medium text-foreground">Ask ORCA</span>
              </li>
              <li>
                Turns remembered: <span className="font-medium text-foreground">{chat.length}</span>
              </li>
            </ul>
          </Panel>
        </div>
      </div>
    </>
  );
}
