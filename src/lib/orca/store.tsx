import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { RegionId } from "./regions";
import { getRegion } from "./regions";

export type Role = "fisherman" | "analyst";
export type Language = "en" | "te";

export interface Profile {
  name: string;
  role: Role;
  createdAt: string;
}

export interface Settings {
  defaultRegion: RegionId;
  language: Language;
  theme: "light" | "dark";
  notifications: boolean;
  soundAlerts: boolean;
  riskAutomation: boolean;
  alertAutomation: boolean;
  riskThreshold: number;
  detections: Record<string, boolean>;
  alertPreferences: Record<string, boolean>;
  mapLabels: boolean;
  mapTelugu: boolean;
  mapGrid: boolean;
  compactCards: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  defaultRegion: "india",
  language: "en",
  theme: "light",
  notifications: true,
  soundAlerts: false,
  riskAutomation: true,
  alertAutomation: true,
  riskThreshold: 60,
  detections: {
    cyclone: true,
    wave: true,
    lightning: true,
    wind: true,
    weather: true,
    ocean: true,
    sst: true,
    geofence: true,
    rain: true,
  },
  alertPreferences: { critical: true, high: true, medium: true, resolved: false },
  mapLabels: true,
  mapTelugu: true,
  mapGrid: true,
  compactCards: false,
};

export interface ChatMessage {
  id: string;
  role: "user" | "orca";
  text: string;
  cards?: { label: string; value: string }[];
  chart?: { label: string; value: number }[];
  time: string;
}

export interface GeneratedReport {
  id: string;
  title: string;
  type: string;
  regionName: string;
  date: string;
  summary: string;
  rows: { label: string; value: string }[];
  generated: true;
}

interface OrcaState {
  ready: boolean;
  profile: Profile | null;
  setProfile: (p: Profile) => void;
  resetProfile: () => void;
  region: RegionId;
  setRegion: (r: RegionId) => void;
  regionName: string;
  settings: Settings;
  updateSettings: (patch: Partial<Settings>) => void;
  saveSettings: (patch: Partial<Settings>) => void;
  chat: ChatMessage[];
  setChat: (m: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => void;
  generatedReports: GeneratedReport[];
  addReport: (r: GeneratedReport) => void;
  removeReport: (id: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  t: (en: string, te: string) => string;
}

const Ctx = createContext<OrcaState | null>(null);

const KEY = {
  profile: "orca.profile",
  region: "orca.region",
  settings: "orca.settings",
  reports: "orca.reports",
  chat: "orca.chat",
};

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? ({ ...(fallback as object), ...JSON.parse(raw) } as T) : fallback;
  } catch {
    return fallback;
  }
}

export function OrcaProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [profile, setProfileState] = useState<Profile | null>(null);
  const [region, setRegionState] = useState<RegionId>("india");
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    try {
      const rawProfile = window.localStorage.getItem(KEY.profile);
      if (rawProfile) setProfileState(JSON.parse(rawProfile));
      const s = read<Settings>(KEY.settings, DEFAULT_SETTINGS);
      setSettings(s);
      const r = window.localStorage.getItem(KEY.region) as RegionId | null;
      setRegionState(r ?? s.defaultRegion);
      const reps = window.localStorage.getItem(KEY.reports);
      if (reps) setGeneratedReports(JSON.parse(reps));
      const c = window.localStorage.getItem(KEY.chat);
      if (c) setChat(JSON.parse(c));
    } catch {
      /* ignore corrupt storage */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.classList.toggle("dark", settings.theme === "dark");
  }, [settings.theme, ready]);

  const persist = (key: string, value: unknown) => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage unavailable */
    }
  };

  const setProfile = useCallback((p: Profile) => {
    setProfileState(p);
    persist(KEY.profile, p);
  }, []);

  const resetProfile = useCallback(() => {
    setProfileState(null);
    setChat([]);
    try {
      window.localStorage.removeItem(KEY.profile);
      window.localStorage.removeItem(KEY.chat);
    } catch {
      /* noop */
    }
  }, []);

  const setRegion = useCallback((r: RegionId) => {
    setRegionState(r);
    try {
      window.localStorage.setItem(KEY.region, r);
    } catch {
      /* noop */
    }
  }, []);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const saveSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      persist(KEY.settings, next);
      return next;
    });
  }, []);

  const addReport = useCallback((r: GeneratedReport) => {
    setGeneratedReports((prev) => {
      const next = [r, ...prev];
      persist(KEY.reports, next);
      return next;
    });
  }, []);

  const removeReport = useCallback((id: string) => {
    setGeneratedReports((prev) => {
      const next = prev.filter((r) => r.id !== id);
      persist(KEY.reports, next);
      return next;
    });
  }, []);

  const setChatPersist = useCallback(
    (m: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => {
      setChat((prev) => {
        const next = typeof m === "function" ? m(prev) : m;
        persist(KEY.chat, next.slice(-40));
        return next;
      });
    },
    [],
  );

  const t = useCallback(
    (en: string, te: string) => (settings.language === "te" ? te : en),
    [settings.language],
  );

  const value = useMemo<OrcaState>(
    () => ({
      ready,
      profile,
      setProfile,
      resetProfile,
      region,
      setRegion,
      regionName: getRegion(region).name,
      settings,
      updateSettings,
      saveSettings,
      chat,
      setChat: setChatPersist,
      generatedReports,
      addReport,
      removeReport,
      sidebarOpen,
      setSidebarOpen,
      t,
    }),
    [
      ready,
      profile,
      setProfile,
      resetProfile,
      region,
      setRegion,
      settings,
      updateSettings,
      saveSettings,
      chat,
      setChatPersist,
      generatedReports,
      addReport,
      removeReport,
      sidebarOpen,
      t,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useOrca(): OrcaState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useOrca must be used inside OrcaProvider");
  return ctx;
}
