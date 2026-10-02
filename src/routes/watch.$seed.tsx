import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Play, Heart, Share2, Download, ThumbsUp, Eye, Clock } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const watchSearch = z.object({
  title: z.string().default("নাটক"),
  dur: z.string().default("40:00"),
  views: z.string().default("1M"),
});

export const Route = createFileRoute("/watch/$seed")({
  validateSearch: (s) => watchSearch.parse(s),
  head: () => ({
    meta: [
      { title: "দেখুন — NatokBuzz" },
      { name: "description", content: "NatokBuzz-এ বাংলা নাটক দেখুন।" },
      { property: "og:title", content: "দেখুন — NatokBuzz" },
      { property: "og:description", content: "NatokBuzz-এ বাংলা নাটক দেখুন।" },
      { property: "og:type", content: "video.other" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Watch,
});

function Watch() {
  const { seed } = Route.useParams();
  const { title, dur, views } = Route.useSearch();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [playing, setPlaying] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <div className="relative mx-auto min-h-screen max-w-[390px] pb-10">
        {/* Player */}
        <div className="relative aspect-video w-full overflow-hidden bg-card">
          <img src={`https://picsum.photos/seed/${seed}/640/360`} alt={title} className="h-full w-full object-cover opacity-70" />
          <div className="bg-hero-fade absolute inset-0" />
          <button
            aria-label="প্লে করুন"
            onClick={() => { setPlaying(true); toast.info("ভিডিও প্লেয়ার শীঘ্রই আসছে — এখন ডেমো মোড"); }}
            className="tap absolute inset-0 grid place-items-center">
            <span className="bg-gradient-primary grid h-16 w-16 place-items-center rounded-full shadow-glow">
              <Play className="h-7 w-7 fill-current" />
            </span>
          </button>
          <button
            aria-label="ফিরে যান"
            onClick={() => navigate({ to: "/" })}
            className="tap absolute left-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-border bg-background/60 backdrop-blur">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <span className="absolute bottom-3 right-3 rounded bg-background/80 px-1.5 py-0.5 text-[10px] font-medium">{dur}</span>
        </div>

        {/* Info */}
        <div className="px-4 pt-4">
          <h1 className="font-bn text-xl font-bold">{title} | বাংলা নাটক</h1>
          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{views} ভিউ</span>
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{dur}</span>
          </div>

          {/* Actions */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => { setLiked((v) => !v); toast.success(liked ? "লাইক সরানো হয়েছে" : "লাইক করা হয়েছে ❤️"); }}
              className={`tap flex flex-1 items-center justify-center gap-1.5 rounded-full border py-2.5 font-bn text-xs font-semibold ${liked ? "border-primary bg-primary/20 text-primary" : "border-border bg-card"}`}>
              <ThumbsUp className={`h-4 w-4 ${liked ? "fill-primary" : ""}`} />লাইক
            </button>
            <button
              onClick={() => { setSaved((v) => !v); toast.success(saved ? "তালিকা থেকে সরানো হয়েছে" : "আপনার তালিকায় যোগ হয়েছে"); }}
              className={`tap flex flex-1 items-center justify-center gap-1.5 rounded-full border py-2.5 font-bn text-xs font-semibold ${saved ? "border-primary bg-primary/20 text-primary" : "border-border bg-card"}`}>
              <Heart className={`h-4 w-4 ${saved ? "fill-primary" : ""}`} />সেভ
            </button>
            <button
              onClick={() => toast.success("শেয়ার লিংক কপি হয়েছে!")}
              className="tap flex flex-1 items-center justify-center gap-1.5 rounded-full border border-border bg-card py-2.5 font-bn text-xs font-semibold">
              <Share2 className="h-4 w-4" />শেয়ার
            </button>
            <button
              onClick={() => toast.info("ডাউনলোড শীঘ্রই আসছে")}
              className="tap flex flex-1 items-center justify-center gap-1.5 rounded-full border border-border bg-card py-2.5 font-bn text-xs font-semibold">
              <Download className="h-4 w-4" />সেভ
            </button>
          </div>

          {/* Description */}
          <div className="mt-5 rounded-2xl border border-border bg-card p-4">
            <p className="font-bn text-sm leading-relaxed text-muted-foreground">
              "{title}" — একটি হৃদয়স্পর্শী বাংলা নাটক। ভালোবাসা, অভিমান আর সম্পর্কের গল্প।
              NatokBuzz Original-এর বিশেষ প্রযোজনা।
            </p>
          </div>

          <button
            onClick={() => navigate({ to: "/" })}
            className="tap bg-gradient-primary mt-6 w-full rounded-full py-3 font-bn text-sm font-semibold shadow-glow">
            হোমে ফিরে যান
          </button>
        </div>
      </div>
    </div>
  );
}
