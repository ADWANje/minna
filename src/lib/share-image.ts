// Draws the share image in the browser, so Arabic letters join correctly
// using the same fonts as the site. Nothing private ever goes in here:
// only the sentence, the shown name, the place and the page number.

import { pad, SITE } from "./config";

export type ShareFormat = "story" | "square";
export type SharePage = { number: number; text: string; name: string; location?: string | null };

const PALETTE = {
  dark: { bg: "#141412", fg: "#FAF7F0", muted: "#B8B09F", line: "rgba(201,191,168,0.22)" },
  light: { bg: "#FAF7F0", fg: "#1C1B18", muted: "#6B655A", line: "rgba(201,191,168,0.55)" },
};

const STORY_CONTOURS = [
  "M-40 1500 C 200 1400, 380 1500, 560 1420 S 900 1340, 1120 1430",
  "M-40 1570 C 220 1470, 400 1560, 580 1490 S 900 1420, 1120 1500",
  "M-40 1640 C 240 1540, 420 1620, 600 1560 S 900 1500, 1120 1570",
  "M-40 1710 C 260 1610, 440 1690, 620 1630 S 900 1580, 1120 1640",
  "M-40 1780 C 280 1690, 460 1760, 640 1710 S 900 1660, 1120 1710",
  "M700 260 C 820 200, 990 240, 1010 360 S 900 540, 780 500 S 600 340, 700 260 Z",
  "M730 300 C 830 250, 950 280, 966 370 S 890 490, 800 464 S 660 360, 730 300 Z",
  "M766 340 C 836 306, 910 326, 920 380 S 870 444, 818 430 S 720 380, 766 340 Z",
];
const SQUARE_CONTOURS = [
  "M-40 900 C 200 840, 380 910, 560 860 S 900 800, 1120 860",
  "M-40 950 C 220 890, 400 950, 580 905 S 900 850, 1120 905",
  "M-40 1000 C 240 945, 420 995, 600 955 S 900 905, 1120 955",
  "M-40 1050 C 260 1000, 440 1040, 620 1005 S 900 960, 1120 1005",
];

const SERIF = "Amiri, 'Noto Naskh Arabic', serif";
const SANS = "'IBM Plex Sans Arabic', system-ui, sans-serif";

async function ensureFonts() {
  if (!("fonts" in document)) return;
  await Promise.all([
    document.fonts.load(`400 80px Amiri`, "منّا"),
    document.fonts.load(`700 80px Amiri`, "منّا"),
    document.fonts.load(`400 40px 'IBM Plex Sans Arabic'`, "منّا"),
  ]).catch(() => undefined);
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const out: string[] = [];
  for (const para of text.split("\n")) {
    const words = para.split(/\s+/).filter(Boolean);
    let line = "";
    for (const w of words) {
      const test = line ? `${line} ${w}` : w;
      if (ctx.measureText(test).width > maxWidth && line) {
        out.push(line);
        line = w;
      } else {
        line = test;
      }
    }
    if (line) out.push(line);
  }
  return out;
}

export async function renderShareImage(
  format: ShareFormat,
  data: SharePage,
  ground: "dark" | "light" = format === "story" ? "dark" : "light",
): Promise<Blob> {
  await ensureFonts();
  const W = 1080;
  const H = format === "story" ? 1920 : 1080;
  const c = PALETTE[ground];
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = c.bg;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = c.line;
  ctx.lineWidth = format === "story" ? 1.6 : 1.4;
  for (const d of format === "story" ? STORY_CONTOURS : SQUARE_CONTOURS) ctx.stroke(new Path2D(d));

  const padX = format === "story" ? 110 : 100;
  const quote = `«${data.text.trim()}»`;

  // Sentence: shrink until it fits the space we have
  const maxW = W - padX * 2;
  const boxH = format === "story" ? 820 : 520;
  let size = format === "story" ? 92 : 76;
  let lines: string[] = [];
  ctx.direction = "rtl";
  for (; size >= 40; size -= 4) {
    ctx.font = `400 ${size}px ${SERIF}`;
    lines = wrap(ctx, quote, maxW);
    if (lines.length * size * 1.65 <= boxH) break;
  }
  const lh = size * 1.65;

  ctx.textBaseline = "middle";

  if (format === "story") {
    // header
    ctx.fillStyle = c.fg;
    ctx.textAlign = "right";
    ctx.direction = "rtl";
    ctx.font = `700 72px ${SERIF}`;
    ctx.fillText(SITE.name, W - padX, 160);
    ctx.fillStyle = c.muted;
    ctx.textAlign = "left";
    ctx.direction = "ltr";
    ctx.font = `400 30px ${SANS}`;
    ctx.letterSpacing = "6px";
    ctx.fillText(SITE.volume, padX, 166);
    ctx.letterSpacing = "0px";

    // number
    ctx.textAlign = "center";
    ctx.font = `400 96px ${SERIF}`;
    ctx.letterSpacing = "10px";
    ctx.fillText(pad(data.number), W / 2, 620);
    ctx.letterSpacing = "0px";

    // sentence
    ctx.direction = "rtl";
    ctx.fillStyle = c.fg;
    ctx.font = `400 ${size}px ${SERIF}`;
    const top = 1000 - (lines.length * lh) / 2;
    lines.forEach((l, i) => ctx.fillText(l, W / 2, top + lh * (i + 0.5)));

    // attribution
    const after = top + lines.length * lh + 90;
    ctx.font = `400 44px ${SANS}`;
    ctx.fillText(`— ${data.name}`, W / 2, after);
    if (data.location) {
      ctx.fillStyle = c.muted;
      ctx.font = `400 36px ${SANS}`;
      ctx.fillText(data.location, W / 2, after + 62);
    }

    // footer
    ctx.fillStyle = c.fg;
    ctx.font = `400 46px ${SERIF}`;
    ctx.fillText(SITE.question, W / 2, H - 190);
    ctx.fillStyle = c.muted;
    ctx.font = `400 32px ${SANS}`;
    ctx.fillText(`${SITE.tagline} · ${SITE.brand}`, W / 2, H - 120);
  } else {
    // header: number (right), wordmark + volume (left)
    ctx.fillStyle = c.muted;
    ctx.textAlign = "right";
    ctx.direction = "ltr";
    ctx.font = `400 64px ${SERIF}`;
    ctx.letterSpacing = "6px";
    ctx.fillText(pad(data.number), W - padX, 130);
    ctx.letterSpacing = "4px";
    ctx.textAlign = "left";
    ctx.font = `400 24px ${SANS}`;
    ctx.fillText(SITE.volume, padX, 136);
    ctx.letterSpacing = "0px";
    const volW = ctx.measureText(SITE.volume).width + 24;
    ctx.fillStyle = c.fg;
    ctx.font = `700 52px ${SERIF}`;
    ctx.direction = "rtl";
    ctx.textAlign = "left";
    ctx.fillText(SITE.name, padX + volW, 126);

    // sentence
    ctx.textAlign = "center";
    ctx.font = `400 ${size}px ${SERIF}`;
    const top = 540 - (lines.length * lh) / 2;
    lines.forEach((l, i) => ctx.fillText(l, W / 2, top + lh * (i + 0.5)));

    // footer: name (right), brand (left)
    ctx.textAlign = "right";
    ctx.font = `400 38px ${SANS}`;
    ctx.fillText(`— ${data.name}`, W - padX, data.location ? H - 150 : H - 110);
    if (data.location) {
      ctx.fillStyle = c.muted;
      ctx.font = `400 30px ${SANS}`;
      ctx.fillText(data.location, W - padX, H - 100);
    }
    ctx.fillStyle = c.muted;
    ctx.textAlign = "left";
    ctx.font = `400 28px ${SANS}`;
    ctx.fillText(SITE.brand, padX, H - 104);
  }

  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("render failed"))), "image/png"),
  );
}

/** Opens the phone's share sheet when it can take files, otherwise downloads the image. */
export async function shareOrDownload(blob: Blob, filename: string) {
  const file = new File([blob], filename, { type: "image/png" });
  if (typeof navigator.canShare === "function" && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file] });
      return "shared" as const;
    } catch (e) {
      if ((e as Error).name === "AbortError") return "cancelled" as const;
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  return "downloaded" as const;
}
