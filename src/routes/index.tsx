import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Bell, Search, SlidersHorizontal, Home, Play, Plus, Heart, Calendar, Clock,
  MoreVertical, ArrowRight, LayoutGrid, Compass, Tv, Library, ChevronRight,
  X, Check, Upload, User, Eye,
} from "lucide-react";
import { toast } from "sonner";
import hero1 from "@/assets/hero1.jpg";
import hero2 from "@/assets/hero2.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NatokBuzz — বাংলা নাটক স্ট্রিমিং" },
      { name: "description", content: "সেরা বাংলা নাটক, শর্টফিল্ম, মিউজিক ও কমেডি দেখুন NatokBuzz-এ।" },
      { property: "og:title", content: "NatokBuzz — বাংলা নাটক স্ট্রিমিং" },
      { property: "og:description", content: "সেরা বাংলা নাটক, শর্টফিল্ম, মিউজিক ও কমেডি দেখুন NatokBuzz-এ।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

/* ---------- Data ---------- */
const chips = [
  { id: "all", label: "সবগুলো", icon: null },
  { id: "natok", label: "বাংলা নাটক", icon: "🎭" },
  { id: "short", label: "শর্টফিল্ম", icon: "🎬" },
  { id: "music", label: "মিউজিক", icon: "🎵" },
  { id: "comedy", label: "কমেডি", icon: "😄" },
];

const heroes = [
  { id: "tomar-shohore", a: "তোমার", b: "শহরে", img: hero1, genre: "রোমান্টিক", year: "২০২৪", len: "৪২ মিনিট" },
  { id: "brishti-veja", a: "বৃষ্টি", b: "ভেজা দিন", img: hero2, genre: "ড্রামা", year: "২০২৪", len: "৩৯ মিনিট" },
  { id: "shesh-chithi", a: "শেষ", b: "চিঠি", img: hero1, genre: "রোমান্টিক", year: "২০২৩", len: "৪৫ মিনিট" },
  { id: "ochena-akash", a: "অচেনা", b: "আকাশ", img: hero2, genre: "থ্রিলার", year: "২০২৪", len: "৪০ মিনিট" },
];

type Video = { title: string; dur: string; views: string; ago: string; seed: string; cat: string };
const trending: Video[] = [
  { title: "অভিমান", dur: "38:20", views: "1.2M", ago: "৩ দিন আগে", seed: "abhiman", cat: "natok" },
  { title: "চেনা পথ", dur: "35:12", views: "850K", ago: "১ সপ্তাহ আগে", seed: "chenapoth", cat: "natok" },
  { title: "নীরবতা", dur: "39:18", views: "620K", ago: "২ সপ্তাহ আগে", seed: "nirobota", cat: "short" },
];
const fresh: Video[] = [
  { title: "ভুলে থেও না", dur: "38:00", views: "320K", ago: "২ দিন আগে", seed: "bhule", cat: "natok" },
  { title: "তোমার ছোঁয়ায়", dur: "37:25", views: "410K", ago: "৪ দিন আগে", seed: "chhoyay", cat: "music" },
  { title: "আবার দেখা", dur: "41:22", views: "280K", ago: "৫ দিন আগে", seed: "abar", cat: "comedy" },
];
const popular: Video[] = [
  { title: "ফেরারি মন", dur: "42:10", views: "3.4M", ago: "১ মাস আগে", seed: "ferari", cat: "natok" },
  { title: "একটু ভালোবাসা", dur: "36:45", views: "2.8M", ago: "২ মাস আগে", seed: "valobasha", cat: "short" },
  { title: "মেঘের পরে", dur: "40:05", views: "2.1M", ago: "৩ সপ্তাহ আগে", seed: "megh", cat: "comedy" },
];
const allVideos = [...trending, ...fresh, ...popular];

const categories = [
  { id: "natok", label: "বাংলা নাটক", icon: "🎭", count: "2.1K ভিডিও", bg: "var(--cat-red)" },
  { id: "short", label: "শর্টফিল্ম", icon: "🎬", count: "850 ভিডিও", bg: "var(--cat-purple)" },
  { id: "music", label: "মিউজিক", icon: "🎵", count: "620 ভিডিও", bg: "var(--cat-blue)" },
  { id: "comedy", label: "কমেডি", icon: "😄", count: "430 ভিডিও", bg: "var(--cat-orange)" },
  { id: "series", label: "ওয়েব সিরিজ", icon: "📺", count: "280 ভিডিও", bg: "var(--cat-green)" },
];

const notifications = [
  { id: 1, text: "নতুন নাটক 'ভুলে থেও না' এখন স্ট্রিমিং-এ!", time: "১ ঘণ্টা আগে" },
  { id: 2, text: "'অভিমান' এখন ট্রেন্ডিং #1 🎉", time: "৫ ঘণ্টা আগে" },
  { id: 3, text: "আপনার সাবস্ক্রাইব করা চ্যানেলে নতুন ভিডিও", time: "গতকাল" },
];

/* ---------- Components ---------- */
function SectionHead({ icon, title, onSeeAll }: { icon: React.ReactNode; title: string; onSeeAll: () => void }) {
  return (
    <div className="mb-3 flex items-center justify-between px-4">
      <h2 className="flex items-center gap-2 font-bn text-lg font-bold">{icon}{title}</h2>
      <button onClick={onSeeAll} className="tap flex items-center gap-1 font-bn text-xs text-muted-foreground">
        সব দেখুন <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function VideoRow({ items, isNew, onOpen }: { items: Video[]; isNew?: boolean; onOpen: (v: Video) => void }) {
  return (
    <div className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1">
      {items.map((v) => (
        <article key={v.seed} onClick={() => onOpen(v)} className="tap w-[150px] shrink-0 cursor-pointer snap-start">
          <div className="relative aspect-video overflow-hidden rounded-xl border border-border bg-card">
            <img src={`https://picsum.photos/seed/${v.seed}/320/180`} alt={v.title} loading="lazy" className="h-full w-full object-cover opacity-80" />
            <div className="bg-hero-fade absolute inset-0" />
            <span className="absolute bottom-2 left-2 font-bn text-base font-bold leading-none drop-shadow">{v.title}</span>
            {isNew && <span className="bg-gradient-primary absolute left-1.5 top-1.5 rounded px-1.5 py-0.5 text-[9px] font-semibold">New</span>}
            <span className="absolute bottom-1.5 right-1.5 rounded bg-background/80 px-1 text-[9px] font-medium">{v.dur}</span>
            <span className="absolute inset-0 grid place-items-center opacity-0 transition-opacity hover:opacity-100">
              <span className="bg-gradient-primary grid h-10 w-10 place-items-center rounded-full shadow-glow"><Play className="h-4 w-4 fill-current" /></span>
            </span>
          </div>
          <div className="mt-2 flex gap-1">
            <div className="min-w-0 flex-1">
              <p className="truncate font-bn text-xs font-semibold">{v.title} | বাংলা নাটক</p>
              <p className="truncate text-[10px] text-muted-foreground">{v.views} ভিউ • {v.ago}</p>
            </div>
            <button
              aria-label="অপশন"
              onClick={(e) => { e.stopPropagation(); toast.info(`"${v.title}" — অপশন শীঘ্রই আসছে`); }}
              className="tap shrink-0 self-start p-0.5">
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}

function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-in slide-in-from-bottom-8 relative w-full max-w-[390px] rounded-t-3xl border-t border-border bg-card p-5 pb-8">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-bn text-lg font-bold">{title}</h3>
          <button onClick={onClose} aria-label="বন্ধ করুন" className="tap grid h-8 w-8 place-items-center rounded-full border border-border">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Index() {
  const navigate = useNavigate();
  const [chip, setChip] = useState("all");
  const [slide, setSlide] = useState(0);
  const [tab, setTab] = useState("home");
  const [query, setQuery] = useState("");
  const [myList, setMyList] = useState<string[]>([]);

  // Persist "আমার তালিকা" across page navigations
  useEffect(() => {
    try {
      const saved = localStorage.getItem("natokbuzz-mylist");
      if (saved) setMyList(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);
  useEffect(() => {
    try { localStorage.setItem("natokbuzz-mylist", JSON.stringify(myList)); } catch { /* ignore */ }
  }, [myList]);
  const [showNotif, setShowNotif] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [notifRead, setNotifRead] = useState(false);
  const [sort, setSort] = useState<"new" | "views">("new");
  const touchX = useRef<number | null>(null);

  // Auto-slide every 5s
  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % heroes.length), 5000);
    return () => clearInterval(t);
  }, [slide]);

  const h = heroes[slide]!;
  const heroInList = myList.includes(h.id);

  const filterVideos = (items: Video[]) => {
    let out = items;
    if (chip !== "all") out = out.filter((v) => v.cat === chip);
    if (query.trim()) out = out.filter((v) => v.title.includes(query.trim()));
    if (sort === "views") out = [...out].sort((a, b) => parseFloat(b.views) - parseFloat(a.views));
    return out;
  };

  const openVideo = (v: Video) =>
    navigate({ to: "/watch/$seed", params: { seed: v.seed }, search: { title: v.title, dur: v.dur, views: v.views } });

  const toggleMyList = (id: string, name: string) => {
    setMyList((l) => {
      const has = l.includes(id);
      toast.success(has ? `"${name}" তালিকা থেকে সরানো হয়েছে` : `"${name}" আপনার তালিকায় যোগ হয়েছে`);
      return has ? l.filter((x) => x !== id) : [...l, id];
    });
  };

  const navItems = [
    { id: "home", label: "হোম", Icon: Home },
    { id: "explore", label: "এক্সপ্লোর", Icon: Compass },
    { id: "fab" },
    { id: "subs", label: "সাবস্ক্রিপশন", Icon: Tv },
    { id: "lib", label: "লাইব্রেরি", Icon: Library },
  ] as const;

  const listVideos = allVideos.filter((v) => myList.includes(v.seed));

  return (
    <div className="min-h-screen bg-background">
      <div className="relative mx-auto min-h-screen max-w-[390px] pb-28">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 pb-3 pt-5">
          <button onClick={() => setTab("home")} className="tap flex items-center gap-2">
            <span className="bg-gradient-primary grid h-8 w-8 place-items-center rounded-lg shadow-glow">
              <Play className="h-4 w-4 fill-current" />
            </span>
            <span className="text-xl font-bold">Natok<span className="text-primary">Buzz</span></span>
          </button>
          <div className="flex items-center gap-3">
            <button
              aria-label="নোটিফিকেশন"
              onClick={() => { setShowNotif(true); setNotifRead(true); }}
              className="tap relative grid h-9 w-9 place-items-center rounded-full border border-border bg-card">
              <Bell className="h-4 w-4" />
              {!notifRead && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />}
            </button>
            <button aria-label="প্রোফাইল" onClick={() => toast.info("প্রোফাইল পেজ শীঘ্রই আসছে")} className="tap">
              <span className="grid h-9 w-9 place-items-center rounded-full border-2 border-primary bg-card">
                <User className="h-4.5 w-4.5 text-white" />
              </span>
            </button>
          </div>
        </header>

        {tab === "home" && (
          <>
            {/* Search */}
            <div className="flex gap-2 px-4">
              <label className="flex h-12 flex-1 items-center gap-2 rounded-full border border-border bg-card px-4">
                <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="নাটক, অভিনেতা, গল্প খুঁজুন..."
                  className="min-w-0 flex-1 bg-transparent font-bn text-sm outline-none placeholder:text-muted-foreground" />
                {query && (
                  <button aria-label="মুছুন" onClick={() => setQuery("")} className="tap">
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                )}
              </label>
              <button
                aria-label="ফিল্টার"
                onClick={() => setShowFilter(true)}
                className={`tap grid h-12 w-12 place-items-center rounded-2xl border ${sort === "views" ? "border-primary bg-primary/20 text-primary" : "border-border bg-card"}`}>
                <SlidersHorizontal className="h-4 w-4" />
              </button>
            </div>

            {/* Chips */}
            <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto px-4">
              {chips.map((c) => (
                <button key={c.id} onClick={() => setChip(c.id)}
                  className={`tap flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 font-bn text-sm font-medium ${chip === c.id ? "bg-gradient-primary shadow-glow" : "border border-border bg-card text-muted-foreground"}`}>
                  {c.icon ? <span>{c.icon}</span> : <Home className="h-4 w-4" />}{c.label}
                </button>
              ))}
            </div>

            {/* Hero carousel */}
            <section className="px-4 pt-4">
              <div className="relative h-[340px] overflow-hidden rounded-[20px] border border-border"
                onTouchStart={(e) => (touchX.current = e.touches[0]!.clientX)}
                onTouchEnd={(e) => {
                  if (touchX.current === null) return;
                  const d = e.changedTouches[0]!.clientX - touchX.current;
                  if (Math.abs(d) > 40) setSlide((s) => (s + (d < 0 ? 1 : heroes.length - 1)) % heroes.length);
                  touchX.current = null;
                }}>
                {heroes.map((x, i) => (
                  <img key={i} src={x.img} alt={`${x.a} ${x.b}`} width={1024} height={1280}
                    className={`absolute inset-0 h-full w-full object-cover object-right transition-opacity duration-700 ${i === slide ? "opacity-100" : "opacity-0"}`} />
                ))}
                <div className="bg-hero-fade absolute inset-0" />
                <div className="relative flex h-full flex-col justify-between p-5">
                  <p className="text-[11px] font-medium tracking-wide text-muted-foreground">NatokBuzz <span className="text-primary">Original</span></p>
                  <div key={slide} className="animate-in fade-in slide-in-from-left-4 duration-500">
                    <h1 className="font-bn text-5xl font-bold leading-[1.05]">{h.a}</h1>
                    <h1 className="flex items-center gap-2 font-bn text-5xl font-bold leading-[1.1] text-primary">
                      {h.b}<Heart className="h-5 w-5" />
                    </h1>
                    <div className="mt-3 flex flex-wrap items-center gap-2 font-bn text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Heart className="h-3 w-3 fill-primary text-primary" />{h.genre}</span>•
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{h.year}</span>•
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{h.len}</span>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => navigate({ to: "/watch/$seed", params: { seed: h.id }, search: { title: `${h.a} ${h.b}`, dur: h.len, views: "1.5M" } })}
                        className="tap bg-gradient-primary flex items-center gap-1.5 rounded-full px-4 py-2.5 font-bn text-sm font-semibold shadow-glow">
                        <Play className="h-4 w-4 fill-current" />এখনই দেখুন
                      </button>
                      <button
                        onClick={() => toggleMyList(h.id, `${h.a} ${h.b}`)}
                        className={`tap flex items-center gap-1.5 rounded-full border px-4 py-2.5 font-bn text-sm font-semibold backdrop-blur ${heroInList ? "border-primary bg-primary/20 text-primary" : "border-foreground/40 bg-background/30"}`}>
                        {heroInList ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                        {heroInList ? "তালিকায় আছে" : "আমার তালিকায়"}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-5 right-5 flex gap-1.5">
                  {heroes.map((_, i) => (
                    <button key={i} aria-label={`Slide ${i + 1}`} onClick={() => setSlide(i)}
                      className={`h-1.5 rounded-full transition-all ${i === slide ? "w-5 bg-primary" : "w-1.5 bg-foreground/40"}`} />
                  ))}
                </div>
              </div>
            </section>

            <section className="mt-6">
              <SectionHead icon={<span>🔥</span>} title="ট্রেন্ডিং এখন" onSeeAll={() => { setChip("all"); setSort("views"); toast.info("সব ট্রেন্ডিং ভিডিও দেখানো হচ্ছে"); }} />
              <VideoRow items={filterVideos(trending)} onOpen={openVideo} />
            </section>

            <section className="mt-6">
              <SectionHead icon={<LayoutGrid className="h-5 w-5 text-primary" />} title="ক্যাটাগরি" onSeeAll={() => setTab("explore")} />
              <div className="no-scrollbar flex snap-x gap-3 overflow-x-auto px-4">
                {categories.map((c) => (
                  <button key={c.label} onClick={() => { setChip(c.id === "series" ? "all" : c.id); toast.info(`"${c.label}" ক্যাটাগরি বেছে নেওয়া হয়েছে`); }}
                    style={{ backgroundImage: c.bg }}
                    className="tap flex h-[150px] w-[108px] shrink-0 snap-start flex-col justify-between rounded-[18px] border border-border p-3 text-left">
                    <span className="text-3xl">{c.icon}</span>
                    <div>
                      <p className="font-bn text-sm font-bold leading-tight">{c.label}</p>
                      <p className="font-bn text-[10px] opacity-80">{c.count}</p>
                      <span className="mt-2 grid h-6 w-6 place-items-center rounded-full bg-foreground/20"><ChevronRight className="h-3.5 w-3.5" /></span>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <section className="mt-6">
              <SectionHead icon={<span>⭐</span>} title="নতুন নাটক" onSeeAll={() => { setChip("all"); setSort("new"); toast.info("সব নতুন নাটক দেখানো হচ্ছে"); }} />
              <VideoRow items={filterVideos(fresh)} isNew onOpen={openVideo} />
            </section>
            <section className="mt-6">
              <SectionHead icon={<Heart className="h-5 w-5 fill-primary text-primary" />} title="জনপ্রিয় নাটক" onSeeAll={() => { setChip("all"); setSort("views"); toast.info("সব জনপ্রিয় নাটক দেখানো হচ্ছে"); }} />
              <VideoRow items={filterVideos(popular)} onOpen={openVideo} />
            </section>
          </>
        )}

        {tab === "explore" && (
          <section className="px-4">
            <h2 className="mb-4 font-bn text-2xl font-bold">এক্সপ্লোর</h2>
            <div className="grid grid-cols-2 gap-3">
              {allVideos.map((v) => (
                <button key={v.seed} onClick={() => openVideo(v)} className="tap overflow-hidden rounded-xl border border-border bg-card text-left">
                  <img src={`https://picsum.photos/seed/${v.seed}/320/180`} alt={v.title} className="aspect-video w-full object-cover opacity-80" />
                  <div className="p-2">
                    <p className="truncate font-bn text-xs font-semibold">{v.title}</p>
                    <p className="text-[10px] text-muted-foreground">{v.views} ভিউ</p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {tab === "subs" && (
          <section className="px-4">
            <h2 className="mb-4 font-bn text-2xl font-bold">সাবস্ক্রিপশন</h2>
            {["DramaBD", "Natok House", "CineBangla"].map((ch, i) => (
              <div key={ch} className="mb-3 flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
                <img src={`https://i.pravatar.cc/80?img=${i + 20}`} alt={ch} className="h-11 w-11 rounded-full object-cover" />
                <div className="flex-1">
                  <p className="font-bn text-sm font-bold">{ch}</p>
                  <p className="text-[11px] text-muted-foreground">{120 + i * 45}K সাবস্ক্রাইবার</p>
                </div>
                <button onClick={() => toast.success(`${ch} সাবস্ক্রাইব করা হয়েছে`)} className="tap bg-gradient-primary rounded-full px-4 py-1.5 font-bn text-xs font-semibold">
                  সাবস্ক্রাইব
                </button>
              </div>
            ))}
          </section>
        )}

        {tab === "lib" && (
          <section className="px-4">
            <h2 className="mb-4 font-bn text-2xl font-bold">আমার লাইব্রেরি</h2>
            {listVideos.length === 0 && myList.filter((id) => heroes.some((x) => x.id === id)).length === 0 ? (
              <div className="mt-16 flex flex-col items-center gap-3 text-center">
                <Library className="h-12 w-12 text-muted-foreground" />
                <p className="font-bn text-sm text-muted-foreground">আপনার তালিকা খালি।<br />হোম থেকে "আমার তালিকায়" বাটনে চাপ দিন।</p>
                <button onClick={() => setTab("home")} className="tap bg-gradient-primary mt-2 rounded-full px-5 py-2 font-bn text-sm font-semibold">হোমে যান</button>
              </div>
            ) : (
              <div className="space-y-3">
                {heroes.filter((x) => myList.includes(x.id)).map((x) => (
                  <button key={x.id} onClick={() => navigate({ to: "/watch/$seed", params: { seed: x.id }, search: { title: `${x.a} ${x.b}`, dur: x.len, views: "1.5M" } })}
                    className="tap flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-2 text-left">
                    <img src={x.img} alt={`${x.a} ${x.b}`} className="h-16 w-24 rounded-lg object-cover" />
                    <div className="flex-1">
                      <p className="font-bn text-sm font-bold">{x.a} {x.b}</p>
                      <p className="text-[11px] text-muted-foreground">{x.genre} • {x.len}</p>
                    </div>
                    <Play className="mr-2 h-5 w-5 text-primary" />
                  </button>
                ))}
                {listVideos.map((v) => (
                  <button key={v.seed} onClick={() => openVideo(v)} className="tap flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-2 text-left">
                    <img src={`https://picsum.photos/seed/${v.seed}/320/180`} alt={v.title} className="h-16 w-24 rounded-lg object-cover" />
                    <div className="flex-1">
                      <p className="font-bn text-sm font-bold">{v.title}</p>
                      <p className="text-[11px] text-muted-foreground">{v.views} ভিউ • {v.dur}</p>
                    </div>
                    <Play className="mr-2 h-5 w-5 text-primary" />
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Bottom nav */}
        <nav className="bg-nav fixed bottom-0 left-1/2 z-20 w-full max-w-[390px] -translate-x-1/2 rounded-t-3xl border-t border-border backdrop-blur-xl">
          <div className="grid grid-cols-5 items-end px-2 pb-3 pt-2">
            {navItems.map((n) =>
              n.id === "fab" ? (
                <div key="fab" className="flex justify-center">
                  <button aria-label="আপলোড" onClick={() => setShowUpload(true)} className="tap bg-gradient-primary -mt-8 grid h-14 w-14 place-items-center rounded-full border-4 border-background shadow-glow">
                    <Plus className="h-6 w-6" />
                  </button>
                </div>
              ) : (
                <button key={n.id} onClick={() => setTab(n.id)}
                  className={`tap flex flex-col items-center gap-1 font-bn text-[10px] ${tab === n.id ? "text-primary" : "text-muted-foreground"}`}>
                  <n.Icon className="h-5 w-5" />{n.label}
                </button>
              ),
            )}
          </div>
        </nav>

        {/* Notifications sheet */}
        <Sheet open={showNotif} onClose={() => setShowNotif(false)} title="নোটিফিকেশন">
          <div className="space-y-3">
            {notifications.map((n) => (
              <div key={n.id} className="flex gap-3 rounded-2xl border border-border bg-background/50 p-3">
                <span className="bg-gradient-primary grid h-9 w-9 shrink-0 place-items-center rounded-full"><Bell className="h-4 w-4" /></span>
                <div>
                  <p className="font-bn text-sm">{n.text}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{n.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Sheet>

        {/* Filter sheet */}
        <Sheet open={showFilter} onClose={() => setShowFilter(false)} title="ফিল্টার ও সাজান">
          <p className="mb-2 font-bn text-sm font-semibold text-muted-foreground">সাজানোর ধরন</p>
          <div className="flex gap-2">
            <button onClick={() => { setSort("new"); setShowFilter(false); }}
              className={`tap flex-1 rounded-full border px-4 py-2.5 font-bn text-sm font-medium ${sort === "new" ? "border-primary bg-primary/20 text-primary" : "border-border"}`}>
              নতুন আগে
            </button>
            <button onClick={() => { setSort("views"); setShowFilter(false); }}
              className={`tap flex-1 rounded-full border px-4 py-2.5 font-bn text-sm font-medium ${sort === "views" ? "border-primary bg-primary/20 text-primary" : "border-border"}`}>
              বেশি ভিউ আগে
            </button>
          </div>
        </Sheet>

        {/* Upload sheet */}
        <Sheet open={showUpload} onClose={() => setShowUpload(false)} title="নতুন ভিডিও আপলোড">
          <button onClick={() => { setShowUpload(false); toast.success("আপলোড ফিচার শীঘ্রই আসছে!"); }}
            className="tap flex w-full flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border p-8">
            <span className="bg-gradient-primary grid h-14 w-14 place-items-center rounded-full shadow-glow"><Upload className="h-6 w-6" /></span>
            <p className="font-bn text-sm font-semibold">ভিডিও ফাইল বেছে নিন</p>
            <p className="text-[11px] text-muted-foreground">MP4, MOV — সর্বোচ্চ ২GB</p>
          </button>
        </Sheet>
      </div>
    </div>
  );
}
