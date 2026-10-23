import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, Download, Loader2, Save, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ams/shared/PageHeader";
import { SVSeal, svCollectionNumber } from "@/components/ams/brand/SVMark";
import { TROPHIES } from "@/lib/ams/trophy-catalog";
import { stageRender } from "@/lib/ams/trophy-stage-assets";
import { getTrophyDetail, saveTrophyDetail, uploadTrophyImage } from "@/lib/ams/trophy-details.functions";

export const Route = createFileRoute("/_authenticated/trophy-stages/$id")({
  head: () => ({
    meta: [
      { title: "Trophy Detail — AMS" },
      { name: "description", content: "Full trophy record: title, category, issuer, description, original artwork and download." },
      { property: "og:title", content: "Trophy Detail — AMS" },
      { property: "og:description", content: "Full trophy record: title, category, issuer, description, original artwork and download." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TrophyDetailPage,
});

const CATEGORY_SUGGESTIONS = [
  "Developer", "Reseller", "Franchise", "Author", "Vendor", "Affiliate",
  "Influencer", "Creator", "SEO", "Support", "User", "Manager",
  "Administrator", "Founder", "Operator", "Innovator", "Partner", "Trainer",
];

function TrophyDetailPage() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const entry = TROPHIES.find((t) => t.id === id);
  if (!entry) throw notFound();

  const detail = useQuery({
    queryKey: ["trophy-detail", id],
    queryFn: () => getTrophyDetail({ data: { id } }),
  });

  const override = detail.data ?? null;
  const name = override?.name || entry.name;
  const category = override?.category || entry.role;
  const issuer = override?.issuer || "Software Vala";
  const description = override?.description || entry.brief;
  const image = override?.imageUrl || stageRender(entry.id);

  const [draft, setDraft] = useState<null | { name: string; category: string; description: string; status: "active" | "pending" | "archived" }>(null);
  const [uploading, setUploading] = useState(false);

  const save = useMutation({
    mutationFn: () =>
      saveTrophyDetail({
        data: {
          id,
          name: draft?.name !== undefined ? draft.name : name,
          category: draft?.category !== undefined ? draft.category : category,
          description: draft?.description !== undefined ? draft.description : description,
          status: draft?.status ?? override?.status ?? "active",
        },
      }),
    onSuccess: () => {
      toast.success("Trophy details saved");
      setDraft(null);
      qc.invalidateQueries({ queryKey: ["trophy-detail", id] });
      qc.invalidateQueries({ queryKey: ["trophy-details"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const upload = useMutation({
    mutationFn: (dataUrl: string) => uploadTrophyImage({ data: { id, dataUrl } }),
    onSuccess: () => {
      toast.success("Artwork replaced");
      setUploading(false);
      qc.invalidateQueries({ queryKey: ["trophy-detail", id] });
      qc.invalidateQueries({ queryKey: ["trophy-details"] });
    },
    onError: (e: Error) => {
      toast.error(e.message);
      setUploading(false);
    },
  });

  async function onImageFile(file: File) {
    if (!file.type.startsWith("image/")) return toast.error("Please choose an image");
    if (file.size > 8 * 1024 * 1024) return toast.error("Image must be under 8MB");
    const dataUrl = await new Promise<string>((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(String(r.result));
      r.onerror = rej;
      r.readAsDataURL(file);
    });
    setUploading(true);
    upload.mutate(dataUrl);
  }

  const status = override?.status ?? "active";
  const statusHue = status === "active" ? "#4ade80" : status === "pending" ? "#facc15" : "#94a3b8";

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div>
        <Button asChild variant="ghost" size="sm" className="gap-1.5 mb-2 -ml-2">
          <Link to="/trophy-stages"><ChevronLeft className="h-4 w-4" /> Back to trophy stages</Link>
        </Button>
        <PageHeader
          kicker={`${entry.role} · Stage ${String(entry.stage).padStart(2, "0")} · ${entry.tier}`}
          title={name}
          description={description}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <div
            className="gallery-card relative overflow-hidden rounded-xl p-6"
            style={{
              backgroundImage: `radial-gradient(90% 72% at 50% 18%, color-mix(in oklab, var(--primary) 14%, transparent), transparent 70%)`,
            }}
          >
            <div className="absolute left-4 top-4 z-10 flex items-center gap-2">
              <SVSeal accent="var(--primary)" size={22} />
            </div>
            <div
              className="absolute right-4 top-4 z-10 rounded-sm border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em]"
              style={{ borderColor: `${statusHue}55`, color: statusHue }}
            >
              {status}
            </div>
            {image ? (
              <img
                src={image}
                alt={`${name} — original artwork`}
                className="mx-auto max-h-[520px] w-auto max-w-full object-contain"
                style={{ imageRendering: "auto" }}
              />
            ) : (
              <div className="grid h-64 place-items-center text-sm text-muted-foreground">Artwork unavailable</div>
            )}
            <div
              className="absolute bottom-4 right-5 font-mono uppercase"
              style={{ fontSize: 9, letterSpacing: "0.22em" }}
            >
              {svCollectionNumber(entry.id, entry.roleSlug.slice(0, 3))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {image && (
              <Button asChild variant="outline" size="sm" className="gap-1.5">
                <a href={image} download={`${entry.id}.png`}>
                  <Download className="h-3.5 w-3.5" /> Download artwork
                </a>
              </Button>
            )}
            <Button type="button" variant="outline" size="sm" className="gap-1.5" disabled={uploading} onClick={() => fileRef.current?.click()}>
              {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
              Replace image
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) onImageFile(f); }}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="surface-card p-5 space-y-4">
            <div className="text-sm font-semibold">Record</div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Category</div>
                <div className="mt-1 font-medium">{category}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Issuer</div>
                <div className="mt-1 font-medium">{issuer}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Tier</div>
                <div className="mt-1 font-medium">{entry.tier}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Role</div>
                <div className="mt-1 font-medium">{entry.role}</div>
              </div>
            </div>
            <div className="border-t border-border pt-3">
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Description</div>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
            </div>
          </div>

          <div className="surface-card p-5 space-y-3">
            <div className="text-sm font-semibold">Edit details</div>
            <label className="block text-xs text-muted-foreground">
              Title
              <input
                disabled={detail.isLoading}
                value={draft?.name ?? name}
                onChange={(e) => setDraft((d) => ({ ...(d ?? { name, category, description, status }), name: e.target.value }))}
                className="mt-1 h-9 w-full rounded-md border border-border/70 bg-muted/20 px-3 text-sm text-foreground outline-none focus:border-primary/60 focus:ring-2 focus:ring-ring/30"
              />
            </label>
            <label className="block text-xs text-muted-foreground">
              Category
              <input
                disabled={detail.isLoading}
                list="trophy-category-suggestions"
                value={draft?.category ?? category}
                onChange={(e) => setDraft((d) => ({ ...(d ?? { name, category, description, status }), category: e.target.value }))}
                className="mt-1 h-9 w-full rounded-md border border-border/70 bg-muted/20 px-3 text-sm text-foreground outline-none focus:border-primary/60 focus:ring-2 focus:ring-ring/30"
              />
              <datalist id="trophy-category-suggestions">
                {CATEGORY_SUGGESTIONS.map((c) => <option key={c} value={c} />)}
              </datalist>
            </label>
            <label className="block text-xs text-muted-foreground">
              Description
              <textarea
                disabled={detail.isLoading}
                rows={4}
                value={draft?.description ?? description}
                onChange={(e) => setDraft((d) => ({ ...(d ?? { name, category, description, status }), description: e.target.value }))}
                className="mt-1 w-full rounded-md border border-border/70 bg-muted/20 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/60 focus:ring-2 focus:ring-ring/30"
              />
            </label>
            <label className="block text-xs text-muted-foreground">
              Status
              <select
                disabled={detail.isLoading}
                value={draft?.status ?? status}
                onChange={(e) => setDraft((d) => ({ ...(d ?? { name, category, description, status }), status: e.target.value as "active" | "pending" | "archived" }))}
                className="mt-1 h-9 w-full rounded-md border border-border/70 bg-muted/20 px-3 text-sm text-foreground outline-none focus:border-primary/60"
              >
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="archived">Archived</option>
              </select>
            </label>
            <Button
              type="button"
              size="sm"
              className="gap-1.5"
              disabled={save.isPending || !!uploading || detail.isLoading}
              onClick={() => save.mutate()}
            >
              {save.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              Save changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
