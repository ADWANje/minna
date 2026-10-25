import { NextResponse } from "next/server";
import { randomApprovedNumber } from "@/lib/pages";
import { BASE_PATH } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const from = Number(url.searchParams.get("from")) || undefined;
  const n = await randomApprovedNumber(from);
  const target = n ? `${BASE_PATH}/page/${n}` : `${BASE_PATH}/book`;
  return NextResponse.redirect(new URL(target, url.origin), { status: 307 });
}
