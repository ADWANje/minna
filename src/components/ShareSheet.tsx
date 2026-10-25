"use client";

import { useState } from "react";
import { renderShareImage, shareOrDownload, type SharePage, type ShareFormat } from "@/lib/share-image";
import { pad } from "@/lib/config";

const FORMATS: { id: ShareFormat; label: string; size: string; box: string }[] = [
  { id: "story", label: "ستوري", size: "1080×1920", box: "h-24 w-[54px]" },
  { id: "square", label: "بوست مربع", size: "1080×1080", box: "my-2.5 h-[76px] w-[76px]" },
];

export function ShareSheet({ data }: { data: SharePage }) {
  const [busy, setBusy] = useState<ShareFormat | null>(null);
  const [note, setNote] = useState("");

  async function make(format: ShareFormat) {
    setBusy(format);
    setNote("");
    try {
      const blob = await renderShareImage(format, data);
      const r = await shareOrDownload(blob, `minna-${pad(data.number)}-${format}.png`);
      if (r === "downloaded") setNote("نزلت الصورة على جهازك.");
    } catch {
      setNote("ما زبطت الصورة. جرّب كمان مرة.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="anim-fade flex flex-col gap-3.5 border border-dust bg-paper p-4.5">
      <span className="text-[13px] text-stone">اختار الشكل</span>
      <div className="grid grid-cols-2 gap-3">
        {FORMATS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => make(f.id)}
            disabled={busy !== null}
            className="flex cursor-pointer flex-col items-center gap-2.5 border border-line bg-transparent px-2 py-3.5 text-ink transition-colors hover:border-ink disabled:cursor-wait disabled:opacity-60"
          >
            <span aria-hidden="true" className={`flex items-center justify-center border border-contour bg-sand font-serif text-[11px] ${f.box}`}>
              «...»
            </span>
            <span className="text-sm font-medium">{busy === f.id ? "عم تتجهز..." : f.label}</span>
            <span dir="ltr" className="text-[11px] text-stone">{f.size}</span>
          </button>
        ))}
      </div>
      <p aria-live="polite" className="m-0 min-h-5 text-center text-[13px] text-stone">{note}</p>
    </div>
  );
}
