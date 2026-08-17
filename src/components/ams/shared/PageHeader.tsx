import { type ReactNode } from "react";

export function PageHeader({
  kicker, title, description, actions,
}: {
  kicker?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4 border-b border-border pb-5">
      <div>
        {kicker && (
          <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            {kicker}
          </div>
        )}
        <h1 className="text-2xl font-bold tracking-tight text-gradient-trophy">{title}</h1>
        {description && <p className="mt-1.5 text-sm text-muted-foreground max-w-2xl">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
