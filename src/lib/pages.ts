import "server-only";
import { db } from "./supabase";
import { ANONYMOUS_NAME, type SourceType } from "./config";

/** The only shape that ever leaves the server for public pages. */
export type PublicPage = {
  number: number;
  text: string;
  name: string;
  location: string | null;
  sourceType: SourceType;
  sourceName: string | null;
};

const PUBLIC_COLUMNS =
  "public_number, text, display_name, anonymous, location_text, source_type, source_name";

type Row = {
  public_number: number;
  text: string;
  display_name: string | null;
  anonymous: boolean;
  location_text: string | null;
  source_type: SourceType;
  source_name: string | null;
};

function toPublic(r: Row): PublicPage {
  return {
    number: r.public_number,
    text: r.text,
    name: r.anonymous || !r.display_name ? ANONYMOUS_NAME : r.display_name,
    location: r.anonymous ? null : r.location_text,
    sourceType: r.source_type,
    sourceName: r.source_type === "published" ? r.source_name : null,
  };
}

export async function countApproved(): Promise<number> {
  const { count, error } = await db()
    .from("contributions")
    .select("id", { count: "exact", head: true })
    .eq("status", "approved");
  if (error) throw error;
  return count ?? 0;
}

export async function latestApproved(limit: number): Promise<PublicPage[]> {
  const { data, error } = await db()
    .from("contributions")
    .select(PUBLIC_COLUMNS)
    .eq("status", "approved")
    .order("public_number", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data as Row[]).map(toPublic);
}

export async function pageByNumber(
  n: number,
): Promise<{ state: "approved"; page: PublicPage } | { state: "in-review" } | { state: "missing" }> {
  const { data, error } = await db()
    .from("contributions")
    .select(`${PUBLIC_COLUMNS}, status`)
    .eq("public_number", n)
    .maybeSingle();
  if (error) throw error;
  if (!data) return { state: "missing" };
  const row = data as Row & { status: string };
  if (row.status === "approved") return { state: "approved", page: toPublic(row) };
  if (row.status === "pending" || row.status === "flagged") return { state: "in-review" };
  return { state: "missing" };
}

export async function neighbours(n: number): Promise<{ prev: number | null; next: number | null }> {
  const [p, q] = await Promise.all([
    db()
      .from("contributions")
      .select("public_number")
      .eq("status", "approved")
      .lt("public_number", n)
      .order("public_number", { ascending: false })
      .limit(1),
    db()
      .from("contributions")
      .select("public_number")
      .eq("status", "approved")
      .gt("public_number", n)
      .order("public_number", { ascending: true })
      .limit(1),
  ]);
  return {
    prev: (p.data?.[0]?.public_number as number | undefined) ?? null,
    next: (q.data?.[0]?.public_number as number | undefined) ?? null,
  };
}

export async function randomApprovedNumber(exclude?: number): Promise<number | null> {
  const total = await countApproved();
  if (total === 0) return null;
  for (let attempt = 0; attempt < 3; attempt++) {
    const offset = Math.floor(Math.random() * total);
    const { data } = await db()
      .from("contributions")
      .select("public_number")
      .eq("status", "approved")
      .order("public_number", { ascending: true })
      .range(offset, offset);
    const n = data?.[0]?.public_number as number | undefined;
    if (n && (n !== exclude || total === 1)) return n;
  }
  return null;
}
