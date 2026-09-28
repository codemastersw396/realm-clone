import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const CATEGORIES = [
  "marketplace", "customer", "developer", "support", "sales", "reseller", "franchise",
  "affiliate", "influencer", "author", "vendor", "boss", "employee", "company", "global",
] as const;

export type AwardSuggestion = {
  title: string;
  category: (typeof CATEGORIES)[number];
  issuer: string;
  kind: "trophy" | "credential";
  confidence: string;
};

const Input = z.object({
  dataUrl: z.string().regex(/^data:image\/(png|jpeg|webp|gif);base64,/, "Only PNG, JPEG, WEBP or GIF images").max(8_000_000, "Image too large (max ~6MB)"),
});

export const suggestAwardFromImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => Input.parse(d))
  .handler(async ({ data }): Promise<AwardSuggestion> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("AI is not configured");

    const prompt = `You are cataloguing an award image (trophy, badge, certificate or credential).
Return ONLY a JSON object: {"title": string (max 60 chars), "category": one of ${CATEGORIES.join("|")}, "issuer": string (organisation/brand visible on the item, or "Unknown" if not visible), "kind": "trophy" or "credential", "confidence": "high"|"medium"|"low"}.
Do not invent text that is not reasonably inferable from the image.`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
        Authorization: `Bearer ${apiKey}`,
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        stream: true,
        store: false,
        reasoning: { effort: "low" },
        input: [{
          role: "user",
          content: [
            { type: "input_text", text: prompt },
            { type: "input_image", image_url: data.dataUrl },
          ],
        }],
      }),
    });

    if (!res.ok || !res.body) {
      const body = await res.text().catch(() => "");
      if (res.status === 429) throw new Error("Too many requests — please try again shortly.");
      if (res.status === 402) throw new Error("AI credits exhausted — add credits in workspace settings.");
      if (res.status === 403) throw new Error("AI access denied for this workspace.");
      console.error("AI gateway error", res.status, body.slice(0, 500));
      throw new Error(`AI suggestion failed (${res.status})`);
    }

    // Consume SSE stream until the body ends.
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = "";
    let text = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      let idx: number;
      while ((idx = buf.indexOf("\n")) >= 0) {
        const line = buf.slice(0, idx).trim();
        buf = buf.slice(idx + 1);
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const ev = JSON.parse(payload);
          if (ev.type === "response.output_text.delta" && typeof ev.delta === "string") text += ev.delta;
          if (ev.type === "error" || ev.type === "response.failed") {
            throw new Error(ev.error?.message ?? ev.response?.error?.message ?? "AI stream failed");
          }
        } catch (e) {
          if (e instanceof Error && e.message.startsWith("AI")) throw e;
        }
      }
    }

    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("The model could not read this image. Try a clearer photo.");
    let raw: Record<string, unknown>;
    try { raw = JSON.parse(match[0]); } catch { throw new Error("Could not parse AI suggestion"); }

    const category = CATEGORIES.includes(raw.category as never) ? (raw.category as AwardSuggestion["category"]) : "global";
    return {
      title: String(raw.title ?? "").slice(0, 80) || "Untitled award",
      category,
      issuer: String(raw.issuer ?? "Unknown").slice(0, 80),
      kind: raw.kind === "credential" ? "credential" : "trophy",
      confidence: ["high", "medium", "low"].includes(String(raw.confidence)) ? String(raw.confidence) : "medium",
    };
  });
