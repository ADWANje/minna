import { BLOCKED_TERMS } from "./blocklist";

/** Arabic-aware normalization used for duplicate detection and blocklist matching. */
export function normalize(input: string): string {
  return input
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[ً-ٰٟۖ-ۭ]/g, "") // harakat
    .replace(/ـ/g, "") // tatweel
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/[^\p{L}\p{N}]+/gu, "");
}

/** Light cleanup: collapse whitespace, trim, strip control characters. Keeps line breaks (max 3 lines). */
export function cleanText(input: string): string {
  const lines = input
    .replace(/[\u0000-\u0009\u000B-\u001F\u007F​-‏‪-‮⁦-⁩]/g, "")
    .split(/\r?\n/)
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter(Boolean);
  return lines.slice(0, 3).join("\n");
}

export function cleanLine(input: unknown, max: number): string | null {
  if (typeof input !== "string") return null;
  const v = input
    .replace(/[\u0000-\u001F\u007F​-‏‪-‮⁦-⁩]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
  return v || null;
}

const URL_RE =
  /(https?:\/\/|www\.)|\b[a-z0-9-]+\.(com|net|org|ps|me|io|co|info|app|link|ly|gl|xyz|shop|store)\b/i;
const EMAIL_RE = /[^\s@]+@[^\s@]+\.[^\s@]+/;
const HANDLE_RE = /(^|\s)@[\w.]{3,}/;
// 7+ digits (western or Arabic-Indic), allowing spaces and dashes in between
const PHONE_RE = /([0-9٠-٩][\s\-]?){7,}/;

export type Check = { flags: string[]; hard: boolean };

/**
 * Automated first pass. Never publishes and never deletes —
 * it only labels a submission so a person can review it faster.
 * `hard` means it should go to the "flagged" tab instead of "pending".
 */
export function checkSubmission(fields: {
  text: string;
  displayName: string | null;
  location: string | null;
  sourceName: string | null;
}): Check {
  const flags: string[] = [];
  let hard = false;
  const all = [fields.text, fields.displayName, fields.location, fields.sourceName]
    .filter(Boolean)
    .join(" ");

  if (URL_RE.test(all)) {
    flags.push("فيها رابط");
    hard = true;
  }
  if (EMAIL_RE.test(all) || PHONE_RE.test(all) || HANDLE_RE.test(all)) {
    flags.push("معلومات شخصية محتملة");
    hard = true;
  }

  const norm = normalize(all);
  if (BLOCKED_TERMS.some((t) => t.trim() && norm.includes(normalize(t)))) {
    flags.push("كلمة محظورة");
    hard = true;
  }

  const letters = fields.text.replace(/[^\p{L}]/gu, "");
  if (letters.length < 2 || /(.)\1{6,}/u.test(fields.text)) {
    flags.push("احتمال سبام");
    hard = true;
  }

  return { flags, hard };
}
