import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Bell, Search, SlidersHorizontal, Home, Play, Plus, Heart, Calendar, Clock,
  MoreVertical, ArrowRight, LayoutGrid, Compass, Tv, Library, ChevronRight,
} from "lucide-react";
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
  { a: "তোমার", b: "শহরে", img: hero1, genre: "রোমান্টিক", year: "২০২৪", len: "৪২ মিনিট" },
  { a: "বৃষ্টি", b: "ভেজা দিন", img: hero2, genre: "ড্রামা", year: "২০২৪", len: "৩৯ মিনিট" },
  { a: "শেষ", b: "চিঠি", img: hero1, genre: "রোমান্টিক", year: "২০২৩", len: "৪৫ মিনিট" },
  { a: "অচেনা", b: "আকাশ", img: hero2, genre: "থ্রিলার", year: "২০২৪", len: "৪০ মিনিট" },
];

type Video = { title: string; dur: string; views: string; ago: string; seed: string };
const trending: Video[] = [
  { title: "অভিমান", dur: "38:20", views: "1.2M", ago: "3 days ago", seed: "abhiman" },
  { title: "চেনা পথ", dur: "35:12", views: "850K", ago: "1 week ago", seed: "chenapoth" },
  { title: "নীরবতা", dur: "39:18", views: "620K", ago: "2 weeks ago", seed: "nirobota" },
];
const fresh: Video[] = [
  { title: "ভুলে থেও না", dur: "38:00", views: "320K", ago: "2 days ago", seed: "bhule" },
  { title: "তোমার ছোঁয়ায়", dur: "37:25", views: "410K", ago: "4 days ago", seed: "chhoyay" },
  { title: "আবার দেখা", dur: "41:22", views: "280K", ago: "5 days ago", seed: "abar" },
];
const popular: Video[] = [
  { title: "ফেরারি মন", dur: "42:10", views: "3.4M", ago: "1 month ago", seed: "ferari" },
  { title: "একটু ভালোবাসা", dur: "36:45", views: "2.8M", ago: "2 months ago", seed: "valobasha" },
  { title: "মেঘের পরে", dur: "40:05", views: "2.1M", ago: "3 weeks ago", seed: "megh" },
];

const categories = [
  { label: "বাংলা নাটক", icon: "🎭", count: "2.1K ভিডিও", bg: "var(--cat-red)" },
  { label: "শর্টফিল্ম", icon: "🎬", count: "850 ভিডিও", bg: "var(--cat-purple)" },
  { label: "মিউজিক", icon: "🎵", count: "620 ভিডিও", bg: "var(--cat-blue)" },
  { label: "কমেডি", icon: "😄", count: "430 ভিডিও", bg: "var(--cat-orange)" },
  { label: "ওয়েব সিরিজ", icon: "📺", count: "280 ভিডিও", bg: "var(--cat-green)" },
];

/* ---------- Components ---------- */
function SectionHead({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="mb-3 flex items-center justify-between px-4">
      <h2 className="flex items-center gap-2 font-bn text-lg font-bold">{icon}{title}</h2>
      <button className="tap flex items-center gap-1 font-bn text-xs text-muted-foreground">
        সব দেখুন <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function VideoRow({ items, isNew }: { items: Video[]; isNew?: boolean }) {
  return (
    <div className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1">
      {items.map((v) => (
        <article key={v.seed} className="tap w-[150px] shrink-0 snap-start">
          <div className="relative aspect-video overflow-hidden rounded-xl border border-border bg-card">
            <img src={`https://picsum.photos/seed/${v.seed}/320/180`} alt={v.title} loading="lazy" className="h-full w-full object-cover opacity-80" />
            <div className="bg-hero-fade absolute inset-0" />
            <span className="absolute bottom-2 left-2 font-bn text-base font-bold leading-none drop-shadow">{v.title}</span>
            {isNew && <span className="bg-gradient-primary absolute left-1.5 top-1.5 rounded px-1.5 py-0.5 text-[9px] font-semibold">New</span>}
            <span className="absolute bottom-1.5 right-1.5 rounded bg-background/80 px-1 text-[9px] font-medium">{v.dur}</span>
          </div>
          <div className="mt-2 flex gap-1">
            <div className="min-w-0 flex-1">
              <p className="truncate font-bn text-xs font-semibold">{v.title} | বাংলা নাটক</p>
              <p className="truncate text-[10px] text-muted-foreground">{v.views} views • {v.ago}</p>
            </div>
            <MoreVertical className="h-4 w-4 shrink-0 text-muted-foreground" />
          </div>
        </article>
      ))}
    </div>
  );
}

function Index() {
  const [chip, setChip] = useState("all");
  const [slide, setSlide] = useState(0);
  const [tab, setTab] = useState("home");
  const touchX = useRef<number | null>(null);

  // Auto-slide every 5s
  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % heroes.length), 5000);
    return () => clearInterval(t);
  }, [slide]);

  const h = heroes[slide]!;
  const navItems = [
    { id: "home", label: "হোম", Icon: Home },
    { id: "explore", label: "এক্সপ্লোর", Icon: Compass },
    { id: "fab" },
    { id: "subs", label: "সাবস্ক্রিপশন", Icon: Tv },
    { id: "lib", label: "লাইব্রেরি", Icon: Library },
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      <div className="relative mx-auto min-h-screen max-w-[390px] pb-28">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 pb-3 pt-5">
          <div className="flex items-center gap-2">
            <span className="bg-gradient-primary grid h-8 w-8 place-items-center rounded-lg shadow-glow">
              <Play className="h-4 w-4 fill-current" />
            </span>
            <span className="text-xl font-bold">Natok<span className="text-primary">Buzz</span></span>
          </div>
          <div className="flex items-center gap-3">
            <button className="tap relative grid h-9 w-9 place-items-center rounded-full border border-border bg-card">
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
            </button>
            <img src="https://i.pravatar.cc/80?img=12" alt="User" className="h-9 w-9 rounded-full border-2 border-primary object-cover" />
          </div>
        </header>

        {/* Search */}
        <div className="flex gap-2 px-4">
          <label className="flex h-12 flex-1 items-center gap-2 rounded-full border border-border bg-card px-4">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input placeholder="নাটক, অভিনেতা, গল্প খুঁজুন..." className="min-w-0 flex-1 bg-transparent font-bn text-sm outline-none placeholder:text-muted-foreground" />
          </label>
          <button className="tap grid h-12 w-12 place-items-center rounded-2xl border border-border bg-card">
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
                  <button className="tap bg-gradient-primary flex items-center gap-1.5 rounded-full px-4 py-2.5 font-bn text-sm font-semibold shadow-glow">
                    <Play className="h-4 w-4 fill-current" />এখনই দেখুন
                  </button>
                  <button className="tap flex items-center gap-1.5 rounded-full border border-foreground/40 bg-background/30 px-4 py-2.5 font-bn text-sm font-semibold backdrop-blur">
                    <Plus className="h-4 w-4" />আমার তালিকায়
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

        <section className="mt-6"><SectionHead icon={<span>🔥</span>} title="ট্রেন্ডিং এখন" /><VideoRow items={trending} /></section>

        <section className="mt-6">
          <SectionHead icon={<LayoutGrid className="h-5 w-5 text-primary" />} title="ক্যাটাগরি" />
          <div className="no-scrollbar flex snap-x gap-3 overflow-x-auto px-4">
            {categories.map((c) => (
              <div key={c.label} style={{ backgroundImage: c.bg }}
                className="tap flex h-[150px] w-[108px] shrink-0 snap-start flex-col justify-between rounded-[18px] border border-border p-3">
                <span className="text-3xl">{c.icon}</span>
                <div>
                  <p className="font-bn text-sm font-bold leading-tight">{c.label}</p>
                  <p className="font-bn text-[10px] opacity-80">{c.count}</p>
                  <span className="mt-2 grid h-6 w-6 place-items-center rounded-full bg-foreground/20"><ChevronRight className="h-3.5 w-3.5" /></span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6"><SectionHead icon={<span>⭐</span>} title="নতুন নাটক" /><VideoRow items={fresh} isNew /></section>
        <section className="mt-6"><SectionHead icon={<Heart className="h-5 w-5 fill-primary text-primary" />} title="জনপ্রিয় নাটক" /><VideoRow items={popular} /></section>

        {/* Bottom nav */}
        <nav className="bg-nav fixed bottom-0 left-1/2 z-20 w-full max-w-[390px] -translate-x-1/2 rounded-t-3xl border-t border-border backdrop-blur-xl">
          <div className="grid grid-cols-5 items-end px-2 pb-3 pt-2">
            {navItems.map((n) =>
              n.id === "fab" ? (
                <div key="fab" className="flex justify-center">
                  <button aria-label="Upload" className="tap bg-gradient-primary -mt-8 grid h-14 w-14 place-items-center rounded-full border-4 border-background shadow-glow">
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
      </div>
    </div>
  );
}
