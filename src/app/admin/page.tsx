import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/supabase";
import { saveEdit, setStatus, logout } from "./actions";
import { BASE_PATH, pad, SITE, SOURCE_ADMIN_LABELS, STATUS_LABELS, ANONYMOUS_NAME, type SourceType, type Status } from "@/lib/config";

export const metadata: Metadata = { title: "المراجعة", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type Row = {
  id: string;
  public_number: number;
  text: string;
  source_type: SourceType;
  source_name: string | null;
  display_name: string | null;
  anonymous: boolean;
  location_text: string | null;
  status: Status;
  auto_flags: string[];
  needs_rights_review: boolean;
  moderation_note: string | null;
  consent: boolean;
  consent_at: string;
  created_at: string;
  approved_at: string | null;
};

const TABS: { id: Status | "all"; label: string }[] = [
  { id: "pending", label: STATUS_LABELS.pending },
  { id: "flagged", label: STATUS_LABELS.flagged },
  { id: "approved", label: STATUS_LABELS.approved },
  { id: "rejected", label: STATUS_LABELS.rejected },
  { id: "all", label: "الكل" },
];

const SOURCE_COLOR: Record<SourceType, string> = {
  self: "#2F4A3A",
  known: "#7A8B6E",
  published: "#A0522D",
  unknown: "#C9BFA8",
};

const STATUS_STYLE: Record<Status, string> = {
  pending: "bg-[#F1E4CF] text-[#6E4A1E]",
  approved: "bg-[#DDE5D8] text-pine",
  rejected: "bg-[#ECE7DE] text-earth",
  flagged: "bg-[#F2D9CC] text-[#7A3E20]",
};

const fmt = new Intl.DateTimeFormat("ar", {
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Jerusalem",
});

type SP = Promise<{ status?: string; q?: string; edit?: string }>;

export default async function Admin({ searchParams }: { searchParams: SP }) {
  await requireAdmin();
  const sp = await searchParams;
  const tab = (TABS.find((t) => t.id === sp.status)?.id ?? "pending") as Status | "all";
  const q = (sp.q || "").trim();

  const { data, error } = await db()
    .from("contributions")
    .select(
      "id, public_number, text, source_type, source_name, display_name, anonymous, location_text, status, auto_flags, needs_rights_review, moderation_note, consent, consent_at, created_at, approved_at",
    )
    .order("public_number", { ascending: false })
    .limit(2000);
  if (error) throw error;
  const all = (data ?? []) as Row[];

  const counts = Object.fromEntries(TABS.map((t) => [t.id, t.id === "all" ? all.length : all.filter((r) => r.status === t.id).length]));
  const qn = q.replace(/^#/, "");
  const rows = all
    .filter((r) => tab === "all" || r.status === tab)
    .filter(
      (r) =>
        !qn ||
        [r.text, r.display_name, r.source_name, r.location_text, pad(r.public_number), r.moderation_note]
          .filter(Boolean)
          .join(" ")
          .includes(qn),
    );

  const here = `/admin?status=${tab}${q ? `&q=${encodeURIComponent(q)}` : ""}`;
  const btn = "min-h-10 cursor-pointer rounded-sm border border-contour bg-transparent px-3.5 text-[13px] text-ink hover:bg-sand";
  const btnDark = "min-h-10 cursor-pointer rounded-sm border border-night bg-night px-3.5 text-[13px] text-bone hover:bg-[#2E2B26]";

  return (
    <div className="min-h-dvh bg-bone">
      <header className="border-b border-dust px-[clamp(16px,3vw,40px)]">
        <div className="mx-auto flex min-h-17 max-w-7xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-baseline gap-3.5">
            <Link href="/" className="font-serif text-2xl font-bold text-ink no-underline">{SITE.name}</Link>
            <span className="text-sm text-stone">مراجعة الصفحات · {SITE.brand}</span>
          </div>
          <form action={logout}>
            <button type="submit" className={btn}>خروج</button>
          </form>
        </div>
      </header>

      <main className="mx-auto flex max-w-7xl flex-col gap-6 px-[clamp(16px,3vw,40px)] pb-16 pt-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="m-0 font-serif text-[34px] font-bold">الصفحات</h1>
          <div className="flex flex-wrap items-center gap-2.5">
            <form className="flex gap-2" action="" role="search">
              <input type="hidden" name="status" value={tab} />
              <label htmlFor="q" className="sr-only">بحث</label>
              <input
                id="q"
                name="q"
                type="search"
                defaultValue={q}
                placeholder="ابحث بالنص، الاسم، المصدر، الرقم..."
                className="h-10.5 w-[min(320px,70vw)] border border-line bg-paper px-3.5 text-sm outline-none focus:border-ink"
              />
              <button type="submit" className={btn}>بحث</button>
            </form>
            <a href={`${BASE_PATH}/admin/export`} className={`${btn} flex items-center no-underline`} download>
              تصدير المنشورة CSV
            </a>
          </div>
        </div>

        <nav aria-label="تصفية حسب الحالة" className="flex flex-wrap gap-2 border-b border-dust pb-3.5">
          {TABS.map((t) => (
            <Link
              key={t.id}
              href={`/admin?status=${t.id}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              aria-current={tab === t.id ? "page" : undefined}
              className={`flex min-h-10 items-center gap-1.5 rounded-sm px-3.5 text-sm no-underline ${
                tab === t.id ? "bg-night text-bone" : "text-ink hover:bg-sand"
              }`}
            >
              {t.label} <span className="opacity-70">{counts[t.id]}</span>
            </Link>
          ))}
        </nav>

        <div className="flex flex-wrap gap-4.5 text-xs text-earth">
          {(Object.keys(SOURCE_ADMIN_LABELS) as SourceType[]).map((s) => (
            <span key={s} className="flex items-center gap-1.5">
              <span aria-hidden="true" className="h-2.5 w-2.5" style={{ background: SOURCE_COLOR[s] }} />
              {SOURCE_ADMIN_LABELS[s]}
              {s === "published" ? " — يحتاج مراجعة حقوق قبل الطباعة" : ""}
            </span>
          ))}
        </div>

        {rows.length === 0 ? (
          <p className="m-0 py-12 text-center font-serif text-[22px] text-stone">ما في صفحات هون.</p>
        ) : (
          <ul className="m-0 flex list-none flex-col p-0">
            {rows.map((r) => {
              const editing = sp.edit === r.id;
              return (
                <li
                  key={r.id}
                  className="flex flex-wrap gap-x-7 gap-y-5 border-b border-dust py-5.5 ps-4.5"
                  style={{ borderInlineStart: `3px solid ${SOURCE_COLOR[r.source_type]}` }}
                >
                  <div className="flex min-w-0 flex-[999_1_420px] flex-col gap-2.5">
                    <div className="flex flex-wrap items-center gap-2.5 text-xs text-stone">
                      <Link href={`/page/${r.public_number}`} dir="ltr" className="font-semibold tracking-[0.08em] text-ink no-underline">
                        #{pad(r.public_number)}
                      </Link>
                      <span>{fmt.format(new Date(r.created_at))}</span>
                      <span className={`px-2 py-0.5 ${STATUS_STYLE[r.status]}`}>{STATUS_LABELS[r.status]}</span>
                      {r.needs_rights_review ? (
                        <span className="border border-rust px-2 py-0.5 text-[#7A3E20]">حقوق: مراجعة قبل الطباعة</span>
                      ) : null}
                      {r.auto_flags
                        .filter((f) => f !== "اقتباس منشور")
                        .map((f) => (
                          <span key={f} className="border border-rust px-2 py-0.5 text-[#7A3E20]">{f}</span>
                        ))}
                    </div>

                    {editing ? (
                      <form action={saveEdit} className="flex flex-col gap-2">
                        <input type="hidden" name="id" value={r.id} />
                        <input type="hidden" name="back" value={here} />
                        <label htmlFor={`t-${r.id}`} className="text-xs text-stone">
                          تعديل التنسيق فقط (مسافات، علامات ترقيم) — لا تغيّر المعنى
                        </label>
                        <textarea
                          id={`t-${r.id}`}
                          name="text"
                          defaultValue={r.text}
                          maxLength={200}
                          rows={3}
                          className="resize-y border border-line bg-paper px-3 py-2.5 font-serif text-[21px] leading-[1.6] outline-none focus:border-ink"
                        />
                        <label htmlFor={`n-${r.id}`} className="text-xs text-stone">ملاحظة داخلية (ما بتظهر لحدا)</label>
                        <input
                          id={`n-${r.id}`}
                          name="note"
                          defaultValue={r.moderation_note ?? ""}
                          className="h-10 border border-line bg-paper px-3 text-sm outline-none focus:border-ink"
                        />
                        <div className="flex gap-2">
                          <button type="submit" className={btnDark}>حفظ</button>
                          <Link href={here} className={`${btn} flex items-center no-underline`}>إلغاء</Link>
                        </div>
                      </form>
                    ) : (
                      <p className="m-0 whitespace-pre-line font-serif text-[23px] leading-[1.7]">«{r.text}»</p>
                    )}

                    <dl className="m-0 flex flex-wrap gap-x-5.5 gap-y-1.5 text-[13px]">
                      <div className="flex gap-1.5">
                        <dt className="text-stone">المصدر:</dt>
                        <dd className="m-0 font-medium">
                          {SOURCE_ADMIN_LABELS[r.source_type]}
                          {r.source_name ? ` · ${r.source_name}` : ""}
                        </dd>
                      </div>
                      <div className="flex gap-1.5">
                        <dt className="text-stone">الاسم:</dt>
                        <dd className="m-0">{r.anonymous ? ANONYMOUS_NAME : r.display_name}</dd>
                      </div>
                      <div className="flex gap-1.5">
                        <dt className="text-stone">المكان:</dt>
                        <dd className="m-0">{r.location_text || "—"}</dd>
                      </div>
                      <div className="flex gap-1.5">
                        <dt className="text-stone">الموافقة:</dt>
                        <dd className="m-0">{r.consent ? `نعم · ${fmt.format(new Date(r.consent_at))}` : "لا"}</dd>
                      </div>
                      {r.moderation_note && !editing ? (
                        <div className="flex gap-1.5">
                          <dt className="text-stone">ملاحظة:</dt>
                          <dd className="m-0">{r.moderation_note}</dd>
                        </div>
                      ) : null}
                    </dl>
                  </div>

                  <div className="flex flex-[1_1_240px] flex-wrap content-start gap-2">
                    {(
                      [
                        ["approved", "موافقة", btnDark],
                        ["rejected", "رفض", btn],
                        ["flagged", "تعليم", btn],
                        ["pending", "إرجاع للانتظار", btn],
                      ] as const
                    )
                      .filter(([s]) => s !== r.status)
                      .map(([s, label, cls]) => (
                        <form key={s} action={setStatus}>
                          <input type="hidden" name="id" value={r.id} />
                          <input type="hidden" name="status" value={s} />
                          <button type="submit" className={cls}>{label}</button>
                        </form>
                      ))}
                    {!editing ? (
                      <Link href={`${here}&edit=${r.id}`} className={`${btn} flex items-center no-underline`}>تعديل</Link>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
