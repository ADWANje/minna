// Everything a non-developer may want to change lives here.

export const SITE = {
  name: "منّا",
  volume: "VOL. 01",
  tagline: "كتاب بتكتبوه إنتو",
  brand: "مشروع من جبال",
  question: "في جملة ضلّت معك؟",
  description:
    "كل واحد فينا في جملة ضلّت معه. منّا كتاب بتكتبوه إنتو — جملة وحدة من كل شخص، بتصير صفحة بالكتاب. مشروع من جبال.",
};

export const LIMITS = {
  textMax: 200,
  nameMax: 40,
  locationMax: 40,
  sourceMax: 120,
  // submissions allowed per visitor
  perHour: 3,
  perDay: 8,
  // a human needs at least this long to read and write
  minFillMs: 3000,
};

export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "";
export const COUNTER_MIN = Number(process.env.NEXT_PUBLIC_COUNTER_MIN ?? 50);

export type SourceType = "self" | "known" | "published" | "unknown";
export type Status = "pending" | "approved" | "rejected" | "flagged";

export const SOURCE_LABELS: Record<SourceType, string> = {
  self: "أنا",
  known: "شخص بعرفه",
  published: "كتاب / كاتب",
  unknown: "ما بعرف",
};

export const SOURCE_ADMIN_LABELS: Record<SourceType, string> = {
  self: "كلمات أصلية",
  known: "شخص بعرفه",
  published: "اقتباس منشور",
  unknown: "مصدر مجهول",
};

export const STATUS_LABELS: Record<Status, string> = {
  pending: "بانتظار المراجعة",
  approved: "منشورة",
  rejected: "مرفوضة",
  flagged: "معلّمة",
};

export const ANONYMOUS_NAME = "مجهول";

export function pad(n: number) {
  return String(n).padStart(5, "0");
}
