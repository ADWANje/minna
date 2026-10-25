import Link from "next/link";
import { SITE } from "@/lib/config";

export function Wordmark({ className = "" }: { className?: string }) {
  return <span className={`font-serif font-bold ${className}`}>{SITE.name}</span>;
}

export function TopBar({ middle, end }: { middle?: React.ReactNode; end?: React.ReactNode }) {
  return (
    <header className="mx-auto flex h-16 w-full max-w-xl items-center justify-between px-5">
      <Link href="/" className="flex min-h-11 items-center text-2xl no-underline" aria-label={`${SITE.name} — الصفحة الرئيسية`}>
        <Wordmark />
      </Link>
      <div className="text-sm text-stone">{middle}</div>
      <div className="flex min-w-11 justify-end text-[11px] tracking-[0.16em] text-stone" dir="ltr">
        {end ?? SITE.volume}
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mx-auto flex w-full max-w-xl flex-col gap-4 px-7 pb-10 pt-12 text-sm text-stone">
      <span className="font-medium text-ink">
        <Wordmark className="text-lg" /> · {SITE.tagline} · {SITE.brand}
      </span>
      <nav aria-label="روابط المشروع" className="flex flex-wrap gap-5">
        <Link href="/about" className="text-earth underline-offset-4 hover:underline">عن المشروع</Link>
        <Link href="/about#privacy" className="text-earth underline-offset-4 hover:underline">الخصوصية والشروط</Link>
        <Link href="/about#remove" className="text-earth underline-offset-4 hover:underline">طلب حذف صفحة</Link>
      </nav>
    </footer>
  );
}
