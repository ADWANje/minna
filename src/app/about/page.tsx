import type { Metadata } from "next";
import Link from "next/link";
import { Footer, TopBar } from "@/components/Chrome";
import { CONTACT_EMAIL, SITE } from "@/lib/config";

export const metadata: Metadata = {
  title: "عن المشروع والخصوصية",
  description: "شو هو منّا، كيف بنتعامل مع صفحاتكم، وكيف بتحذف صفحتك.",
};

function H({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="m-0 scroll-mt-20 pt-6 font-serif text-[26px] font-bold">
      {children}
    </h2>
  );
}

export default function About() {
  return (
    <div className="min-h-dvh bg-bone">
      <TopBar />
      <main className="mx-auto flex max-w-xl flex-col gap-5 px-7 pb-8 pt-8 text-base leading-[1.95] text-earth">
        <h1 className="m-0 font-serif text-[40px] font-bold leading-[1.3] text-ink">عن {SITE.name}</h1>
        <p className="m-0">
          «{SITE.name}» كتاب بتكتبوه إنتو. كل شخص بيترك جملة وحدة ضلّت معه، وكل جملة بتصير صفحة إلها رقم. الكتاب بيكبر قدام الكل، وممكن
          يومًا ما يصير كتاب مطبوع. هو {SITE.brand}، بس مش متجر: ما في بيع هون، في صفحات بس.
        </p>

        <H>كيف بتنزل الصفحة</H>
        <p className="m-0">
          ما في إشي بينزل لحاله. كل جملة بتوصلنا بنقراها إحنا بإيدينا قبل ما تنزل بالكتاب. ممكن نصلّح التنسيق البسيط (مسافة، علامة ترقيم)، بس ما
          بنغيّر معنى كلامك. وما بننشر إشي فيه إساءة لحدا، أو معلومات شخصية، أو روابط، أو إعلانات.
        </p>

        <H id="privacy">الخصوصية</H>
        <ul className="m-0 flex list-disc flex-col gap-2 ps-5">
          <li>ما في حساب، وما بنطلب إيميل ولا رقم تلفون.</li>
          <li>اللي بيظهر للناس: الجملة، الاسم اللي اخترته (أو «مجهول»)، المكان إذا كتبته، ورقم الصفحة. وإذا الجملة من كتاب، بيظهر اسم الكتاب أو الكاتب.</li>
          <li>ما بنخزّن عنوان الـIP تبعك. بنخزّن نسخة مشفّرة منه بس، عشان نوقف السبام، وما بتطلع لبرّا أبدًا.</li>
          <li>ما في إعلانات ولا أدوات تتبّع على هالموقع.</li>
        </ul>

        <H id="terms">شروط النشر</H>
        <ul className="m-0 flex list-disc flex-col gap-2 ps-5">
          <li>لما توافق، بتسمح لجبال تنشر جملتك ضمن هذا المشروع: على الموقع، على صفحات جبال، وبنسخة مطبوعة محتملة من الكتاب.</li>
          <li>الكلام بيضل كلامك. إحنا بس بنجمعه.</li>
          <li>
            إذا الجملة من كتاب أو أغنية أو كاتب معروف، اكتب المصدر. هاي الجمل بتنعرض أونلاين مع ذكر مصدرها، وما بتدخل أي نسخة مطبوعة إلا بعد
            مراجعة حقوقها.
          </li>
          <li>من حقنا ما ننشر أي صفحة، بدون ما نشرح السبب.</li>
        </ul>

        <H id="remove">بدك تحذف صفحتك؟</H>
        <p className="m-0">
          لما أضفت صفحتك، أعطيناك رابط حذف خاص. افتحه وبتقدر تحذفها بكبسة، بأي وقت. إذا ضيّعت الرابط
          {CONTACT_EMAIL ? (
            <>
              ، ابعتلنا على{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-ink underline underline-offset-4">
                {CONTACT_EMAIL}
              </a>{" "}
              رقم الصفحة ونص الجملة، وبنشيلها.
            </>
          ) : (
            <>، ابعتلنا رسالة على صفحة جبال فيها رقم الصفحة ونص الجملة، وبنشيلها.</>
          )}{" "}
          إذا الكتاب انطبع قبل طلبك، ما بنقدر نسحبه من النسخ اللي انطبعت، بس بنشيلها من الموقع ومن أي طبعة جاية.
        </p>

        <div className="pt-8">
          <Link href="/write" className="flex h-14 items-center justify-center rounded-sm bg-night text-[17px] font-medium text-bone no-underline">
            اترك جملتك
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
