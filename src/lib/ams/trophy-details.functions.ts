// Trophy detail overrides — persistence layer for the staged trophy catalog.
// The 180 catalog trophies stay static in code; this table stores editable
// metadata (title, category, issuer, description, status) and a replaced
// artwork file per trophy id (e.g. "developer-03").

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type TrophyDetailStatus = "active" | "pending" | "archived";

export interface TrophyDetailRecord {
  id: string;
  name: string | null;
  category: string | null;
  issuer: string | null;
  description: string | null;
  /** Signed, renderable URL for a replaced artwork file (null = catalog render). */
  imageUrl: string | null;
  /** Storage object path the signed URL was resolved from. */
  imagePath: string | null;
  status: TrophyDetailStatus;
  updatedAt: string | null;
}

const BUCKET = "award-assets";
const SIGNED_TTL = 60 * 60 * 24 * 6; // six days

const IdInput = z.object({ id: z.string().min(1).max(80) });

const SaveInput = z.object({
  id: z.string().min(1).max(80),
  name: z.string().max(140).optional(),
  category: z.string().max(80).optional(),
  issuer: z.string().max(140).optional(),
  description: z.string().max(4000).optional(),
  status: z.enum(["active", "pending", "archived"]).optional(),
});

const UploadInput = z.object({
  id: z.string().min(1).max(80),
  dataUrl: z
    .string()
    .regex(/^data:image\/(png|jpeg|webp|gif);base64,/, "Only PNG, JPEG, WEBP or GIF images")
    .max(11_000_000, "Image too large (max ~8MB)"),
});

type DetailRow = {
  id: string;
  name: string | null;
  category: string | null;
  issuer: string | null;
  description: string | null;
  image_url: string | null;
  status: string;
  updated_at: string | null;
};

async function resolveImageUrl(
  supabase: { storage: { from: (b: string) => { createSignedUrl: (p: string, ttl: number) => Promise<{ data: { signedUrl: string } | null; error: unknown }> } } },
  path: string | null,
): Promise<string | null> {
  if (!path) return null;
  const { data } = await supabase.storage.from(BUCKET).createSignedUrl(path, SIGNED_TTL);
  return data?.signedUrl ?? null;
}

function mapRow(row: DetailRow, imageUrl: string | null): TrophyDetailRecord {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    issuer: row.issuer,
    description: row.description,
    imageUrl,
    imagePath: row.image_url,
    status: (["active", "pending", "archived"].includes(row.status) ? row.status : "active") as TrophyDetailStatus,
    updatedAt: row.updated_at,
  };
}

export const listTrophyDetails = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<TrophyDetailRecord[]> => {
    const { data, error } = await context.supabase
      .from("trophy_details")
      .select("id,name,category,issuer,description,image_url,status,updated_at");
    if (error) throw new Error("Could not load trophy details");
    const rows = (data ?? []) as DetailRow[];
    return Promise.all(
      rows.map(async (row) => mapRow(row, await resolveImageUrl(context.supabase, row.image_url))),
    );
  });

export const getTrophyDetail = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => IdInput.parse(d))
  .handler(async ({ data, context }): Promise<TrophyDetailRecord | null> => {
    const { data: row, error } = await context.supabase
      .from("trophy_details")
      .select("id,name,category,issuer,description,image_url,status,updated_at")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error("Could not load trophy detail");
    if (!row) return null;
    return mapRow(row as DetailRow, await resolveImageUrl(context.supabase, (row as DetailRow).image_url));
  });

export const saveTrophyDetail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => SaveInput.parse(d))
  .handler(async ({ data, context }): Promise<TrophyDetailRecord | null> => {
    const patch: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
      updated_by: context.userId,
    };
    if (data.name !== undefined) patch.name = data.name;
    if (data.category !== undefined) patch.category = data.category;
    if (data.issuer !== undefined) patch.issuer = data.issuer;
    if (data.description !== undefined) patch.description = data.description;
    if (data.status !== undefined) patch.status = data.status;

    const { error } = await context.supabase
      .from("trophy_details")
      .upsert({ id: data.id, ...patch }, { onConflict: "id" });
    if (error) throw new Error("Could not save trophy detail");

    const { data: row } = await context.supabase
      .from("trophy_details")
      .select("id,name,category,issuer,description,image_url,status,updated_at")
      .eq("id", data.id)
      .maybeSingle();
    if (!row) return null;
    return mapRow(row as DetailRow, await resolveImageUrl(context.supabase, (row as DetailRow).image_url));
  });

export const uploadTrophyImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => UploadInput.parse(d))
  .handler(async ({ data, context }): Promise<{ imageUrl: string; imagePath: string }> => {
    const comma = data.dataUrl.indexOf(",");
    const meta = data.dataUrl.slice(5, comma); // e.g. "image/png;base64"
    const mime = meta.slice(0, meta.indexOf(";")) || "image/png";
    const ext = mime === "image/jpeg" ? "jpg" : mime.split("/")[1] ?? "png";

    const base64 = data.dataUrl.slice(comma + 1);
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

    const path = `trophies/${data.id}/${Date.now()}.${ext}`;
    const { error } = await context.supabase.storage
      .from(BUCKET)
      .upload(path, new Blob([bytes], { type: mime }), { contentType: mime, upsert: false });
    if (error) throw new Error("Image upload failed — try a smaller file");

    const { error: upsertError } = await context.supabase
      .from("trophy_details")
      .upsert(
        { id: data.id, image_url: path, updated_at: new Date().toISOString(), updated_by: context.userId },
        { onConflict: "id" },
      );
    if (upsertError) throw new Error("Uploaded, but the trophy could not be updated");

    const imageUrl = await resolveImageUrl(context.supabase, path);
    if (!imageUrl) throw new Error("Uploaded, but the image link could not be created");
    return { imageUrl, imagePath: path };
  });
