import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Play, ArrowLeft, LogOut, Film, Upload, Trash2, Pencil, Eye, EyeOff,
  Star, Save, Loader2, Lock, X, ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  useServerFn,
} from "@tanstack/react-start";
import {
  adminListVideos, saveVideo, deleteVideo, getMyRole,
  type VideoInput,
} from "@/lib/videos.functions";
import { categoryLabels } from "@/lib/bn";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "অ্যাডমিন — NatokBuzz" },
      { name: "description", content: "NatokBuzz অ্যাডমিন প্যানেল — নাটক যোগ ও ম্যানেজ করুন।" },
      { property: "og:title", content: "অ্যাডমিন — NatokBuzz" },
      { property: "og:description", content: "NatokBuzz অ্যাডমিন প্যানেল — নাটক যোগ ও ম্যানেজ করুন।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Admin,
});

type VideoRow = {
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
  video_path: string | null;
  thumb_path: string | null;
};

type FormState = {
  title: string;
  description: string;
  category: "natok" | "short" | "music" | "comedy";
  duration_label: string;
  videoFile: File | null;
  thumbFile: File | null;
  published: boolean;
  is_hero: boolean;
};

const emptyForm: FormState = {
  title: "",
  description: "",
  category: "natok",
  duration_label: "",
  videoFile: null,
  thumbFile: null,
  published: true,
  is_hero: false,
};

function safeName(file: File, folder: string) {
  const clean = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${folder}/${Date.now()}-${clean}`;
}

function Admin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [booting, setBooting] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const adminList = useServerFn(adminListVideos);
  const myRoleFn = useServerFn(getMyRole);
  const saveFn = useServerFn(saveVideo);
  const deleteFn = useServerFn(deleteVideo);

  const { data: list, refetch } = useQuery({
    queryKey: ["admin-videos"],
    queryFn: async () => {
      const res = await adminList();
      return res;
    },
    enabled: signedIn && isAdmin,
  });

  async function checkSession() {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      setSignedIn(false);
      setIsAdmin(false);
      setBooting(false);
      return;
    }
    setSignedIn(true);
    const role = await myRoleFn();
    setIsAdmin(role.isAdmin);
    setBooting(false);
  }

  useEffect(() => {
    checkSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error("লগইন হয়নি: " + error.message);
        return;
      }
      await checkSession();
    } finally {
      setBusy(false);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setSignedIn(false);
    setIsAdmin(false);
    toast.success("লগআউট হয়েছে");
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("নাটকের নাম দিন");
      return;
    }
    if (!editingId && !form.videoFile) {
      toast.error("ভিডিও ফাইল বেছে নিন");
      return;
    }
    setSaving(true);
    try {
      let video_path: string | undefined;
      let thumb_path: string | undefined;

      if (form.videoFile) {
        const path = safeName(form.videoFile, "videos");
        const { error } = await supabase.storage.from("media").upload(path, form.videoFile, {
          contentType: form.videoFile.type || "video/mp4",
        });
        if (error) throw new Error("ভিডিও আপলোড হয়নি: " + error.message);
        video_path = path;
      }
      if (form.thumbFile) {
        const path = safeName(form.thumbFile, "thumbs");
        const { error } = await supabase.storage.from("media").upload(path, form.thumbFile, {
          contentType: form.thumbFile.type || "image/jpeg",
        });
        if (error) throw new Error("থাম্বনেইল আপলোড হয়নি: " + error.message);
        thumb_path = path;
      }

      const input: VideoInput = {
        id: editingId ?? undefined,
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        category: form.category,
        duration_label: form.duration_label.trim() || undefined,
        video_path,
        thumb_path,
        published: form.published,
        is_hero: form.is_hero,
      };
      await saveFn({ data: input });
      toast.success(editingId ? "নাটক আপডেট হয়েছে ✅" : "নাটক যোগ হয়েছে ✅");
      setForm(emptyForm);
      setEditingId(null);
      await refetch();
      queryClient.invalidateQueries({ queryKey: ["videos"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "সেভ হয়নি");
    } finally {
      setSaving(false);
    }
  }

  async function handleTogglePublish(v: VideoRow) {
    await saveFn({
      data: {
        id: v.id,
        title: v.title,
        description: v.description ?? undefined,
        category: v.category as VideoInput["category"],
        duration_label: v.duration_label ?? undefined,
        video_path: v.video_path ?? undefined,
        thumb_path: v.thumb_path ?? undefined,
        published: !v.published ?? true,
        is_hero: v.is_hero,
      },
    });
    toast.success(v.published ? "লুকানো হয়েছে" : "পাবলিশ করা হয়েছে");
    await refetch();
    queryClient.invalidateQueries({ queryKey: ["videos"] });
  }

  async function handleDelete(v: VideoRow) {
    if (!confirm(`"${v.title}" মুছে ফেলবেন?`)) return;
    await deleteFn({ data: { id: v.id } });
    toast.success("মুছে ফেলা হয়েছে");
    await refetch();
    queryClient.invalidateQueries({ queryKey: ["videos"] });
  }

  function startEdit(v: VideoRow) {
    setEditingId(v.id);
    setForm({
      title: v.title,
      description: v.description ?? "",
      category: v.category as FormState["category"],
      duration_label: v.duration_label ?? "",
      videoFile: null,
      thumbFile: null,
      published: v.published,
      is_hero: v.is_hero,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const videos = list?.videos ?? [];

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto min-h-screen max-w-[480px] px-4 pb-16">
        {/* Header */}
        <header className="flex items-center justify-between py-5">
          <button onClick={() => navigate({ to: "/" })} className="tap flex items-center gap-2">
            <ArrowLeft className="h-5 w-5" />
            <span className="bg-gradient-primary grid h-8 w-8 place-items-center rounded-lg shadow-glow">
              <Play className="h-4 w-4 fill-current" />
            </span>
            <span className="text-lg font-bold">Natok<span className="text-primary">Buzz</span> <span className="text-xs text-muted-foreground">অ্যাডমিন</span></span>
          </button>
          {signedIn && (
            <button onClick={handleSignOut} aria-label="লগআউট" className="tap grid h-9 w-9 place-items-center rounded-full border border-border bg-card">
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </header>

        {booting ? (
          <div className="mt-24 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !signedIn ? (
          /* Login */
          <div className="mt-12 rounded-2xl border border-border bg-card p-6">
            <div className="mb-6 flex flex-col items-center gap-2 text-center">
              <span className="bg-gradient-primary grid h-14 w-14 place-items-center rounded-full shadow-glow">
                <Lock className="h-6 w-6" />
              </span>
              <h1 className="font-bn text-xl font-bold">অ্যাডমিন লগইন</h1>
              <p className="font-bn text-xs text-muted-foreground">নাটক পোস্ট করতে লগইন করুন</p>
            </div>
            <form onSubmit={handleSignIn} className="space-y-3">
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="ইমেইল" autoComplete="email"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary" />
              <input
                type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="পাসওয়ার্ড" autoComplete="current-password"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary" />
              <button disabled={busy} className="tap bg-gradient-primary flex w-full items-center justify-center gap-2 rounded-full py-3 font-bn text-sm font-semibold shadow-glow disabled:opacity-60">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}লগইন করুন
              </button>
            </form>
          </div>
        ) : !isAdmin ? (
          <div className="mt-12 rounded-2xl border border-border bg-card p-6 text-center">
            <p className="font-bn text-sm">এই অ্যাকাউন্টে অ্যাডমিন এক্সেস নেই।</p>
            <button onClick={handleSignOut} className="tap mt-4 rounded-full border border-border px-5 py-2 font-bn text-sm">
              অন্য অ্যাকাউন্ট
            </button>
          </div>
        ) : (
          <>
            {/* Upload form */}
            <section className="rounded-2xl border border-border bg-card p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-bn text-base font-bold">
                  {editingId ? <Pencil className="h-4 w-4 text-primary" /> : <Upload className="h-4 w-4 text-primary" />}
                  {editingId ? "নাটক এডিট করুন" : "নতুন নাটক পোস্ট করুন"}
                </h2>
                {editingId && (
                  <button onClick={() => { setEditingId(null); setForm(emptyForm); }} aria-label="বাতিল" className="tap grid h-7 w-7 place-items-center rounded-full border border-border">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <form onSubmit={handleSave} className="space-y-3">
                <input
                  value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="নাটকের নাম" className="w-full rounded-xl border border-border bg-background px-4 py-2.5 font-bn text-sm outline-none focus:border-primary" />
                <textarea
                  value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="গল্পের সংক্ষিপ্ত বর্ণনা (ঐচ্ছিক)" rows={2}
                  className="w-full resize-none rounded-xl border border-border bg-background px-4 py-2.5 font-bn text-sm outline-none focus:border-primary" />

                {/* Category */}
                <div className="no-scrollbar flex gap-2 overflow-x-auto">
                  {(Object.keys(categoryLabels) as Array<keyof typeof categoryLabels>).map((c) => (
                    <button key={c} type="button" onClick={() => setForm({ ...form, category: c as FormState["category"] })}
                      className={`tap shrink-0 rounded-full border px-3 py-1.5 font-bn text-xs ${form.category === c ? "bg-gradient-primary border-transparent" : "border-border text-muted-foreground"}`}>
                      {categoryLabels[c]}
                    </button>
                  ))}
                </div>

                {/* Files */}
                <div className="grid grid-cols-2 gap-3">
                  <label className="tap flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border-2 border-dashed border-border p-4 text-center">
                    <Film className="h-5 w-5 text-primary" />
                    <span className="font-bn text-[11px] font-semibold">{form.videoFile ? form.videoFile.name.slice(0, 18) : "ভিডিও ফাইল"}</span>
                    <span className="text-[10px] text-muted-foreground">MP4 — সর্বোচ্চ ৫০০MB</span>
                    <input type="file" accept="video/*" className="hidden"
                      onChange={(e) => setForm({ ...form, videoFile: e.target.files?.[0] ?? null })} />
                  </label>
                  <label className="tap flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border-2 border-dashed border-border p-4 text-center">
                    <ImageIcon className="h-5 w-5 text-primary" />
                    <span className="font-bn text-[11px] font-semibold">{form.thumbFile ? form.thumbFile.name.slice(0, 18) : "থাম্বনেইল"}</span>
                    <span className="text-[10px] text-muted-foreground">ছবি (ঐচ্ছিক)</span>
                    <input type="file" accept="image/*" className="hidden"
                      onChange={(e) => setForm({ ...form, thumbFile: e.target.files?.[0] ?? null })} />
                  </label>
                </div>

                <div className="flex gap-2">
                  <input
                    value={form.duration_label} onChange={(e) => setForm({ ...form, duration_label: e.target.value })}
                    placeholder="সময়কাল (যেমন 38:20)"
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 font-bn text-sm outline-none focus:border-primary" />
                </div>

                {/* Flags */}
                <div className="flex flex-wrap gap-4">
                  <label className="flex cursor-pointer items-center gap-2 font-bn text-xs">
                    <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="accent-[hsl(var(--primary))]" />
                    সবার জন্য দেখাও
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 font-bn text-xs">
                    <input type="checkbox" checked={form.is_hero} onChange={(e) => setForm({ ...form, is_hero: e.target.checked })} className="accent-[hsl(var(--primary))]" />
                    হিরো ব্যানারে দেখাও
                  </label>
                </div>

                <button disabled={saving} className="tap bg-gradient-primary flex w-full items-center justify-center gap-2 rounded-full py-3 font-bn text-sm font-semibold shadow-glow disabled:opacity-60">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {saving ? "আপলোড হচ্ছে..." : editingId ? "আপডেট করুন" : "পোস্ট করুন"}
                </button>
              </form>
            </section>

            {/* List */}
            <section className="mt-5">
              <h2 className="mb-3 font-bn text-base font-bold">সব নাটক ({videos.length})</h2>
              {videos.length === 0 && (
                <p className="rounded-2xl border border-border bg-card p-6 text-center font-bn text-sm text-muted-foreground">
                  এখনও কোনো নাটক নেই — উপরের ফর্ম থেকে পোস্ট করুন।
                </p>
              )}
              <div className="space-y-3">
                {videos.map((v) => (
                  <div key={v.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-2.5">
                    <img src={v.thumbUrl ?? `https://picsum.photos/seed/${v.id}/120/68`} alt={v.title} className="h-14 w-24 shrink-0 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bn text-sm font-semibold">{v.title}</p>
                      <p className="font-bn text-[10px] text-muted-foreground">
                        {categoryLabels[v.category] ?? v.category}{v.duration_label ? ` • ${v.duration_label}` : ""}
                        {v.is_hero ? " • হিরো" : ""}
                      </p>
                      <span className={`mt-1 inline-block rounded px-1.5 py-0.5 text-[9px] font-semibold ${v.published ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                        {v.published ? "পাবলিশড" : "লুকানো"}
                      </span>
                    </div>
                    <div className="flex shrink-0 flex-col gap-1.5">
                      <button onClick={() => handleTogglePublish(v)} aria-label="পাবলিশ টগল" className="tap grid h-7 w-7 place-items-center rounded-full border border-border">
                        {v.published ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                      </button>
                      <button onClick={() => startEdit(v)} aria-label="এডিট" className="tap grid h-7 w-7 place-items-center rounded-full border border-border">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => handleDelete(v)} aria-label="মুছুন" className="tap grid h-7 w-7 place-items-center rounded-full border border-primary/40 text-primary">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
