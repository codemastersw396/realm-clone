import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { CelebrationProvider } from "@/components/ams/effects/Celebration";
import { Toaster } from "@/components/ui/sonner";
import { RouteHistoryProvider, RouteHistoryPanel } from "@/components/layout/RouteHistory";
import { TooltipProvider } from "@/components/ui/tooltip";

// Auth is handled by the parent Software Vala application.
// This module assumes the user is already authenticated upstream.
export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  return (
    <TooltipProvider delayDuration={250}>
     <RouteHistoryProvider>
      <CelebrationProvider>
        <AppShell>
          <Outlet />
        </AppShell>
        <RouteHistoryPanel />
        <Toaster richColors position="bottom-right" />
      </CelebrationProvider>
     </RouteHistoryProvider>
    </TooltipProvider>
  );
}
