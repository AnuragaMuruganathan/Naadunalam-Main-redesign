import Image from "next/image";

type Props = {
  tone?: "light" | "dark";
  /** "fluid" scales with screen height (used by the full-screen footer). */
  size?: "md" | "lg" | "fluid";
  divider?: boolean;
};

/**
 * Full logo mark + "Naadu Nalam" wordmark + Tamil sub-line.
 * On light backgrounds the transparent mark sits on the page as-is; on dark
 * backgrounds it gets a white disc, padded so none of the ring text is cropped.
 */
export default function BrandLockup({ tone = "light", size = "md", divider = true }: Props) {
  const onDark = tone === "dark";
  const box =
    size === "lg"
      ? "size-[80px] md:size-[92px]"
      : size === "fluid"
        ? "size-[clamp(52px,8.5svh,92px)]"
        : "size-[44px] min-[360px]:size-[50px] sm:size-[56px] md:size-[68px]";
  return (
    <span className="flex items-center gap-2 min-[360px]:gap-2.5 md:gap-4">
      <span
        className={`${box} relative shrink-0 ${
          onDark ? "rounded-full bg-white ring-1 ring-white/40 shadow-[0_0_0_4px_rgba(255,255,255,0.08)]" : ""
        }`}
      >
        <span className={`absolute ${onDark ? "inset-[9%]" : "inset-0"}`}>
          <Image
            src="/images/logo-mark.webp"
            alt="Naadu Nalam logo"
            fill
            sizes="(min-width: 768px) 92px, 56px"
            className="object-contain"
            preload
          />
        </span>
      </span>
      {divider && (
        <span
          aria-hidden
          className={`hidden h-11 w-px sm:block ${onDark ? "bg-white/30" : "bg-forest-600/30"}`}
        />
      )}
      <span className="flex flex-col leading-none">
        <span
          className={`whitespace-nowrap font-serif font-bold tracking-[-0.01em] ${
            size === "lg"
              ? "text-[1.6rem] md:text-[1.85rem]"
              : size === "fluid"
                ? "text-[clamp(1.3rem,2.4svh+0.45rem,1.85rem)]"
                : "text-[1.08rem] min-[360px]:text-[1.2rem] sm:text-[1.3rem] md:text-[1.6rem]"
          } ${onDark ? "text-white" : "text-forest-600"}`}
        >
          Naadu Nalam
        </span>
        <span
          lang="ta"
          className={`mt-1.5 whitespace-nowrap font-tamil-sans text-[0.62rem] font-medium max-[369px]:hidden sm:text-[0.68rem] md:text-[0.74rem] ${
            onDark ? "text-white/85" : "text-forest-800"
          }`}
        >
          நாடு நலம் <span className="mx-1 opacity-60">•</span> இயற்கையின் நலம்
        </span>
      </span>
    </span>
  );
}
