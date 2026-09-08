import { useState } from "react";
import { CheckCircle2, Fingerprint as FingerprintIcon, TriangleAlert } from "lucide-react";
import { TROPHIES } from "@/lib/ams/trophy-catalog";
import { stageRender } from "@/lib/ams/trophy-stage-assets";
import {
  fingerprint,
  findDuplicates,
  type DuplicatePair,
  type Fingerprint,
} from "@/lib/ams/silhouette-hash";
import { Button } from "@/components/ui/button";

const VERDICT_COPY: Record<DuplicatePair["verdict"], string> = {
  reused: "Same silhouette, same palette — reused asset",
  recoloured: "Same silhouette, different palette — recolour",
  similar: "Silhouettes are close — needs a distinct form",
};

/** Scans every rendered stage and flags any two that share a silhouette. */
export function DuplicateSilhouetteChecker() {
  const [status, setStatus] = useState<"idle" | "running" | "done">("idle");
  const [progress, setProgress] = useState(0);
  const [checked, setChecked] = useState(0);
  const [pairs, setPairs] = useState<DuplicatePair[]>([]);

  async function run() {
    setStatus("running");
    setPairs([]);
    setProgress(0);
    const targets = TROPHIES.map((t) => ({ id: t.id, src: stageRender(t.id) })).filter(
      (t): t is { id: string; src: string } => Boolean(t.src),
    );
    const prints: Fingerprint[] = [];
    for (const t of targets) {
      try {
        prints.push(await fingerprint(t.id, t.src));
      } catch {
        /* skip unreadable render */
      }
      setProgress(Math.round((prints.length / targets.length) * 100));
    }
    setChecked(prints.length);
    setPairs(findDuplicates(prints));
    setStatus("done");
  }

  return (
    <section className="space-y-4 rounded-lg border border-border/60 bg-card/70 p-5 shadow-[var(--shadow-card)]">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="min-w-0">
        <h2 className="text-lg font-semibold text-foreground">Duplicate Silhouette Checker</h2>
        <span className="block truncate text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground">
          shape fingerprint · colour-independent
        </span>
        </div>
        <Button
          type="button"
          onClick={run}
          disabled={status === "running"}
          variant="outline"
          size="sm"
          loading={status === "running"}
          className="shrink-0 text-[10px] uppercase tracking-[0.16em]"
        >
          {status === "running" ? (
            null
          ) : (
            <FingerprintIcon className="h-3.5 w-3.5" />
          )}
          {status === "running" ? `Scanning ${progress}%` : "Run duplicate scan"}
        </Button>
      </header>

      <p className="text-xs leading-relaxed text-muted-foreground">
        Every rendered stage is reduced to a 16×16 occupancy map of its silhouette, normalised to its
        own bounding box, so a recoloured or rescaled copy still matches the original. Any pair under
        the distinctness threshold is listed for redesign.
      </p>

      {status === "done" &&
        (pairs.length === 0 ? (
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-sm text-foreground">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            All {checked} rendered stages are visually distinct — no reused or recoloured silhouettes.
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-xl border border-destructive/60 bg-card p-4 text-sm text-foreground">
              <TriangleAlert className="h-5 w-5 text-destructive" />
              {pairs.length} conflicting pair{pairs.length === 1 ? "" : "s"} across {checked} stages.
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {pairs.map((p) => (
                <article key={`${p.a}-${p.b}`} className="space-y-3 rounded-xl border border-border bg-card p-4">
                  <div className="grid grid-cols-2 gap-3">
                    {[p.a, p.b].map((id) => (
                      <figure key={id} className="space-y-2">
                        <div className="aspect-square overflow-hidden rounded-lg bg-black/40">
                          <img
                            src={stageRender(id)}
                            alt={`Flagged trophy render ${id}`}
                            loading="lazy"
                            className="h-full w-full object-contain"
                          />
                        </div>
                        <figcaption className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                          {id}
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-destructive">
                    {VERDICT_COPY[p.verdict]}
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    shape Δ {(p.shape * 100).toFixed(1)}% · tone Δ {(p.tone * 100).toFixed(1)}%
                  </p>
                </article>
              ))}
            </div>
          </div>
        ))}
    </section>
  );
}
