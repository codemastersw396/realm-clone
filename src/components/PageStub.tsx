import { type ReactNode } from "react";
import { Construction } from "lucide-react";

export function PageStub({
  title, kicker, description, sections,
}: { title: string; kicker: string; description?: string; sections?: string[] }) {
  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <header>
        <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{kicker}</div>
        <h1 className="text-3xl font-bold tracking-tight text-gradient-primary">{title}</h1>
        {description && <p className="text-sm text-muted-foreground mt-2 max-w-2xl">{description}</p>}
      </header>

      {sections && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {sections.map((s) => (
            <div key={s} className="surface-card p-5">
              <div className="text-sm font-medium">{s}</div>
              <div className="text-xs text-muted-foreground mt-1">Admin-managed module — full CRUD lands in the next milestone.</div>
            </div>
          ))}
        </div>
      )}

      <div className="surface-card p-6 flex items-center gap-3">
        <Construction className="h-5 w-5 text-warning" />
        <div className="text-sm">
          <div className="font-medium">Milestone 1 — scaffolded</div>
          <div className="text-xs text-muted-foreground">Schema and access control for this module are live in Lovable Cloud. Full admin CRUD UI (Add / Edit / Delete / Duplicate / Archive / Restore / Import / Export / Bulk) ships in Milestone 2.</div>
        </div>
      </div>
    </div>
  );
}

export function ToolbarStub() {
  return (
    <div className="flex flex-wrap gap-2">
      {["Add", "Edit", "Delete", "View", "Duplicate", "Archive", "Restore", "Import", "Export", "Bulk"].map((a) => (
        <button key={a} disabled className="text-xs px-3 py-1.5 rounded-md border border-border bg-card/40 text-muted-foreground opacity-60 cursor-not-allowed">{a}</button>
      ))}
    </div>
  );
}

export const __types__: ReactNode = null;
