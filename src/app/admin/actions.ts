"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/supabase";
import { ADMIN_COOKIE, requireAdmin } from "@/lib/admin";
import { safeEqual, signSession } from "@/lib/security";
import { cleanText, normalize } from "@/lib/moderation";
import { BASE_PATH, LIMITS, type Status } from "@/lib/config";

const STATUSES: Status[] = ["pending", "approved", "rejected", "flagged"];

export async function login(_: unknown, formData: FormData): Promise<{ error: string }> {
  const password = String(formData.get("password") || "");
  const expected = process.env.ADMIN_PASSWORD || "";
  if (!expected || expected.length < 10 || !safeEqual(password, expected)) {
    await new Promise((r) => setTimeout(r, 1200)); // slow down guessing
    return { error: "كلمة السر غلط." };
  }
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, signSession(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: `${BASE_PATH}/admin`,
    maxAge: 12 * 3600,
  });
  redirect("/admin");
}

export async function logout() {
  const jar = await cookies();
  jar.delete({ name: ADMIN_COOKIE, path: `${BASE_PATH}/admin` });
  redirect("/admin/login");
}

function refresh(publicNumber?: number) {
  revalidatePath("/");
  revalidatePath("/admin");
  if (publicNumber) revalidatePath(`/page/${publicNumber}`);
}

export async function setStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "") as Status;
  if (!id || !STATUSES.includes(status)) return;
  const patch: Record<string, unknown> = { status };
  if (status === "approved") patch.approved_at = new Date().toISOString();
  else patch.approved_at = null;
  const { data } = await db().from("contributions").update(patch).eq("id", id).select("public_number").maybeSingle();
  refresh(data?.public_number);
}

export async function saveEdit(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const text = cleanText(String(formData.get("text") || ""));
  const note = String(formData.get("note") || "").trim().slice(0, 500) || null;
  const back = String(formData.get("back") || "/admin");
  if (!id || !text || text.length > LIMITS.textMax) return;
  const { data } = await db()
    .from("contributions")
    .update({ text, text_normalized: normalize(text), moderation_note: note })
    .eq("id", id)
    .select("public_number")
    .maybeSingle();
  refresh(data?.public_number);
  redirect(back.startsWith("/admin") ? back : "/admin");
}
