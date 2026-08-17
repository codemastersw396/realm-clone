import { useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { Collectible3D } from "./Collectible3D";
import { RoleFilter, type RoleFilterValue } from "./RoleFilter";
import { VaultToolbar } from "./VaultToolbar";
import type { CelebrateKind } from "@/components/ams/effects/Celebration";
import type { RoleSlug } from "@/lib/ams/roles";
import { ROLES } from "@/lib/ams/roles";

interface Props {
  kicker: string;
  title: string;
  description: string;
  suffix: string; // e.g. "reputation-medal"
  singular: string; // e.g. "Reputation Medal"
  assets: Record<RoleSlug, string>;
  unlockKind?: CelebrateKind;
  accent?: string;
}

export function CollectibleVault({
  kicker, title, description, suffix, singular, assets,
  unlockKind = "trophy", accent = "#facc15",
}: Props) {
  const [filter, setFilter] = useState<RoleFilterValue>("all");
  const visible = useMemo(
    () => (filter === "all" ? ROLES : ROLES.filter((r) => r.slug === filter)),
    [filter],
  );
  const exportItems = useMemo(
    () => visible.map((role) => ({ src: assets[role.slug], filename: `${role.slug}-${suffix}.png` })),
    [visible, assets, suffix],
  );

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <header className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="text-[11px] font-mono tracking-[0.3em] uppercase text-amber-400/80">{kicker}</div>
          <h1 className="mt-2 text-3xl lg:text-4xl font-semibold text-foreground">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl">{description}</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="h-4 w-4 text-amber-400" />
          <span>{ROLES.length} {suffix.replace(/-/g, " ")}s · {visible.length} shown</span>
        </div>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <RoleFilter value={filter} onChange={setFilter} />
        <VaultToolbar items={exportItems} accent={accent} exportLabel={`Export ${singular.toLowerCase()} set`} />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visible.map((role) => (
          <article key={role.slug} className="rounded-2xl border border-border/60 bg-black/20 overflow-hidden">
            <Collectible3D
              src={assets[role.slug]}
              filename={`${role.slug}-${suffix}.png`}
              accent={role.accent}
              label={`${role.passportPrefix} · ${singular}`}
              height={340}
              showUnlock
              unlockKind={unlockKind}
              unlockTitle={`${role.name} ${singular} Unlocked`}
              unlockSubtitle={role.motto}
            />
            <div className="p-4">
              <div className="text-lg font-semibold text-white">{role.name}</div>
              <div className="text-[11px] uppercase tracking-widest" style={{ color: `${role.accent}bb` }}>
                {role.archetype} · {singular}
              </div>
              <p className="mt-2 text-xs text-white/70 italic">"{role.motto}"</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
