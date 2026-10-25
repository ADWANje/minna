import Link from "next/link";
import { TopBar } from "@/components/Chrome";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col bg-bone">
      <TopBar />
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-6 px-8 text-center">
        <p className="m-0 font-serif text-[28px] leading-[1.8]">هالصفحة مش بالكتاب.</p>
        <Link href="/book" className="flex h-12 items-center rounded-sm border border-ink px-8 text-[15px] text-ink no-underline hover:bg-ink hover:text-bone">
          اقرأ الكتاب
        </Link>
      </main>
    </div>
  );
}
