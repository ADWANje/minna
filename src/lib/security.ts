import "server-only";
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function hashIp(ip: string): string {
  return sha256(`${process.env.IP_HASH_SALT || "minna"}:${ip}`);
}

export function newDeleteToken(): { token: string; hash: string } {
  const token = randomBytes(24).toString("base64url");
  return { token, hash: sha256(token) };
}

export function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("SESSION_SECRET must be at least 32 characters");
  return s;
}

const SESSION_HOURS = 12;

export function signSession(): string {
  const exp = Date.now() + SESSION_HOURS * 3600_000;
  const sig = createHmac("sha256", secret()).update(`admin.${exp}`).digest("base64url");
  return `${exp}.${sig}`;
}

export function verifySession(value: string | undefined): boolean {
  if (!value) return false;
  const [expStr, sig] = value.split(".");
  const exp = Number(expStr);
  if (!exp || !sig || exp < Date.now()) return false;
  const expected = createHmac("sha256", secret()).update(`admin.${exp}`).digest("base64url");
  return safeEqual(sig, expected);
}

export function clientIp(headers: Headers): string {
  return (
    headers.get("x-real-ip") ||
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}
