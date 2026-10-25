import Link from "next/link";
import { HeroContours } from "@/components/Contours";
import { BookPage } from "@/components/BookPage";
import { Footer, Wordmark } from "@/components/Chrome";
import { countApproved, latestApproved } from "@/lib/pages";
import { COUNTER_MIN, SITE } from "@/lib/config";

export const revalidate = 60;

export default async function Home() {
  // If the database is briefly unreachable, still show the page (it refreshes within a minute).
  const [count, pages] = await Promise.all([countApproved(), latestApproved(4)]).catch(
    () => [0, []] as [number, Awaited<ReturnType<typeof latestApproved>>],
  );
  const showCounter = count >= COUNTER_MIN;

  return (
    <main>
      <section className="relative flex min-h-[100svh] flex-col justify-between overflow-hidden bg-night px-6 py-6 text-sand">
        <HeroContours />
        <header className="relative mx-auto flex w-full max-w-xl items-center justify-between text-xs tracking-[0.08em]">
          <Wordmark className="text-[26px] tracking-normal text-bone" />
          <span dir="ltr" className="text-mist">{SITE.volume}</span>
        </header>

        <div className="relative mx-auto flex w-full max-w-xl flex-col gap-7 pb-24">
          <h1 className="anim-rise m-0 font-serif text-[54px] font-bold leading-[1.15] text-bone sm:text-7xl">
            في جملة
            <br />
            ضلّت معك؟
          </h1>
          <p className="anim-rise-2 m-0 whitespace-pre-line text-[17px] font-light leading-[1.9] text-[#D9D2C3]">
            {"جملة سمعتها من شخص،\nقرأتها بمكان،\nأو حكيتها لنفسك...\nوما نسيتها."}
          </p>
          <div className="anim-rise-3 flex flex-col gap-4">
            <Link
              href="/write"
              className="flex h-14 items-center justify-center rounded-sm bg-bone text-[17px] font-medium text-night no-underline transition-colors hover:bg-dust"
            >
              اترك جملتك
            </Link>
            {showCounter ? (
              <p className="m-0 text-center text-[13px] text-mist">
                <span className="font-medium text-bone">{count.toLocaleString("en-US")}</span> شخص كتبوا صفحة حتى الآن.
              </p>
            ) : (
              <p className="m-0 text-center text-[13px] text-mist">أول صفحات الكتاب عم تنكتب هلأ.</p>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto flex max-w-xl flex-col gap-5 px-7 pb-14 pt-18">
        <span dir="ltr" className="text-right text-[11px] tracking-[0.2em] text-stone">— 01</span>
        <p className="m-0 whitespace-pre-line font-serif text-[30px] leading-[1.6]">
          {"كل واحد فينا في جملة ضلّت معه.\nبدنا نجمعهم بكتاب واحد."}
        </p>
        <p className="m-0 text-base leading-[1.9] text-earth">
          كتاب ما بنكتبه إحنا... بتكتبوه إنتو. كل جملة بتوصلنا، بنقراها بإيدينا، وبتصير صفحة إلها رقم بكتاب «{SITE.name}»، أول
          كتاب من جبال.
        </p>
      </section>

      <div aria-hidden="true" className="mx-auto max-w-xl px-7">
        <div className="h-px bg-contour" />
      </div>

      <section className="mx-auto flex max-w-xl flex-col gap-7 px-7 py-14">
        <span dir="ltr" className="text-right text-[11px] tracking-[0.2em] text-stone">— 02</span>
        <h2 className="m-0 font-serif text-[26px] font-normal">كيف بتصير صفحة</h2>
        <ol className="m-0 flex list-none flex-col gap-5 p-0">
          {[
            "بتكتب جملة وحدة. ما بدنا حساب ولا إيميل.",
            "بنقراها بهدوء قبل ما تنزل بالكتاب.",
            "بتصير صفحة إلها رقم، ممكن تنطبع يومًا ما.",
          ].map((line, i) => (
            <li key={i} className="flex items-baseline gap-4">
              <span className="min-w-5 font-serif text-[22px] text-stone">{["١", "٢", "٣"][i]}</span>
              <span className="text-base leading-[1.8]">{line}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-sand py-16">
        <div className="mx-auto flex max-w-xl flex-col gap-2.5 px-7">
          <span dir="ltr" className="text-right text-[11px] tracking-[0.2em] text-stone">— 03</span>
          <h2 className="m-0 font-serif text-[34px] font-bold">الكتاب عم ينكتب.</h2>
        </div>

        {pages.length > 0 ? (
          <>
            <div className="mx-auto mt-7 flex max-w-xl snap-x gap-4 overflow-x-auto px-7 pb-3 pt-1">
              {pages.map((p) => (
                <Link key={p.number} href={`/page/${p.number}`} className="shrink-0 snap-start no-underline">
                  <BookPage {...p} size="sm" className="h-[320px] w-[240px]" />
                </Link>
              ))}
            </div>
            <div className="mx-auto mt-7 max-w-xl px-7">
              <Link
                href="/book/random"
                prefetch={false}
                className="flex h-13 items-center justify-center rounded-sm border border-ink text-[15px] font-medium text-ink no-underline transition-colors hover:bg-ink hover:text-bone"
              >
                افتح صفحة عشوائية
              </Link>
            </div>
          </>
        ) : (
          <div className="mx-auto mt-7 flex max-w-xl flex-col gap-6 px-7">
            <p className="m-0 font-serif text-[22px] leading-[1.8] text-earth">
              الصفحات الأولى عم تنقرا هلأ. يمكن صفحتك تكون من أوّلها.
            </p>
            <Link
              href="/write"
              className="flex h-13 items-center justify-center rounded-sm border border-ink text-[15px] font-medium text-ink no-underline transition-colors hover:bg-ink hover:text-bone"
            >
              اترك جملتك
            </Link>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
