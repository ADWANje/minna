"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BASE_PATH, LIMITS, SOURCE_LABELS, ANONYMOUS_NAME, SITE, pad, type SourceType } from "@/lib/config";
import { BookPage } from "./BookPage";
import { ShareSheet } from "./ShareSheet";

type Done = {
  number: number;
  removePath: string;
  text: string;
  name: string;
  location: string | null;
  sourceName: string | null;
};

const SOURCES = Object.entries(SOURCE_LABELS) as [SourceType, string][];

const inputCls =
  "h-12 border border-line bg-paper px-3.5 text-[15px] text-ink outline-none transition-colors focus:border-ink";

export function WriteFlow() {
  const [text, setText] = useState("");
  const [source, setSource] = useState<SourceType>("self");
  const [sourceName, setSourceName] = useState("");
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState(""); // honeypot
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<Done | null>(null);
  const startedAt = useRef<number>(0);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  const len = text.length;
  const ready = text.trim().length > 0 && consent && (anonymous || name.trim().length > 0) && !sending;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!ready) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch(`${BASE_PATH}/api/contributions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          sourceType: source,
          sourceName: source === "published" ? sourceName : null,
          displayName: anonymous ? null : name,
          location: anonymous ? null : location,
          anonymous,
          consent,
          website,
          startedAt: startedAt.current,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error || "ما زبطت هالمرة. جرّب كمان شوي.");
        return;
      }
      setDone({
        number: json.number,
        removePath: json.removePath,
        text: text.trim(),
        name: anonymous || !name.trim() ? ANONYMOUS_NAME : name.trim(),
        location: anonymous ? null : location.trim() || null,
        sourceName: source === "published" ? sourceName.trim() || null : null,
      });
      window.scrollTo({ top: 0 });
    } catch {
      setError("في مشكلة بالاتصال. تأكد من النت وجرّب كمان مرة.");
    } finally {
      setSending(false);
    }
  }

  if (done) return <Success done={done} />;

  return (
    <div className="min-h-dvh bg-bone">
      <header className="mx-auto flex h-16 max-w-xl items-center justify-between border-b border-dust px-5">
        <Link href="/" aria-label="رجوع للصفحة الرئيسية" className="flex h-11 w-11 items-center justify-center text-ink">
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </Link>
        <span className="text-[13px] text-stone">صفحة جديدة</span>
        <span dir="ltr" className="w-11 text-left text-[11px] tracking-[0.16em] text-stone">VOL.01</span>
      </header>

      <form onSubmit={submit} noValidate className="mx-auto flex max-w-xl flex-col gap-11 px-6 pb-12 pt-10">
        {/* honeypot — hidden from people and screen readers */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label>
            Website
            <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
          </label>
        </div>

        <section className="flex flex-col gap-4.5">
          <label htmlFor="sentence" className="font-serif text-[32px] font-bold leading-[1.35]">
            شو الجملة اللي ضلّت معك؟
          </label>
          <div className="relative border border-line bg-paper px-4.5 pb-9 pt-4.5">
            <textarea
              id="sentence"
              rows={5}
              maxLength={LIMITS.textMax}
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, LIMITS.textMax))}
              placeholder="اكتبها متل ما بتتذكرها..."
              className="ruled w-full resize-none border-0 bg-transparent font-serif text-2xl leading-[1.75] text-ink outline-none placeholder:text-mist"
            />
            <span dir="ltr" aria-live="polite" className={`absolute bottom-2.5 left-4 text-xs ${len > 180 ? "text-rust" : "text-stone"}`}>
              {len} / {LIMITS.textMax}
            </span>
          </div>
        </section>

        <fieldset className="m-0 flex flex-col gap-4 border-0 p-0">
          <legend className="mb-4 p-0 font-serif text-2xl">مين قالها؟</legend>
          <div className="grid grid-cols-2 gap-2.5">
            {SOURCES.map(([id, label]) => (
              <button
                key={id}
                type="button"
                aria-pressed={source === id}
                onClick={() => setSource(id)}
                className={`min-h-13 cursor-pointer rounded-sm border px-3 text-[15px] transition-colors ${
                  source === id ? "border-night bg-night text-bone" : "border-contour bg-transparent text-ink hover:border-ink"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {source === "published" ? (
            <div className="anim-fade flex flex-col gap-2 pt-1.5">
              <label htmlFor="src" className="text-sm text-earth">
                اسم الكتاب أو الكاتب <span className="text-stone">(اختياري)</span>
              </label>
              <input
                id="src"
                maxLength={LIMITS.sourceMax}
                value={sourceName}
                onChange={(e) => setSourceName(e.target.value)}
                placeholder="مثلًا: اسم الكاتب، عنوان الكتاب"
                className={inputCls}
              />
            </div>
          ) : null}
        </fieldset>

        <section className="flex flex-col gap-4">
          <h2 className="m-0 font-serif text-2xl font-normal">كيف بدك يظهر اسمك؟</h2>
          {!anonymous ? (
            <div className="anim-fade flex flex-col gap-3">
              <label htmlFor="nm" className="text-sm text-earth">الاسم اللي بيظهر بالصفحة</label>
              <input id="nm" maxLength={LIMITS.nameMax} value={name} onChange={(e) => setName(e.target.value)} autoComplete="given-name" className={inputCls} />
              <label htmlFor="ct" className="text-sm text-earth">
                المدينة أو البلد <span className="text-stone">(اختياري)</span>
              </label>
              <input id="ct" maxLength={LIMITS.locationMax} value={location} onChange={(e) => setLocation(e.target.value)} className={inputCls} />
            </div>
          ) : null}
          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-[15px]">
            <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} className="m-0 h-5 w-5 accent-ink" />
            <span>خلّيها باسم «{ANONYMOUS_NAME}»</span>
          </label>
        </section>

        <div aria-hidden="true" className="h-px bg-dust" />

        <section className="flex flex-col gap-5.5">
          <label className="flex cursor-pointer items-start gap-3 text-sm leading-[1.8] text-[#2E2B26]">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="m-0 mt-1 h-5 w-5 flex-none accent-ink" />
            <span>
              بوافق إن جبال تستخدم وتنشر مساهمتي ضمن هذا المشروع ومواده الرقمية أو المطبوعة.{" "}
              <Link href="/about#privacy" target="_blank" className="text-ink underline underline-offset-4">
                الشروط والخصوصية
              </Link>
            </span>
          </label>

          <p role="alert" aria-live="assertive" className="m-0 min-h-6 text-center text-sm text-rust">{error}</p>

          <button
            type="submit"
            disabled={!ready}
            className="h-14 cursor-pointer rounded-sm border-0 bg-night text-[17px] font-medium text-bone transition-colors hover:bg-[#2E2B26] disabled:cursor-not-allowed disabled:bg-dust disabled:text-stone"
          >
            {sending ? "عم تنضاف..." : "أضف صفحتك"}
          </button>
          <p className="m-0 text-center text-[13px] leading-[1.8] text-stone">
            صفحتك بتنقرا قبل ما تنزل بالكتاب.
            <br />
            ما في حساب، ولا بنطلب إيميل.
          </p>
        </section>
      </form>
    </div>
  );
}

function Success({ done }: { done: Done }) {
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copy() {
    const url = `${window.location.origin}${done.removePath}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      window.prompt("انسخ الرابط واحتفظ فيه:", url);
    }
  }

  return (
    <main className="min-h-dvh bg-bone">
      <header className="mx-auto flex h-16 max-w-xl items-center justify-between px-6">
        <Link href="/" className="font-serif text-2xl font-bold no-underline">{SITE.name}</Link>
        <span dir="ltr" className="text-[11px] tracking-[0.16em] text-stone">{SITE.volume}</span>
      </header>

      <div className="mx-auto flex max-w-xl flex-col">
        <section className="flex flex-col gap-1.5 px-7 pt-12 text-center">
          <h1 className="anim-ink m-0 font-serif text-[64px] font-bold leading-[1.2]">وصلت.</h1>
          <p className="anim-ink-2 m-0 font-serif text-[26px] text-earth">صارت إلك صفحة.</p>
        </section>

        <div className="px-9 pb-5 pt-11">
          <BookPage
            number={done.number}
            text={done.text}
            name={done.name}
            location={done.location}
            sourceName={done.sourceName}
            footer
            className="anim-lift min-h-[430px]"
          />
        </div>

        <div className="anim-late flex flex-col gap-5.5 px-7 pt-6">
          <p role="status" className="m-0 flex items-center justify-center gap-2.5 text-sm text-earth">
            <span aria-hidden="true" className="h-[7px] w-[7px] rounded-full bg-amber" />
            صفحتك رح تظهر بالكتاب بعد المراجعة.
          </p>

          <button
            type="button"
            onClick={() => setShareOpen((v) => !v)}
            aria-expanded={shareOpen}
            className="h-14 cursor-pointer rounded-sm border-0 bg-night text-[17px] font-medium text-bone transition-colors hover:bg-[#2E2B26]"
          >
            شارك صفحتي
          </button>

          {shareOpen ? (
            <ShareSheet data={{ number: done.number, text: done.text, name: done.name, location: done.location }} />
          ) : null}

          <Link
            href="/book"
            className="flex h-13 items-center justify-center rounded-sm border border-ink text-[15px] text-ink no-underline transition-colors hover:bg-ink hover:text-bone"
          >
            اقرأ الكتاب
          </Link>
        </div>

        <footer className="mt-12 flex flex-col gap-2.5 border-t border-dust px-7 pb-10 pt-6 text-[13px] leading-[1.8] text-earth">
          <span className="font-medium text-ink">احتفظ بهالرابط</span>
          <span>
            إذا غيّرت رأيك بأي وقت، من هالرابط بتقدر تحذف صفحة رقم <span dir="ltr">{pad(done.number)}</span>. ما حدا غيرك عنده ياه، وما بنقدر نرجّعه.
          </span>
          <button
            type="button"
            onClick={copy}
            className="min-h-11 cursor-pointer self-start border border-dashed border-contour bg-transparent px-4 text-[13px] text-ink"
          >
            {copied ? "انسخ الرابط ✓" : "انسخ رابط الحذف الخاص"}
          </button>
        </footer>
      </div>
    </main>
  );
}
