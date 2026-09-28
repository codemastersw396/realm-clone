import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, Upload, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { suggestAwardFromImage, type AwardSuggestion } from "@/lib/ams/award-suggest.functions";
import { AWARD_CATEGORIES } from "@/lib/ams/types";

export function AiImageSuggest({
  onApply,
}: {
  onApply: (s: AwardSuggestion & { dataUrl: string }) => void;
}) {
  const suggest = useServerFn(suggestAwardFromImage);
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AwardSuggestion | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onFile(f: File) {
    if (!f.type.startsWith("image/")) return toast.error("Please choose an image");
    if (f.size > 6 * 1024 * 1024) return toast.error("Image must be under 6MB");
    const dataUrl = await new Promise<string>((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(String(r.result));
      r.onerror = rej;
      r.readAsDataURL(f);
    });
    setPreview(dataUrl); setResult(null); setError(null); setLoading(true);
    try {
      setResult(await suggest({ data: { dataUrl } }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Suggestion failed");
    } finally {
      setLoading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const catLabel = result ? AWARD_CATEGORIES.find((c) => c.value === result.category)?.label : "";

  return (
    <div className="rounded-lg border border-trophy/30 bg-muted/20 p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Sparkles className="h-4 w-4 text-trophy" /> AI suggest from image
        </div>
        <Button type="button" size="sm" variant="outline" className="gap-1.5" disabled={loading} onClick={() => fileRef.current?.click()}>
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          {preview ? "Try another" : "Upload trophy / credential"}
        </Button>
        <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
      </div>
      {preview && (
        <div className="grid grid-cols-[96px_1fr] gap-3 items-start">
          <img src={preview} alt="Uploaded award" className="h-24 w-24 rounded-md object-contain bg-background/60 border border-border" />
          <div className="text-sm space-y-1 min-w-0">
            {loading && <p className="text-muted-foreground">Analysing image…</p>}
            {error && <p className="text-destructive">{error}</p>}
            {result && (
              <>
                <p><span className="text-muted-foreground">Title:</span> <span className="font-medium">{result.title}</span></p>
                <p><span className="text-muted-foreground">Category:</span> {catLabel}</p>
                <p><span className="text-muted-foreground">Issuer:</span> {result.issuer}</p>
                <p className="text-xs text-muted-foreground capitalize">{result.kind} · {result.confidence} confidence</p>
                <Button type="button" size="sm" className="mt-2 gap-1.5" onClick={() => { onApply({ ...result, dataUrl: preview }); toast.success("Suggestion applied"); }}>
                  <Check className="h-3.5 w-3.5" /> Apply suggestion
                </Button>
              </>
            )}
          </div>
        </div>
      )}
      {!preview && <p className="text-xs text-muted-foreground">Upload a photo and AI will suggest a title, category and issuer. You can edit everything before saving.</p>}
    </div>
  );
}
