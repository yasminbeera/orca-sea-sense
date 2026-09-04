import { useState } from "react";
import { Fish, Satellite } from "lucide-react";
import { useOrca, type Role } from "@/lib/orca/store";
import { OrcaLogo } from "./OrcaLogo";
import { cn } from "@/lib/utils";

export function ProfileGate() {
  const { setProfile } = useOrca();
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      setError("Please enter your name (at least 2 characters).");
      return;
    }
    if (!role) {
      setError("Please select a role to continue.");
      return;
    }
    setError(null);
    setProfile({ name: name.trim(), role, createdAt: new Date().toISOString() });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[oklch(0.97_0.015_235)] px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl sm:p-8">
        <div className="flex flex-col items-center text-center">
          <OrcaLogo className="h-16 w-16" />
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground">ORCA</h1>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            Marine Intelligence
          </p>
        </div>

        <form onSubmit={submit} className="mt-7 space-y-5" noValidate>
          <div>
            <label htmlFor="orca-name" className="text-sm font-medium text-foreground">
              Name
            </label>
            <input
              id="orca-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              autoComplete="name"
              className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground shadow-sm focus-visible:outline-2 focus-visible:outline-ring"
            />
          </div>

          <div>
            <p className="text-sm font-medium text-foreground">Role</p>
            <div className="mt-1.5 grid gap-2 sm:grid-cols-2">
              {(
                [
                  { id: "fisherman" as Role, label: "Fisherman", sub: "Trip & safety guidance", icon: Fish },
                  {
                    id: "analyst" as Role,
                    label: "Others",
                    sub: "Marine Intelligence User",
                    icon: Satellite,
                  },
                ]
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setRole(opt.id)}
                  aria-pressed={role === opt.id}
                  className={cn(
                    "flex flex-col items-start gap-1 rounded-xl border p-3 text-left shadow-sm transition focus-visible:outline-2 focus-visible:outline-ring",
                    role === opt.id
                      ? "border-primary bg-[oklch(0.96_0.03_240)] ring-2 ring-primary/30"
                      : "border-border bg-background hover:bg-accent",
                  )}
                >
                  <opt.icon className="h-5 w-5 text-primary" />
                  <span className="text-sm font-semibold text-foreground">{opt.label}</span>
                  <span className="text-xs text-muted-foreground">{opt.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p role="alert" className="text-sm font-medium text-destructive">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Create Profile
          </button>
          <p className="text-center text-xs text-muted-foreground">
            Your profile is stored on this device only. You can reset it any time from the profile
            menu.
          </p>
        </form>
      </div>
    </div>
  );
}
