import { pad, SITE } from "@/lib/config";

type Props = {
  number: number;
  text: string;
  name: string;
  location?: string | null;
  sourceName?: string | null;
  size?: "sm" | "lg";
  className?: string;
  footer?: boolean;
};

/** One page of the book. Used in previews, the reader and the success screen. */
export function BookPage({ number, text, name, location, sourceName, size = "lg", className = "", footer = false }: Props) {
  const lg = size === "lg";
  return (
    <article
      aria-label={`صفحة رقم ${pad(number)}`}
      className={`page-stack flex flex-col justify-between bg-paper text-ink ${lg ? "px-7 pb-7 pt-10" : "px-5 pb-6 pt-6"} ${className}`}
    >
      <span dir="ltr" className={`text-center font-serif tracking-[0.08em] text-stone ${lg ? "text-3xl" : "text-xs tracking-[0.18em]"}`}>
        {pad(number)}
      </span>
      <p className={`m-0 whitespace-pre-line text-center font-serif ${lg ? "text-[27px] leading-[1.8]" : "text-[21px] leading-[1.7]"}`}>
        «{text}»
      </p>
      <div className="flex flex-col items-center gap-0.5 text-center">
        <span className={lg ? "text-[15px]" : "text-[13px] text-earth"}>— {name}</span>
        {sourceName ? <span className="text-[13px] text-stone">عن {sourceName}</span> : null}
        {location ? <span className="text-[13px] text-stone">{location}</span> : null}
        {footer ? (
          <span className="mt-4 text-xs text-stone">
            <span className="font-serif text-[15px] font-bold">{SITE.name}</span> · <span dir="ltr" className="text-[10px] tracking-[0.22em]">{SITE.volume}</span>
          </span>
        ) : null}
      </div>
    </article>
  );
}
