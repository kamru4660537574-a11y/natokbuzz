// Bengali number/date formatting helpers (client-safe)

export function bnDigits(s: string | number): string {
  const map: Record<string, string> = {
    "0": "০", "1": "১", "2": "২", "3": "৩", "4": "৪",
    "5": "৫", "6": "৬", "7": "৭", "8": "৮", "9": "৯",
  };
  return String(s).replace(/[0-9]/g, (d) => map[d] ?? d);
}

export function formatViews(n: number): string {
  if (n >= 1_000_000) return `${bnDigits((n / 1_000_000).toFixed(1).replace(/\.0$/, ""))}M`;
  if (n >= 1_000) return `${bnDigits(Math.round(n / 1_000))}K`;
  return bnDigits(n);
}

export function bnAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diff = Math.max(0, Date.now() - then);
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "এইমাত্র";
  if (mins < 60) return `${bnDigits(mins)} মিনিট আগে`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${bnDigits(hrs)} ঘণ্টা আগে`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${bnDigits(days)} দিন আগে`;
  const weeks = Math.floor(days / 7);
  if (days < 30) return `${bnDigits(weeks)} সপ্তাহ আগে`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${bnDigits(months)} মাস আগে`;
  return `${bnDigits(Math.floor(months / 12))} বছর আগে`;
}

export const categoryLabels: Record<string, string> = {
  natok: "বাংলা নাটক",
  short: "শর্টফিল্ম",
  music: "মিউজিক",
  comedy: "কমেডি",
};
