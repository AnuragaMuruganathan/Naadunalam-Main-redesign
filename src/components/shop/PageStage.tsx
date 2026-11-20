import { getImageProps } from "next/image";

/**
 * Page frame for the checkout and wishlist pages: the village-kitchen photo
 * (same file as the shop banner, so already cached) fades into cream to the
 * left and below, with the title and an optional Tamil line on the calm side. The page content follows on the cream.
 */
export default function PageStage({
  title,
  ta,
  id,
  aside,
  compact = false,
  children,
}: {
  title: string;
  ta?: string;
  /** id for the h1, used by aria-labelledby */
  id: string;
  /** Optional content at the right of the title row (desktop) */
  aside?: React.ReactNode;
  /** Tighter top spacing and title, for pages that must fit one screen (checkout) */
  compact?: boolean;
  children: React.ReactNode;
}) {
  const common = { alt: "", sizes: "100vw", fetchPriority: "high", loading: "eager" } as const;
  // images.unoptimized is on, so each call yields a plain src (no srcSet): one file per breakpoint.
  const desktop = getImageProps({ ...common, src: "/images/shop-banner.webp", width: 2172, height: 724 }).props;
  const { srcSet: _unused, ...img } = getImageProps({ ...common, src: "/images/shop-banner-m.webp", width: 976, height: 480 }).props;

  return (
    <section aria-labelledby={id} className="relative isolate overflow-x-clip">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[300px] md:h-[380px]">
        <picture>
          <source media="(min-width: 768px)" srcSet={desktop.srcSet ?? desktop.src} />
          <img {...img} alt="" className="size-full object-cover object-[80%_55%] md:object-[right_58%]" />
        </picture>
        <span className="absolute inset-0 bg-[linear-gradient(90deg,var(--color-cream)_0%,rgba(252,245,237,0.92)_22%,rgba(252,245,237,0.35)_52%,rgba(252,245,237,0)_72%)] max-md:bg-[linear-gradient(90deg,rgba(252,245,237,0.92)_0%,rgba(252,245,237,0.6)_60%,rgba(252,245,237,0.25)_100%)]" />
        <span className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-b from-transparent to-cream" />
      </div>

      <div className={`mx-auto max-w-[1320px] px-4 md:px-8 ${compact ? "pb-6 pt-3 md:pb-6 md:pt-3" : "pb-8 pt-5 md:pb-10 md:pt-7"}`}>
        <div className={`flex flex-wrap justify-between gap-x-6 gap-y-3 ${compact ? "items-center" : "items-end"}`}>
          <div>
            <h1 id={id} className={`font-bold leading-none tracking-[-0.015em] text-forest-700 ${compact ? "text-[2.1rem] md:text-[2.5rem]" : "text-[2.4rem] md:text-[3.2rem]"}`}>
              {title}
            </h1>
            {ta && (
              <p lang="ta" className="mt-2 text-[1.15rem] text-forest-800 md:text-[1.45rem]">
                {ta}
              </p>
            )}
          </div>
          {aside}
        </div>
        <div className={compact ? "mt-3" : "mt-5 md:mt-7"}>{children}</div>
      </div>
    </section>
  );
}
