import { createFileRoute } from "@tanstack/react-router";
import { Award, BadgeCheck, Sparkles, Trophy } from "lucide-react";
import { TrophyStageGallery } from "@/components/ams/collectible/TrophyStageGallery";
import { DuplicateSilhouetteChecker } from "@/components/ams/collectible/DuplicateSilhouetteChecker";
import { RoleCredentialWall } from "@/components/ams/collectible/RoleCredentialWall";
import { TROPHIES, ROLE_LIST } from "@/lib/ams/trophy-catalog";

export const Route = createFileRoute("/_authenticated/trophy-stages")({
  head: () => ({
    meta: [
      { title: "Trophy Stage Vault — 180 Staged Role Trophies" },
      {
        name: "description",
        content:
          "Every role progression stage rendered as a distinct museum-grade trophy, with tier filters, 3D inspection and a duplicate silhouette checker.",
      },
      { property: "og:title", content: "Trophy Stage Vault — 180 Staged Role Trophies" },
      {
        property: "og:description",
        content: "18 roles × 10 escalating stages of Software Vala branded trophies.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="space-y-10">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
        <div className="min-w-0">
          <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-amber-400/80">
            Trophy Stage Vault
          </div>
          <h1 className="mt-2 text-3xl font-semibold text-foreground lg:text-4xl">
            Staged Trophy Progression Collection
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Ten escalating trophies for every role — Foundation through Legacy — each a distinct
            silhouette, sealed with the Software Vala mark and collection number.
          </p>
        </div>
        <div className="hidden shrink-0 items-center gap-2 text-xs text-muted-foreground sm:flex">
          <Sparkles className="h-4 w-4 text-amber-400" />
          <span>
            {ROLE_LIST.length} roles · {TROPHIES.length} stages
          </span>
        </div>
      </header>

      <section aria-labelledby="trophy-collection-heading" className="space-y-5">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-border/60 pb-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-primary/30 bg-primary/10 text-primary">
              <Trophy className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 id="trophy-collection-heading" className="truncate text-lg font-semibold text-foreground">Trophy Collection</h2>
              <p className="text-xs text-muted-foreground">Role → achievement → stage → trophy</p>
            </div>
          </div>
          <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{TROPHIES.length} pieces</span>
        </div>
        <TrophyStageGallery />
      </section>

      <section aria-labelledby="credentials-heading" className="space-y-5">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-border/60 pb-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-accent-emerald/30 bg-accent-emerald/10 text-accent-emerald">
              <BadgeCheck className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 id="credentials-heading" className="truncate text-lg font-semibold text-foreground">Identity & Credentials</h2>
              <p className="text-xs text-muted-foreground">Verified role shields and certificates</p>
            </div>
          </div>
          <Award className="h-5 w-5 shrink-0 text-muted-foreground" />
        </div>
        <RoleCredentialWall />
      </section>

      <section aria-label="Collection quality controls">
        <DuplicateSilhouetteChecker />
      </section>
    </div>
  );
}
