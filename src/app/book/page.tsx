import Link from "next/link";
import { redirect } from "next/navigation";
import { TopBar } from "@/components/Chrome";
import { latestApproved } from "@/lib/pages";

export const dynamic = "force-dynamic";

export default async function Book() {
  const [latest] = await latestApproved(1);
  if (latest) redirect(`/page/${latest.number}`);

  return (
    <div className="flex min-h-dvh flex-col bg-sand">
      <TopBar middle={<h1 className="m-0 font-serif text-lg font-normal text-ink">الكتاب عم ينكتب.</h1>} />
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-6 px-8 text-center">
        <p className="m-0 font-serif text-[26px] leading-[1.8]">الصفحات الأولى عم تنقرا هلأ.</p>
        <Link href="/write" className="flex h-12 items-center rounded-sm bg-night px-8 text-[15px] text-bone no-underline">
          اترك جملتك
        </Link>
      </main>
    </div>
  );
}
