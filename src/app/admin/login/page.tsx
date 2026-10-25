import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import { LoginForm } from "./LoginForm";
import { SITE } from "@/lib/config";

export const metadata: Metadata = { title: "دخول", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function Login() {
  if (await isAdmin()) redirect("/admin");
  return (
    <main className="flex min-h-dvh items-center justify-center bg-bone px-6">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col gap-1">
          <span className="font-serif text-3xl font-bold">{SITE.name}</span>
          <span className="text-sm text-stone">مراجعة الصفحات · {SITE.brand}</span>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
