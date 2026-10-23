import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/trophy-stages")({
  head: () => ({
    meta: [
      { title: "Trophy Stage Vault — AMS" },
      { name: "description", content: "Staged trophy progression collection, credential wall and quality controls." },
      { property: "og:title", content: "Trophy Stage Vault — AMS" },
      { property: "og:description", content: "Staged trophy progression collection, credential wall and quality controls." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Outlet,
});
