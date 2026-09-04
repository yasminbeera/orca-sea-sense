import { useEffect, useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  ChevronDown,
  Fish,
  FileText,
  Globe2,
  Home,
  Layers,
  LogOut,
  MapPin,
  Menu,
  MessageSquare,
  Moon,
  Settings as SettingsIcon,
  ShieldAlert,
  Sun,
  Thermometer,
  Waves,
  X,
  Leaf,
  CloudSun,
  Satellite,
} from "lucide-react";
import { useOrca } from "@/lib/orca/store";
import { REGIONS, type RegionId } from "@/lib/orca/regions";
import { ProfileGate } from "./ProfileGate";
import { OrcaLogo } from "./OrcaLogo";
import { cn } from "@/lib/utils";

interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
  children?: { to: string; label: string; icon: ReactNode }[];
}

const ic = "h-4 w-4";

const FISHERMAN_NAV: NavItem[] = [
  { to: "/", label: "Home", icon: <Home className={ic} /> },
  { to: "/ask", label: "Ask ORCA", icon: <MessageSquare className={ic} /> },
  { to: "/zones", label: "Fish Zones", icon: <Fish className={ic} /> },
  { to: "/weather", label: "Weather", icon: <CloudSun className={ic} /> },
  { to: "/risk", label: "Risk Map", icon: <ShieldAlert className={ic} /> },
  { to: "/alerts", label: "Alerts", icon: <AlertTriangle className={ic} /> },
  { to: "/settings", label: "Settings", icon: <SettingsIcon className={ic} /> },
];

const ANALYST_NAV: NavItem[] = [
  { to: "/", label: "Home", icon: <Home className={ic} /> },
  { to: "/ask", label: "Ask ORCA", icon: <MessageSquare className={ic} /> },
  { to: "/weather-status", label: "Weather Status", icon: <CloudSun className={ic} /> },
  {
    to: "/analysis",
    label: "Analysis",
    icon: <BarChart3 className={ic} />,
    children: [
      { to: "/analysis/sst", label: "SST Analysis", icon: <Thermometer className={ic} /> },
      { to: "/analysis/chlorophyll", label: "Chlorophyll Analysis", icon: <Leaf className={ic} /> },
      { to: "/analysis/weather", label: "Weather Analysis", icon: <CloudSun className={ic} /> },
      { to: "/analysis/ocean", label: "Ocean Analysis", icon: <Waves className={ic} /> },
      { to: "/analysis/spatial", label: "Spatial Analysis", icon: <Layers className={ic} /> },
    ],
  },
  { to: "/productivity", label: "Productivity", icon: <Activity className={ic} /> },
  { to: "/disasters", label: "Period & Disaster", icon: <Satellite className={ic} /> },
  { to: "/risk", label: "Risk / Danger Zones", icon: <ShieldAlert className={ic} /> },
  { to: "/alerts", label: "Alerts", icon: <AlertTriangle className={ic} /> },
  { to: "/reports", label: "Reports", icon: <FileText className={ic} /> },
  { to: "/settings", label: "Settings", icon: <SettingsIcon className={ic} /> },
];

export const PAGE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/ask": "Ask ORCA",
  "/zones": "Fish Zones",
  "/weather": "Weather",
  "/weather-status": "Weather Status",
  "/risk": "Risk / Danger Zones",
  "/alerts": "Alerts",
  "/settings": "Settings",
  "/reports": "Reports",
  "/productivity": "Productivity",
  "/disasters": "Period & Disaster Analysis",
  "/analysis/sst": "SST Analysis",
  "/analysis/chlorophyll": "Chlorophyll Analysis",
  "/analysis/weather": "Weather Analysis",
  "/analysis/ocean": "Ocean Analysis",
  "/analysis/spatial": "Spatial Analysis",
};

export function AppShell({ children }: { children: ReactNode }) {
  const { ready, profile, settings, saveSettings, sidebarOpen, setSidebarOpen, region, setRegion, resetProfile } =
    useOrca();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [analysisOpen, setAnalysisOpen] = useState(pathname.startsWith("/analysis"));
  const [profileMenu, setProfileMenu] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
    setProfileMenu(false);
  }, [pathname, setSidebarOpen]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Loading ORCA…</p>
      </div>
    );
  }

  if (!profile) return <ProfileGate />;

  const nav = profile.role === "fisherman" ? FISHERMAN_NAV : ANALYST_NAV;
  const title = PAGE_TITLES[pathname] ?? "ORCA";

  const NavLinks = (
    <nav className="flex flex-col gap-1 p-3" aria-label="Main navigation">
      {nav.map((item) =>
        item.children ? (
          <div key={item.to}>
            <button
              type="button"
              onClick={() => setAnalysisOpen((v) => !v)}
              aria-expanded={analysisOpen}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground transition hover:bg-sidebar-accent focus-visible:outline-2 focus-visible:outline-ring"
            >
              {item.icon}
              <span className="flex-1 text-left">{item.label}</span>
              <ChevronDown
                className={cn("h-4 w-4 transition-transform", analysisOpen && "rotate-180")}
              />
            </button>
            {analysisOpen && (
              <div className="ml-4 mt-1 flex flex-col gap-1 border-l border-sidebar-border pl-3">
                {item.children.map((c) => (
                  <Link
                    key={c.to}
                    to={c.to}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition hover:bg-sidebar-accent",
                      pathname === c.to
                        ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {c.icon}
                    {c.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ) : (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-sidebar-accent",
              pathname === item.to
                ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                : "text-sidebar-foreground",
            )}
          >
            {item.icon}
            {item.label}
          </Link>
        ),
      )}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
        <div className="flex h-16 items-center gap-3 px-3 sm:px-4">
          <button
            type="button"
            aria-label="Open navigation"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-lg border border-border p-2 text-foreground shadow-sm transition hover:bg-accent lg:hidden"
          >
            {sidebarOpen ? <Menu className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <Link to="/" className="flex items-center gap-2">
            <OrcaLogo className="h-8 w-8" />
            <span className="hidden flex-col leading-tight sm:flex">
              <span className="text-base font-bold tracking-tight text-foreground">ORCA</span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Marine Intelligence
              </span>
            </span>
          </Link>
          <span className="hidden h-6 w-px bg-border md:block" />
          <span className="hidden text-sm font-medium text-foreground md:block">{title}</span>

          <div className="ml-auto flex items-center gap-2">
            <span className="hidden items-center gap-1.5 rounded-full border border-border bg-muted/60 px-2.5 py-1 text-xs font-medium text-foreground sm:flex">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              <select
                aria-label="Active region"
                value={region}
                onChange={(e) => setRegion(e.target.value as RegionId)}
                className="bg-transparent text-xs font-medium focus-visible:outline-none"
              >
                {REGIONS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </span>
            <label className="hidden items-center gap-1 rounded-lg border border-border bg-card px-2 py-1.5 text-xs shadow-sm md:flex">
              <Globe2 className="h-3.5 w-3.5 text-muted-foreground" />
              <select
                aria-label="Language"
                value={settings.language}
                onChange={(e) => saveSettings({ language: e.target.value as "en" | "te" })}
                className="bg-transparent focus-visible:outline-none"
              >
                <option value="en">EN</option>
                <option value="te">తె</option>
              </select>
            </label>
            <button
              type="button"
              aria-label="Toggle theme"
              onClick={() => saveSettings({ theme: settings.theme === "dark" ? "light" : "dark" })}
              className="rounded-lg border border-border bg-card p-2 text-foreground shadow-sm transition hover:bg-accent"
            >
              {settings.theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <Link
              to="/reports"
              className="hidden items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground shadow-sm transition hover:bg-accent sm:flex"
            >
              <FileText className="h-4 w-4" />
              Reports
            </Link>
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileMenu((v) => !v)}
                aria-expanded={profileMenu}
                aria-label="Profile menu"
                className="flex items-center gap-2 rounded-lg border border-border bg-card px-2 py-1.5 text-sm font-medium text-foreground shadow-sm transition hover:bg-accent"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {profile.name.charAt(0).toUpperCase()}
                </span>
                <span className="hidden max-w-24 truncate sm:inline">{profile.name}</span>
              </button>
              {profileMenu && (
                <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-border bg-popover p-2 shadow-lg">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-semibold text-foreground">{profile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {profile.role === "fisherman" ? "Fisherman" : "Marine Intelligence User"}
                    </p>
                  </div>
                  <div className="my-1 h-px bg-border" />
                  <Link
                    to="/settings"
                    className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-foreground hover:bg-accent"
                  >
                    <SettingsIcon className="h-4 w-4" /> Settings
                  </Link>
                  <Link
                    to="/reports"
                    className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-foreground hover:bg-accent"
                  >
                    <FileText className="h-4 w-4" /> Reports
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileMenu(false);
                      resetProfile();
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-destructive hover:bg-accent"
                  >
                    <LogOut className="h-4 w-4" /> Reset profile
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 overflow-y-auto border-r border-sidebar-border bg-sidebar lg:block">
          {NavLinks}
        </aside>

        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              aria-label="Close navigation"
              className="absolute inset-0 bg-foreground/30"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] overflow-y-auto border-r border-sidebar-border bg-sidebar shadow-xl">
              <div className="flex items-center justify-between border-b border-sidebar-border px-4 py-4">
                <div className="flex items-center gap-2">
                  <OrcaLogo className="h-7 w-7" />
                  <span className="font-bold text-foreground">ORCA</span>
                </div>
                <button
                  type="button"
                  aria-label="Close navigation"
                  onClick={() => setSidebarOpen(false)}
                  className="rounded-lg border border-border p-1.5"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {NavLinks}
            </div>
          </div>
        )}

        <main className="min-w-0 flex-1 px-3 py-5 sm:px-5 lg:px-7">
          <div className="mx-auto w-full max-w-[1400px] space-y-5">{children}</div>
        </main>
      </div>
    </div>
  );
}
