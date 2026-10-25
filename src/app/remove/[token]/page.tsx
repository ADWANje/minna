import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { TopBar } from "@/components/Chrome";
import { db } from "@/lib/supabase";
import { sha256 } from "@/lib/security";
import { pad } from "@/lib/config";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "حذف صفحة", robots: { index: false, follow: false } };

type Params = { params: Promise<{ token: string }>; searchParams: Promise<{ done?: string }> };

async function removePage(formData: FormData) {
  "use server";
  const token = String(formData.get("token") || "");
  if (!/^[A-Za-z0-9_-]{20,64}$/.test(token)) return;
  const { data } = await db()
    .from("contributions")
    .delete()
    .eq("delete_token_hash", sha256(token))
    .select("public_number")
    .maybeSingle();
  if (data) {
    revalidatePath("/");
    revalidatePath(`/page/${data.public_number}`);
  }
  redirect(`/remove/${token}?done=1`);
}

export default async function RemovePage({ params, searchParams }: Params) {
  const { token } = await params;
  const { done } = await searchParams;

  if (done) {
    return (
      <Shell>
        <p className="m-0 font-serif text-[30px]">انحذفت.</p>
        <p className="m-0 text-sm leading-[1.8] text-earth">صفحتك ما عادت بالكتاب. شكرًا إنك كنت جزء منه، ولو لفترة.</p>
        <Link href="/" className="mt-2 text-sm text-ink underline underline-offset-4">الرجوع للبداية</Link>
      </Shell>
    );
  }

  if (!/^[A-Za-z0-9_-]{20,64}$/.test(token)) notFound();
  const { data } = await db()
    .from("contributions")
    .select("public_number, text")
    .eq("delete_token_hash", sha256(token))
    .maybeSingle();
  if (!data) notFound();

  return (
    <Shell>
      <span dir="ltr" className="font-serif text-2xl tracking-[0.08em] text-stone">{pad(data.public_number)}</span>
      <p className="m-0 whitespace-pre-line font-serif text-[24px] leading-[1.8]">«{data.text}»</p>
      <p className="m-0 text-sm leading-[1.8] text-earth">بدك تحذف هالصفحة من الكتاب؟ ما في رجعة بعد الحذف.</p>
      <form action={removePage} className="flex w-full flex-col gap-3">
        <input type="hidden" name="token" value={token} />
        <button type="submit" className="h-13 cursor-pointer rounded-sm border-0 bg-night text-[15px] text-bone">
          احذف صفحتي
        </button>
        <Link href="/" className="flex h-12 items-center justify-center text-sm text-ink">لا، خلّيها</Link>
      </form>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-bone">
      <TopBar />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-5 px-8 text-center">{children}</main>
    </div>
  );
}
