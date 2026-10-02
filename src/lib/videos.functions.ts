import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const SIGNED_TTL = 604800; // 7 days, Storage maximum

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    // Opaque sb_ keys are not JWTs; send only apikey, not the default bearer.
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export type DbVideo = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  duration_label: string | null;
  views_count: number;
  is_hero: boolean;
  created_at: string;
  videoUrl: string | null;
  thumbUrl: string | null;
};

const SELECT_COLS =
  "id,title,description,category,duration_label,views_count,is_hero,video_path,thumb_path,created_at";

async function withUrls(
  client: ReturnType<typeof createClient>,
  rows: Array<{
    video_path: string | null;
    thumb_path: string | null;
    [k: string]: unknown;
  }>,
) {
  return Promise.all(
    rows.map(async (v) => {
      const videoUrl = v.video_path
        ? (await client.storage.from("media").createSignedUrl(v.video_path, SIGNED_TTL)).data?.signedUrl ?? null
        : null;
      const thumbUrl = v.thumb_path
        ? (await client.storage.from("media").createSignedUrl(v.thumb_path, SIGNED_TTL)).data?.signedUrl ?? null
        : null;
      return { ...v, videoUrl, thumbUrl };
    }),
  );
}

/** Public: published videos for the home page. */
export const listPublishedVideos = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = publicClient();
  const { data, error } = await supabase
    .from("videos")
    .select(SELECT_COLS)
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) return { videos: [] as DbVideo[], error: error.message };
  return { videos: (await withUrls(supabase, data ?? [])) as DbVideo[] };
});

/** Public: one video by id for the watch page. */
export const getVideoById = createServerFn({ method: "GET" })
  .inputValidator((data: { id: string }) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const supabase = publicClient();
    const { data: row, error } = await supabase
      .from("videos")
      .select(SELECT_COLS)
      .eq("id", data.id)
      .eq("published", true)
      .maybeSingle();
    if (error || !row) return { video: null as DbVideo | null };
    const [video] = (await withUrls(supabase, [row as never])) as DbVideo[];
    return { video: video ?? null };
  });

type AdminCtx = { supabase: import("@supabase/supabase-js").SupabaseClient; userId: string };

async function requireAdmin(context: AdminCtx) {
  const { data: isAdmin } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (!isAdmin) throw new Error("Forbidden");
  return context;
}

export const getMyRole = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    return { isAdmin: !!isAdmin };
  });

/** Grants the admin role to the caller only when no admin exists yet (bootstrap). */
export const claimAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { count } = await context.supabase
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");
    if ((count ?? 0) > 0) return { granted: false };
    const { error } = await context.supabase
      .from("user_roles")
      .insert({ user_id: context.userId, role: "admin" });
    if (error) return { granted: false, error: error.message };
    return { granted: true };
  });

const videoInput = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  category: z.enum(["natok", "short", "music", "comedy"]),
  duration_label: z.string().max(10).optional(),
  video_path: z.string().max(500).optional(),
  thumb_path: z.string().max(500).optional(),
  published: z.boolean(),
  is_hero: z.boolean(),
});

export type VideoInput = z.infer<typeof videoInput>;

export const saveVideo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => videoInput.parse(data))
  .handler(async ({ data, context }) => {
    await requireAdmin(context as never);
    if (data.id) {
      const { error } = await context.supabase
        .from("videos")
        .update({
          title: data.title,
          description: data.description ?? null,
          category: data.category,
          duration_label: data.duration_label ?? null,
          video_path: data.video_path ?? null,
          thumb_path: data.thumb_path ?? null,
          published: data.published,
          is_hero: data.is_hero,
        })
        .eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true, id: data.id };
    }
    const { data: row, error } = await context.supabase
      .from("videos")
      .insert({
        title: data.title,
        description: data.description ?? null,
        category: data.category,
        duration_label: data.duration_label ?? null,
        video_path: data.video_path ?? null,
        thumb_path: data.thumb_path ?? null,
        published: data.published,
        is_hero: data.is_hero,
        created_by: context.userId,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { ok: true, id: row!.id as string };
  });

export const deleteVideo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    await requireAdmin(context as never);
    const { data: row } = await context.supabase
      .from("videos")
      .select("video_path,thumb_path")
      .eq("id", data.id)
      .maybeSingle();
    const paths = [row?.video_path, row?.thumb_path].filter((p): p is string => !!p);
    const { error } = await context.supabase.from("videos").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    if (paths.length) await context.supabase.storage.from("media").remove(paths);
    return { ok: true };
  });

/** Admin list — includes unpublished videos. */
export const adminListVideos = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context as never);
    const { data, error } = await context.supabase
      .from("videos")
      .select(SELECT_COLS)
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) return { videos: [] as DbVideo[], error: error.message };
    return { videos: (await withUrls(context.supabase, data ?? [])) as DbVideo[] };
  });
