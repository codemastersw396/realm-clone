// Role credential wall — shield + certificate for every catalog role,
// each sealed with the Software Vala brand mark and collection number.

import { useMemo, useState } from "react";
import { ShieldCheck, ScrollText } from "lucide-react";
import { SVSeal, SVMicroMark, svCollectionNumber } from "@/components/ams/brand/SVMark";
import { ROLE_LIST } from "@/lib/ams/trophy-catalog";
import { Button } from "@/components/ui/button";

const shields = import.meta.glob<string>("/src/assets/shields/*.png", {
  eager: true, query: "?url", import: "default",
});
const certificates = import.meta.glob<string>("/src/assets/certificates/*.png", {
  eager: true, query: "?url", import: "default",
});

function keyed(map: Record<string, string>, suffix: string) {
  return Object.fromEntries(
    Object.entries(map).map(([p, url]) => [
      p
        .slice(p.lastIndexOf("/") + 1)
        .replace(/\.png$/, "")
        .replace(new RegExp(`-${suffix}$`), ""),
      url,
    ]),
  ) as Record<string, string>;
}

const SHIELD = keyed(shields, "shield");
const CERT = keyed(certificates, "certificate");

const ACCENTS = [
  "#60a5fa", "#f472b6", "#facc15", "#34d399", "#a78bfa", "#fb923c",
  "#22d3ee", "#f87171", "#4ade80", "#e879f9", "#38bdf8", "#fcd34d",
  "#818cf8", "#2dd4bf", "#fda4af", "#c084fc", "#93c5fd", "#fbbf24",
];

type Kind = "shield" | "certificate";

function Credential({
  src, role, slug, kind, accent,
}: { src: string; role: string; slug: string; kind: Kind; accent: string }) {
  const Icon = kind === "shield" ? ShieldCheck : ScrollText;
  return (
    <figure
      className="group relative flex min-h-[292px] flex-col overflow-hidden rounded-lg border p-4 transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-0.5"
      style={{
        borderColor: `color-mix(in oklab, ${accent} 34%, var(--border))`,
        background: `radial-gradient(120% 90% at 50% 0%, color-mix(in oklab, ${accent} 12%, var(--card)) 0%, var(--card) 55%, var(--background) 100%)`,
        boxShadow: `0 22px 60px -34px color-mix(in oklab, ${accent} 70%, transparent)`,
      }}
    >
      <div className="pointer-events-none absolute left-3 top-3 z-10">
        <SVSeal accent={accent} size={20} />
      </div>
      <div className="pointer-events-none absolute right-3 top-4 z-10">
        <SVMicroMark accent={accent} />
      </div>
      <div className="relative grid h-48 place-items-center overflow-hidden rounded-md border border-border/40 bg-background/30 px-4 py-3">
        <img
          src={src}
          alt={`${role} ${kind}`}
          loading="lazy"
          width={1024}
          height={1024}
          className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.025]"
          style={{
            filter: `saturate(1.16) contrast(1.06) drop-shadow(0 18px 26px rgba(0,0,0,0.55)) drop-shadow(0 0 26px color-mix(in oklab, ${accent} 40%, transparent))`,
          }}
        />
      </div>
      <figcaption className="mt-auto grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2 pt-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-foreground">{role}</div>
          <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em]" style={{ color: `${accent}cc` }}>
            <Icon className="h-3.5 w-3.5" />
            {kind === "shield" ? "Trust Shield" : "Certificate"}
          </div>
        </div>
        <span className="font-mono text-[10px] tabular-nums" style={{ color: `${accent}aa` }}>
          {svCollectionNumber(`${slug}-${kind}`, kind.slice(0, 3))}
        </span>
      </figcaption>
    </figure>
  );
}

export function RoleCredentialWall() {
  const [kind, setKind] = useState<Kind>("shield");
  const items = useMemo(
    () =>
      ROLE_LIST.map((r, i) => ({
        ...r,
        accent: ACCENTS[i % ACCENTS.length]!,
        src: (kind === "shield" ? SHIELD : CERT)[r.slug],
      })).filter((r) => Boolean(r.src)),
    [kind],
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
        <div>
          <h3 className="text-base font-semibold text-foreground">Role Credential Wall</h3>
          <p className="text-sm text-muted-foreground">
            Trust shields and certificates for all {ROLE_LIST.length} roles — every piece sealed with the Software Vala mark.
          </p>
        </div>
        <div className="inline-flex shrink-0 rounded-md border border-border/60 bg-muted/20 p-1" role="group" aria-label="Credential type">
          {(["shield", "certificate"] as Kind[]).map((k) => (
            <Button
              key={k}
              type="button"
              onClick={() => setKind(k)}
              variant={kind === k ? "default" : "ghost"}
              size="sm"
              aria-pressed={kind === k}
              className="h-7 px-3 capitalize"
            >
              {k}s
            </Button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 min-[540px]:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {items.map((r) => (
          r.src ? <Credential key={`${r.slug}-${kind}`} src={r.src} role={r.role} slug={r.slug} kind={kind} accent={r.accent} /> : null
        ))}
      </div>
    </div>
  );
}
