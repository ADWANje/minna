import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { db } from "@/lib/supabase";
import { ANONYMOUS_NAME, pad, SOURCE_ADMIN_LABELS, type SourceType } from "@/lib/config";

export const dynamic = "force-dynamic";

function cell(v: unknown): string {
  let s = v === null || v === undefined ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; // stop spreadsheet formula injection
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET() {
  if (!(await isAdmin())) return new NextResponse("Not found", { status: 404 });

  const { data, error } = await db()
    .from("contributions")
    .select("public_number, text, source_type, source_name, display_name, anonymous, location_text, needs_rights_review, consent_at, approved_at")
    .eq("status", "approved")
    .order("public_number", { ascending: true });
  if (error) return new NextResponse("Export failed", { status: 500 });

  const header = ["رقم الصفحة", "النص", "نوع المصدر", "المصدر", "الاسم", "المكان", "يحتاج مراجعة حقوق", "تاريخ الموافقة على النشر", "تاريخ النشر"];
  const lines = [header.map(cell).join(",")];
  for (const r of data ?? []) {
    lines.push(
      [
        pad(r.public_number),
        r.text,
        SOURCE_ADMIN_LABELS[r.source_type as SourceType],
        r.source_name,
        r.anonymous ? ANONYMOUS_NAME : r.display_name,
        r.location_text,
        r.needs_rights_review ? "نعم" : "لا",
        r.consent_at,
        r.approved_at,
      ]
        .map(cell)
        .join(","),
    );
  }

  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse("﻿" + lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="minna-approved-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
