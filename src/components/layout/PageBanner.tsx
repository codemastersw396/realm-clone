import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronRight, Home } from "lucide-react";
import { navMetaForPath } from "@/lib/nav";

/**
 * Per-screen banner header. Renders a gradient hero band with breadcrumb,
 * module chip and screen title so every route shares the same density.
 */
export function PageBanner() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const meta = navMetaForPath(pathname);
  if (!meta || pathname === "/") return null;

  const Icon = meta.icon;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border bg-card">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,color-mix(in_oklab,var(--color-primary)_22%,transparent),transparent_60%)]"
      />
      <div className="relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-4 sm:flex sm:flex-wrap sm:justify-between sm:px-6 sm:py-5">
        <div className="min-w-0">
          <nav
            aria-label="Breadcrumb"
            className="flex min-w-0 items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:text-[11px]"
          >
            <Link to="/" className="flex items-center gap-1 transition-colors hover:text-foreground">
              <Home className="h-3 w-3" /> AMS
            </Link>
            <ChevronRight className="h-3 w-3 opacity-50" />
            <span className="truncate">{meta.group}</span>
          </nav>
          <div className="mt-2 flex min-w-0 items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary sm:h-11 sm:w-11">
              <Icon className="h-5 w-5" />
            </span>
            <h1 className="truncate text-xl font-semibold tracking-tight sm:text-2xl lg:text-[28px]">
              {meta.label}
            </h1>
          </div>
        </div>
      </div>
    </section>
  );
}
