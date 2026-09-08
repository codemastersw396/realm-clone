import { useEffect, useMemo, useState } from "react";
import { Download, Expand, Search, Trophy, X } from "lucide-react";
import { Collectible3D } from "./Collectible3D";
import { SVMicroMark, SVSeal, svCollectionNumber } from "@/components/ams/brand/SVMark";
import { TIERS, TROPHIES, ROLE_LIST, type Tier, type TrophyStage } from "@/lib/ams/trophy-catalog";
import { stageRender, referenceForRole } from "@/lib/ams/trophy-stage-assets";
import { getRole } from "@/lib/ams/roles";
import { Button } from "@/components/ui/button";

const TIER_HUE: Record<Tier, string> = {
  Foundation: "#7dd3fc",
  Advance: "#a78bfa",
  Elite: "#f0abfc",
  Legacy: "#facc15",
};

function accentFor(slug: string, tier: Tier) {
  return getRole(slug)?.accent ?? TIER_HUE[tier];
}

export function TrophyStageGallery() {
  const [role, setRole] = useState<string>("all");
  const [tier, setTier] = useState<Tier | "all">("all");
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<TrophyStage | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TROPHIES.filter(
      (t) =>
        (role === "all" || t.roleSlug === role) &&
        (tier === "all" || t.tier === tier) &&
        (!q || t.name.toLowerCase().includes(q) || t.role.toLowerCase().includes(q)),
    );
  }, [role, tier, query]);

  const activeAccent = active ? accentFor(active.roleSlug, active.tier) : "#facc15";
  const activeRender = active ? stageRender(active.id) : undefined;

  useEffect(() => {
    if (!active) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActive(null);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [active]);

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-border/60 bg-card/55 p-3 shadow-[var(--shadow-card)] sm:p-4">
        <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Filter by role</div>
        <div className="scrollbar-thin flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filter trophies by role">
        <Button
          variant="outline"
          size="sm"
          aria-pressed={role === "all"}
          className="shrink-0 rounded-md px-3 text-[10px] uppercase tracking-[0.14em]"
          style={
            role === "all"
              ? { borderColor: "var(--color-legendary)", color: "var(--color-legendary)", background: "color-mix(in oklab, var(--color-legendary) 10%, transparent)" }
              : undefined
          }
          onClick={() => setRole("all")}
        >
          All roles
        </Button>
        {ROLE_LIST.map((r) => {
          const on = role === r.slug;
          const hue = accentFor(r.slug, "Legacy");
          return (
            <Button
              key={r.slug}
              variant="outline"
              size="sm"
              aria-pressed={on}
              className="shrink-0 rounded-md px-3 text-[10px] uppercase tracking-[0.14em]"
              style={
                on
                  ? { borderColor: hue, color: hue, background: `color-mix(in oklab, ${hue} 10%, transparent)` }
                  : undefined
              }
              onClick={() => setRole(r.slug)}
            >
              {r.role}
            </Button>
          );
        })}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <div className="flex min-w-0 flex-wrap items-center gap-2" role="group" aria-label="Filter trophies by tier">
          {(["all", ...TIERS] as const).map((t) => {
            const on = tier === t;
            const hue = t === "all" ? "#facc15" : TIER_HUE[t];
            return (
              <Button
                key={t}
                variant="outline"
                size="sm"
                aria-pressed={on}
                className="rounded-md px-3 text-[10px] uppercase tracking-[0.14em]"
                style={
                  on
                    ? { borderColor: hue, color: hue, background: `color-mix(in oklab, ${hue} 10%, transparent)` }
                    : undefined
                }
                onClick={() => setTier(t as Tier | "all")}
              >
                {t === "all" ? "All tiers" : t}
              </Button>
            );
          })}
        </div>
        <label className="relative block min-w-0 sm:w-64">
          <span className="sr-only">Search stage or role</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search stage or role"
            className="h-9 w-full rounded-md border border-border/70 bg-muted/20 pl-9 pr-3 text-xs text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/60 focus:ring-2 focus:ring-ring/30"
          />
        </label>
      </div>

      <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
        {visible.length} of {TROPHIES.length} stages shown
        {(role !== "all" || tier !== "all" || query) && (
          <Button variant="ghost" size="sm" className="h-7 px-2 text-[11px]" onClick={() => { setRole("all"); setTier("all"); setQuery(""); }}>
            Clear filters
          </Button>
        )}
      </div>

      {visible.length === 0 ? (
        <div className="grid min-h-56 place-items-center rounded-lg border border-dashed border-border bg-card/35 p-8 text-center">
          <div>
            <Trophy className="mx-auto h-7 w-7 text-muted-foreground" />
            <div className="mt-3 text-sm font-medium text-foreground">No trophies found</div>
            <p className="mt-1 text-xs text-muted-foreground">Adjust the current role, tier, or search filter.</p>
          </div>
        </div>
      ) : <div className="grid grid-cols-1 gap-4 min-[520px]:grid-cols-2 lg:grid-cols-3 min-[1480px]:grid-cols-4 min-[2200px]:grid-cols-5">
        {visible.map((item) => {
          const src = stageRender(item.id);
          const accent = accentFor(item.roleSlug, item.tier);
          return (
            <article
              key={item.id}
              className="gallery-card motion-card group relative flex min-h-[338px] flex-col overflow-hidden rounded-lg"
              style={{ borderColor: `color-mix(in oklab, ${accent} 30%, var(--border))` }}
            >
              <div
                className="gallery-image relative aspect-[4/3] min-h-0 overflow-hidden border-b border-border/50 p-3"
                style={{
                  backgroundImage: `radial-gradient(90% 72% at 50% 20%, color-mix(in oklab, ${accent} 14%, transparent), transparent 68%)`,
                }}
              >
                {src ? (
                  <img
                    src={src}
                    alt={`${item.role} stage ${item.stage} trophy — ${item.name}`}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-contain object-center transition-transform duration-300 group-hover:scale-[1.025]"
                  />
                ) : (
                  <div className="grid h-full place-items-center text-center text-xs text-muted-foreground">
                    <div><SVSeal accent={accent} size={34} /><span className="mt-2 block">Artwork unavailable</span></div>
                  </div>
                )}

                {/* Software Vala brand identity on every trophy */}
                <div className="absolute left-3 top-3 z-10 flex items-center gap-2">
                  <SVSeal accent={accent} size={22} />
                  <SVMicroMark accent={accent} className="hidden sm:inline" />
                </div>
                <div
                  className="absolute bottom-2 right-3 z-10 font-mono uppercase"
                  style={{ fontSize: 9, letterSpacing: "0.22em", color: `${accent}aa` }}
                >
                  {svCollectionNumber(item.id, item.roleSlug.slice(0, 3))}
                </div>

                <div className="absolute right-3 top-3 z-10 flex gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => setActive(item)}
                    aria-label="Inspect in 3D"
                    className="grid h-8 w-8 place-items-center rounded-md border bg-background/75 text-foreground shadow-sm backdrop-blur transition hover:bg-accent"
                    style={{ borderColor: `${accent}66` }}
                  >
                    <Expand className="h-3.5 w-3.5" />
                  </button>
                  {src && (
                    <a
                      href={src}
                      download={`${item.id}.png`}
                      aria-label="Download PNG"
                      className="grid h-8 w-8 place-items-center rounded-md border bg-background/75 text-foreground shadow-sm backdrop-blur transition hover:bg-accent"
                      style={{ borderColor: `${accent}66` }}
                    >
                      <Download className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>

              <div className="mt-auto space-y-2 p-4">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 text-[10px] font-mono uppercase tracking-[0.16em]">
                  <span className="truncate" style={{ color: `${accent}bb` }}>
                    {item.role} · Stage {String(item.stage).padStart(2, "0")}
                  </span>
                  <span className="shrink-0 rounded-sm border border-border/50 bg-muted/30 px-1.5 py-0.5" style={{ color: TIER_HUE[item.tier] }}>{item.tier}</span>
                </div>
                <div className="min-h-10 text-sm font-semibold leading-5 text-foreground">{item.name}</div>
              </div>
            </article>
          );
        })}
      </div>}

      {active && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-background/85 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={`${active.role} stage ${active.stage}`}
          onClick={() => setActive(null)}
        >
          <div
            className="max-h-[calc(100dvh-2rem)] w-full max-w-3xl overflow-y-auto rounded-lg border bg-popover shadow-2xl"
            style={{ borderColor: `${activeAccent}55` }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-border/50 p-4">
              <div>
                <div className="text-[11px] font-mono uppercase tracking-[0.25em]" style={{ color: `${activeAccent}bb` }}>
                  {active.role} · Stage {String(active.stage).padStart(2, "0")} · {active.tier}
                </div>
                <h2 className="mt-1 text-xl font-semibold text-foreground">{active.name}</h2>
              </div>
              <Button
                type="button"
                onClick={() => setActive(null)}
                aria-label="Close"
                variant="outline"
                size="icon-sm"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4">
              {activeRender && (
                <Collectible3D
                  eager
                  src={activeRender}
                  filename={`${active.id}.png`}
                  accent={activeAccent}
                  label={`${active.role} · ${active.tier}`}
                  height={380}
                  showUnlock
                  unlockKind="trophy"
                  unlockTitle={`${active.name} Unlocked`}
                  unlockSubtitle={`${active.role} · Stage ${active.stage}`}
                />
              )}
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{active.brief}</p>
              {referenceForRole(active.roleSlug) && (
                <div className="mt-4 flex items-center gap-3">
                  <img
                    src={referenceForRole(active.roleSlug)!.src}
                    alt={`${active.role} studio reference`}
                    loading="lazy"
                    className="h-16 w-16 rounded-lg border border-border/60 object-cover"
                  />
                  <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
                    Studio reference · {active.role}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
