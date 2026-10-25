import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookPage } from "@/components/BookPage";
import { TopBar } from "@/components/Chrome";
import { neighbours, pageByNumber } from "@/lib/pages";
import { pad } from "@/lib/config";

export const revalidate = 60;

type Params = { params: Promise<{ number: string }> };

function parse(raw: string): number | null {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 && n < 10_000_000 ? n : null;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const n = parse((await params).number);
  if (!n) return {};
  const r = await pageByNumber(n);
  if (r.state !== "approved") return { title: `صفحة ${pad(n)}`, robots: { index: false } };
  return {
    title: `صفحة ${pad(n)}`,
    description: `«${r.page.text.replace(/\n/g, " ")}» — ${r.page.name}`,
    openGraph: { title: `صفحة ${pad(n)} — منّا`, description: `«${r.page.text.replace(/\n/g, " ")}» — ${r.page.name}` },
  };
}

const navBtn =
  "flex h-12 min-w-24 items-center justify-center gap-2 rounded-sm text-sm text-ink no-underline transition-colors hover:bg-dust";

export default async function ReadPage({ params }: Params) {
  const n = parse((await params).number);
  if (!n) notFound();
  const r = await pageByNumber(n);
  if (r.state === "missing") notFound();

  if (r.state === "in-review") {
    return (
      <div className="flex min-h-dvh flex-col bg-sand">
        <TopBar middle={<span className="font-serif text-lg text-ink">الكتاب عم ينكتب.</span>} />
        <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-6 px-8 text-center">
          <span dir="ltr" className="font-serif text-3xl tracking-[0.08em] text-stone">{pad(n)}</span>
          <p className="m-0 font-serif text-[26px] leading-[1.8]">هالصفحة لسا عم تنقرا.</p>
          <p className="m-0 text-sm leading-[1.8] text-earth">بس تخلص المراجعة، بتلاقيها هون بمكانها بالكتاب.</p>
          <Link href="/book" className="mt-4 flex h-12 items-center rounded-sm border border-ink px-8 text-[15px] text-ink no-underline hover:bg-ink hover:text-bone">
            اقرأ الكتاب
          </Link>
        </main>
      </div>
    );
  }

  const { prev, next } = await neighbours(n);

  return (
    <div className="flex min-h-dvh flex-col bg-sand">
      <TopBar
        middle={<h1 className="m-0 font-serif text-lg font-normal text-ink">الكتاب عم ينكتب.</h1>}
        end={
          <Link href="/write" className="flex min-h-11 items-center text-[13px] tracking-normal text-ink" dir="rtl">
            اكتب صفحة
          </Link>
        }
      />

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col px-6.5 pt-4.5">
        <BookPage key={n} {...r.page} className="anim-turn min-h-[min(560px,64dvh)] flex-1" />
      </main>

      <nav aria-label="تقليب الصفحات" className="mx-auto flex w-full max-w-xl flex-col gap-3.5 px-4.5 pb-8 pt-6.5">
        <div className="flex items-center justify-between">
          {prev ? (
            <Link href={`/page/${prev}`} aria-label={`الصفحة السابقة ${pad(prev)}`} className={navBtn}>
              <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 6l6 6-6 6" /></svg>
              <span dir="ltr">{pad(prev)}</span>
            </Link>
          ) : (
            <span className={`${navBtn} opacity-35`} aria-hidden="true">—</span>
          )}
          <span dir="ltr" className="text-[13px] font-semibold tracking-[0.14em]">{pad(n)}</span>
          {next ? (
            <Link href={`/page/${next}`} aria-label={`الصفحة التالية ${pad(next)}`} className={navBtn}>
              <span dir="ltr">{pad(next)}</span>
              <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15 6l-6 6 6 6" /></svg>
            </Link>
          ) : (
            <span className={`${navBtn} opacity-35`} aria-hidden="true">—</span>
          )}
        </div>
        <Link
          href={`/book/random?from=${n}`}
          prefetch={false}
          className="flex h-12 items-center justify-center rounded-sm border border-ink text-[15px] text-ink no-underline transition-colors hover:bg-ink hover:text-bone"
        >
          صفحة عشوائية
        </Link>
      </nav>
    </div>
  );
}
