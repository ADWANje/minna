// Words or phrases that send a submission straight to the "flagged" tab.
// Nothing is auto-deleted: every submission is still read by a person.
//
// Add one entry per line, in any form people actually write it
// (Arabic, Arabizi, English). Matching ignores harakat, tatweel,
// letter variants (أ/إ/آ/ا, ة/ه, ى/ي) and capital letters.
//
// Keep this file private-feeling: it is never shown on the site.

export const BLOCKED_TERMS: string[] = [
  // "كلمة",
  // "phrase",
];
