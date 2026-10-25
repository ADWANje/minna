import { NextResponse } from "next/server";
import { db } from "@/lib/supabase";
import { LIMITS, BASE_PATH, type SourceType } from "@/lib/config";
import { checkSubmission, cleanLine, cleanText, normalize } from "@/lib/moderation";
import { clientIp, hashIp, newDeleteToken } from "@/lib/security";

export const dynamic = "force-dynamic";

const SOURCES: SourceType[] = ["self", "known", "published", "unknown"];

function fail(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(req: Request) {
  // Same-origin only
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (origin && host && new URL(origin).host !== host) return fail("طلب غير مسموح.", 403);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return fail("في إشي غلط بالطلب.");
  }

  // Bot traps: hidden field must stay empty, and nobody writes a sentence in under 3 seconds.
  if (typeof body.website === "string" && body.website.trim() !== "") return fail("ما زبطت. جرّب كمان مرة.");
  const startedAt = Number(body.startedAt);
  if (!startedAt || Date.now() - startedAt < LIMITS.minFillMs) return fail("خذ وقتك، وجرّب كمان مرة.");

  // Validate
  if (typeof body.text !== "string") return fail("اكتب جملتك.");
  const text = cleanText(body.text);
  if (!text) return fail("اكتب جملتك.");
  if (text.length > LIMITS.textMax) return fail(`الجملة أطول من ${LIMITS.textMax} حرف.`);

  const sourceType = body.sourceType as SourceType;
  if (!SOURCES.includes(sourceType)) return fail("اختار مين قالها.");
  const sourceName = sourceType === "published" ? cleanLine(body.sourceName, LIMITS.sourceMax) : null;

  const anonymous = body.anonymous === true;
  const displayName = anonymous ? null : cleanLine(body.displayName, LIMITS.nameMax);
  const location = anonymous ? null : cleanLine(body.location, LIMITS.locationMax);
  if (!anonymous && !displayName) return fail("اكتب اسمك، أو اختار «مجهول».");

  if (body.consent !== true) return fail("لازم توافق على شروط النشر.");

  const supabase = db();

  // Rate limit by hashed IP (raw IPs are never stored)
  const ipHash = hashIp(clientIp(req.headers));
  const hourAgo = new Date(Date.now() - 3600_000).toISOString();
  const dayAgo = new Date(Date.now() - 86400_000).toISOString();
  const [hour, day] = await Promise.all([
    supabase.from("contributions").select("id", { count: "exact", head: true }).eq("ip_hash", ipHash).gte("created_at", hourAgo),
    supabase.from("contributions").select("id", { count: "exact", head: true }).eq("ip_hash", ipHash).gte("created_at", dayAgo),
  ]);
  if ((hour.count ?? 0) >= LIMITS.perHour || (day.count ?? 0) >= LIMITS.perDay) {
    return fail("وصلنا منك كذا صفحة. ارجعلنا بعد شوي.", 429);
  }

  // Automated first pass
  const textNormalized = normalize(text);
  const check = checkSubmission({ text, displayName, location, sourceName });

  const { data: dupes } = await supabase
    .from("contributions")
    .select("public_number, ip_hash")
    .eq("text_normalized", textNormalized)
    .in("status", ["pending", "approved", "flagged"])
    .limit(3);
  if (dupes && dupes.length) {
    if (dupes.some((d) => d.ip_hash === ipHash)) return fail("هالجملة وصلتنا منك قبل.", 409);
    check.flags.push(`مكررة مع #${String(dupes[0].public_number).padStart(5, "0")}`);
  }

  const needsRightsReview = sourceType === "published";
  if (needsRightsReview) check.flags.push("اقتباس منشور");

  const { token, hash } = newDeleteToken();

  const { data, error } = await supabase
    .from("contributions")
    .insert({
      text,
      text_normalized: textNormalized,
      source_type: sourceType,
      source_name: sourceName,
      display_name: displayName,
      anonymous,
      location_text: location,
      status: check.hard ? "flagged" : "pending",
      auto_flags: check.flags,
      needs_rights_review: needsRightsReview,
      consent: true,
      ip_hash: ipHash,
      delete_token_hash: hash,
    })
    .select("public_number")
    .single();

  if (error || !data) {
    console.error("insert failed", error?.message);
    return fail("ما زبطت هالمرة. جرّب كمان شوي.", 500);
  }

  return NextResponse.json({
    number: data.public_number as number,
    removePath: `${BASE_PATH}/remove/${token}`,
  });
}
