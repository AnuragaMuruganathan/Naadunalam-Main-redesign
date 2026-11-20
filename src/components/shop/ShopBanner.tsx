import { getImageProps } from "next/image";

/**
 * Shop title band: the village-kitchen photo full-bleed, title on the calm
 * field side.
 *
 * Its height comes from --shop-banner-h, which ShopView measures so that
 * banner + filter panel + the first row of products exactly fill the screen.
 * The CSS fallbacks approximate that until the measurement runs.
 *
 * Phones get a smaller crop of the kitchen side (see scripts/optimize-images.mjs).
 *
 * The vendor store pages reuse it with a Tamil line under the title (`sub`)
 * and the store's facts card on the right (`aside`).
 */
export default function ShopBanner({
  title,
  id = "shop-title",
  sub,
  aside,
}: {
  title: string;
  id?: string;
  sub?: React.ReactNode;
  aside?: React.ReactNode;
}) {
  const common = { alt: "", sizes: "100vw", fetchPriority: "high", loading: "eager" } as const;
  // images.unoptimized is on, so each call yields a plain src (no srcSet): one file per breakpoint.
  const desktop = getImageProps({ ...common, src: "/images/shop-banner.webp", width: 2172, height: 724 }).props;
  const { srcSet: _unused, ...img } = getImageProps({
    ...common,
    src: "/images/shop-banner-m.webp",
    width: 976,
    height: 480,
  }).props;

  return (
    <section aria-labelledby={id} className="relative isolate overflow-hidden bg-sand">
      <picture>
        <source media="(min-width: 768px)" srcSet={desktop.srcSet ?? desktop.src} />
        <img
          {...img}
          alt=""
          className="absolute inset-0 -z-10 size-full object-cover object-[78%_60%] md:object-[right_62%]"
        />
      </picture>
      {/* Keeps the title readable over the haze */}
      <span
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(252,245,237,0.88)_0%,rgba(252,245,237,0.55)_34%,rgba(252,245,237,0)_58%)] max-md:bg-[linear-gradient(90deg,rgba(252,245,237,0.9)_0%,rgba(252,245,237,0.55)_55%,rgba(252,245,237,0.1)_100%)]"
      />

      <div className="mx-auto flex h-[var(--shop-banner-h,170px)] max-w-[1480px] flex-col justify-center px-4 sm:px-5 md:h-[var(--shop-banner-h,clamp(190px,15vw,250px))] md:px-7 xl:h-[var(--shop-banner-h,max(180px,calc(100svh_-_104px_-_76px_-_32px_-_20px_-_((min(100vw,1480px)_-_128px)/6_-_12px)*0.9375_-_190px)))]">
        <div className="flex items-center justify-between gap-6">
          <div className="min-w-0">
            <h1
              id={id}
              className="font-serif text-[2.025rem] font-bold leading-[1.05] tracking-[-0.01em] text-forest-700 md:text-[clamp(2.475rem,4vw,3.475rem)]"
            >
              {title}
            </h1>
            {sub}
          </div>
          {aside}
        </div>
      </div>
    </section>
  );
}
