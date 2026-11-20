import Image from "next/image";

/**
 * Background dressing for the shop grid: a faded village scene at the foot.
 * It sits behind
 * the cards (the section is `isolate`, this is z -1), never takes pointer
 * events, and only shows where the side gutters are wide enough (xl+).
 */
export default function ShopDecor() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 max-xl:hidden">
      {/* Faded village: the footer photo, already cached on desktop */}
      <div className="absolute inset-x-0 bottom-0 h-[560px] opacity-[0.16] [mask-image:linear-gradient(to_bottom,transparent,black_45%)]">
        <Image src="/images/footer-village.webp" alt="" fill sizes="100vw" className="object-cover object-[center_70%]" />
      </div>
    </div>
  );
}
