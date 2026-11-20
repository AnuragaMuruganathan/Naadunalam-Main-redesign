"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  Check,
  ChefHat,
  ChevronLeft,
  ChevronRight,
  Droplets,
  FlaskConicalOff,
  Flower2,
  Leaf,
  Maximize2,
  Package,
  ShieldCheck,
  ShoppingCart,
  Soup,
  Sparkles,
  Sprout,
  Truck,
  Wheat,
  X,
  type LucideIcon,
} from "lucide-react";
import type { Product } from "@/lib/catalog";
import type { ProductDetail } from "@/lib/productDetails";
import { categoryOf } from "@/lib/shop";
import { rupees } from "@/lib/format";
import { addToCart, maxQty, setQty as setCartQty, useShop } from "@/lib/store";
import QtyStepper from "@/components/shop/QtyStepper";
import { WishButton } from "@/components/shop/ProductCard";
import VendorAvatar, { monthYear } from "@/components/shop/VendorAvatar";
import { PRODUCTS } from "@/lib/catalog";
import { PRODUCT_VENDOR, vendorOf } from "@/lib/vendors";

const EASE = [0.22, 1, 0.36, 1] as const;
const rise = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: EASE },
});

export default function ProductView({ product: p, detail }: { product: Product; detail?: ProductDetail }) {
  const items = galleryFor(p, detail);

  return (
    <>
      {/* overflow-clip, not hidden: hidden makes this section the sticky gallery's
          scroll box, which pushed the photo 36px below the title and stopped it sticking */}
      <section className="relative isolate overflow-clip bg-cream lg:flex lg:h-[calc(100svh-104px)] lg:min-h-[560px] lg:items-center">
        <ProductDecor />
        <div className="mx-auto w-full max-w-[1320px] px-5 pb-10 pt-8 md:px-8 md:pb-14 md:pt-14 lg:py-[clamp(1rem,3svh,2.5rem)]">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,1fr)] lg:items-center lg:gap-14">
            <Gallery items={items} product={p} />
            <BuyBox product={p} />
          </div>
        </div>
      </section>

      <StickyBuyBar product={p} />

      <Details product={p} detail={detail} />
    </>
  );
}

/* ---------------------------------------------------------------- Decor */

/** A faded paddy field along the foot, behind everything. */
function ProductDecor() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      <div className="absolute inset-x-0 bottom-0 h-[150px] opacity-45 [mask-image:linear-gradient(to_bottom,transparent,black_60%)] md:h-[200px]">
        <Image src="/images/pdp-fields.webp" alt="" fill sizes="100vw" className="object-cover object-[center_62%]" />
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Gallery */

type Shot = { src: string; alt: string; thumbAlt: string; zoom?: boolean };

/**
 * The product's own photos first; then a close-up of the main photo, the
 * category photo from the original store, and our paddy fields — so every
 * product gets a full strip without inventing product shots.
 */
function galleryFor(p: Product, detail?: ProductDetail): Shot[] {
  const own = detail?.gallery.length ? detail.gallery : [p.img];
  const cat = categoryOf(p.category);
  const shots: Shot[] = own.map((src, i) => ({
    src,
    alt: own.length > 1 ? `${p.name}, photo ${i + 1}` : p.name,
    thumbAlt: `Show photo ${i + 1}`,
  }));
  shots.push({ src: own[0], alt: `${p.name}, close-up`, thumbAlt: "Show close-up", zoom: true });
  if (cat?.img && !own.includes(cat.img)) shots.push({ src: cat.img, alt: `${cat.name} from Naadu Nalam`, thumbAlt: `Show ${cat.name} photo` });
  shots.push({ src: "/images/pdp-fields.webp", alt: "Paddy fields at sunrise, where our grains are grown", thumbAlt: "Show our fields" });
  return shots.slice(0, 4);
}

function ShotImage({ shot, sizes, preload }: { shot: Shot; sizes: string; preload?: boolean }) {
  return (
    <Image
      src={shot.src}
      alt={shot.alt}
      fill
      preload={preload}
      sizes={sizes}
      className={`object-cover ${shot.zoom ? "origin-[50%_30%] scale-[1.8]" : ""}`}
    />
  );
}

function Gallery({ items, product: p }: { items: Shot[]; product: Product }) {
  const [i, setI] = useState(0);
  const [zoom, setZoom] = useState(false);
  const shot = items[i];

  return (
    <motion.div {...rise()} className="flex flex-col-reverse gap-3 lg:flex-row lg:items-start lg:gap-4">
      {/* Thumbnails: a column beside the photo on desktop, a row under it on phones */}
      <ul className="flex gap-3 lg:w-[clamp(72px,11svh,104px)] lg:shrink-0 lg:flex-col" aria-label="Product photos">
        {items.map((s, n) => (
          <li key={`${s.src}-${n}`} className="min-w-0 flex-1 lg:flex-none">
            <button
              type="button"
              onClick={() => setI(n)}
              aria-pressed={n === i}
              aria-label={s.thumbAlt}
              className={`relative block aspect-[11/12] w-full cursor-pointer overflow-hidden rounded-2xl bg-sand p-1 ring-2 transition-[box-shadow,opacity] ${
                n === i ? "ring-forest-600" : "opacity-80 ring-transparent hover:opacity-100 hover:ring-forest-600/30"
              }`}
            >
              <span className="relative block size-full overflow-hidden rounded-[0.8rem]">
                <ShotImage shot={s} sizes="104px" />
              </span>
            </button>
          </li>
        ))}
      </ul>

      <div className="relative aspect-square min-w-0 flex-1 overflow-hidden rounded-[1.75rem] lg:max-w-[calc(100svh-104px-clamp(2rem,6svh,5rem))] bg-sand shadow-[0_30px_60px_-36px_rgba(60,40,10,0.65)] ring-1 ring-forest-600/10">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={`${shot.src}-${i}`}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <ShotImage shot={shot} preload={i === 0} sizes="(min-width: 1320px) 560px, (min-width: 1024px) 42vw, 100vw" />
          </motion.div>
        </AnimatePresence>
        <WishButton product={p} className="absolute right-4 top-4 size-12! bg-white/90! backdrop-blur-sm" />
        <button
          type="button"
          onClick={() => setZoom(true)}
          aria-label="View photo full screen"
          className="absolute bottom-4 right-4 grid size-12 cursor-pointer place-items-center rounded-full bg-white/90 text-ink shadow-[0_6px_16px_-8px_rgba(10,57,25,0.5)] ring-1 ring-forest-600/10 backdrop-blur-sm transition-colors hover:text-forest-600"
        >
          <Maximize2 className="size-5" aria-hidden />
        </button>
      </div>

      {typeof document !== "undefined" &&
        createPortal(<AnimatePresence>{zoom && <Lightbox items={items} start={i} onClose={() => setZoom(false)} />}</AnimatePresence>, document.body)}
    </motion.div>
  );
}

function Lightbox({ items, start, onClose }: { items: Shot[]; start: number; onClose: () => void }) {
  const [i, setI] = useState(start);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  });
  useEffect(() => {
    const lenis = (window as unknown as { __lenis?: { stop: () => void; start: () => void } }).__lenis;
    const opener = document.activeElement as HTMLElement | null;
    lenis?.stop();
    document.documentElement.style.overflow = "hidden";
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close.current();
      if (e.key === "ArrowRight") setI((n) => (n + 1) % items.length);
      if (e.key === "ArrowLeft") setI((n) => (n - 1 + items.length) % items.length);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      lenis?.start();
      document.documentElement.style.overflow = "";
      opener?.focus?.();
    };
  }, [items.length]);

  const nav = "grid size-12 cursor-pointer place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20";
  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Product photos"
      className="fixed inset-0 z-[90] flex items-center justify-center bg-forest-950/92 p-4 md:p-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <div className="relative aspect-square w-full max-w-[min(86vh,860px)] overflow-hidden rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <ShotImage shot={items[i]} sizes="90vw" />
      </div>
      <button ref={closeBtn} type="button" onClick={onClose} aria-label="Close" className={`${nav} absolute right-4 top-4`}>
        <X className="size-6" aria-hidden />
      </button>
      {items.length > 1 && (
        <>
          <button type="button" aria-label="Previous photo" className={`${nav} absolute left-3 top-1/2 -translate-y-1/2 md:left-6`} onClick={(e) => { e.stopPropagation(); setI((n) => (n - 1 + items.length) % items.length); }}>
            <ChevronLeft className="size-6" aria-hidden />
          </button>
          <button type="button" aria-label="Next photo" className={`${nav} absolute right-3 top-1/2 -translate-y-1/2 md:right-6`} onClick={(e) => { e.stopPropagation(); setI((n) => (n + 1) % items.length); }}>
            <ChevronRight className="size-6" aria-hidden />
          </button>
          <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-sm font-semibold text-white/80">
            {i + 1} / {items.length}
          </p>
        </>
      )}
    </motion.div>
  );
}

/* ---------------------------------------------------------------- Buy box */

type Feature = { label: string; icon: LucideIcon };

/** Three short promises under the price, worded to suit the category. */
function featuresFor(category: string): Feature[] {
  const first: Record<string, Feature> = {
    "rice-grains": { label: "Traditional Variety", icon: Wheat },
    "aval-flakes": { label: "Traditional Variety", icon: Wheat },
    "other-rice": { label: "Wholesome Grain", icon: Wheat },
    siruthaniyam: { label: "Traditional Millet", icon: Wheat },
    "oil-vinegers": { label: "Traditionally Made", icon: Droplets },
    "health-mixes": { label: "Wholesome Blend", icon: Soup },
    "natural-sweeteners": { label: "Natural Sweetness", icon: Sparkles },
    honey: { label: "Pure & Natural", icon: Flower2 },
    "paruppu-pulses": { label: "Protein Rich", icon: Sprout },
    "masala-podi": { label: "Traditional Recipe", icon: ChefHat },
    "herbal-wellness": { label: "Herbal Goodness", icon: Flower2 },
    "personal-care": { label: "Herbal Goodness", icon: Flower2 },
  };
  const care = category === "herbal-wellness" || category === "personal-care";
  return [
    first[category] ?? { label: "Traditional Variety", icon: Wheat },
    care ? { label: "Gentle Care", icon: Leaf } : { label: "Nutrient Rich", icon: Leaf },
    { label: "No Additives", icon: FlaskConicalOff },
  ];
}

const ASSURANCES = [
  { icon: Truck, title: "Fast Delivery", body: "Across Tamil Nadu" },
  { icon: ShieldCheck, title: "Quality", body: "Assured" },
  { icon: Sprout, title: "From", body: "Trusted Farmers" },
];

const money = (n: number) => `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function BuyBox({ product: p }: { product: Product }) {
  const router = useRouter();
  const { cart } = useShop();
  const inCart = cart.find((l) => l.id === p.id)?.qty ?? 0;
  const room = Math.max(0, maxQty(p) - inCart);
  const [qty, setQty] = useState(1);
  const q = Math.min(qty, Math.max(1, room));
  const lowStock = p.inStock && p.stock !== null && p.stock <= 10;
  const features = featuresFor(p.category);

  return (
    <div className="flex min-w-0 flex-col" id="buy-box">
      <motion.h1 {...rise(0.06)} className="text-balance text-[2.075rem] font-bold leading-[1.1] tracking-[-0.01em] text-ink md:text-[2.575rem] lg:text-[clamp(2rem,4.6svh,2.875rem)]">
        {p.name}
      </motion.h1>
      {p.ta && (
        <motion.p {...rise(0.1)} lang="ta" className="mt-2 text-[1.125rem] text-ink md:text-[1.275rem]">
          {p.ta}
        </motion.p>
      )}
      <SoldBy product={p} />

      <motion.div {...rise(0.14)} className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 lg:mt-[clamp(0.75rem,2.4svh,1.5rem)]">
        <p className="text-[2.275rem] font-bold leading-none tracking-[-0.01em] text-forest-700 md:text-[2.575rem]">
          {money(p.price)}
          {p.onSale && p.regularPrice > p.price && <s className="ml-3 text-[1.075rem] font-medium text-muted">{money(p.regularPrice)}</s>}
        </p>
        {p.pack && (
          <>
            <span aria-hidden className="h-9 w-px bg-forest-600/15" />
            <span className="rounded-full bg-leaf/15 px-4 py-1.5 text-[0.875rem] font-bold text-forest-800">{p.pack}</span>
          </>
        )}
        {!p.inStock ? (
          <span className="rounded-full bg-[#b3261e]/10 px-3 py-1 text-[0.795rem] font-bold text-[#b3261e]">Out of stock</span>
        ) : (
          lowStock && <span className="rounded-full bg-gold/15 px-3 py-1 text-[0.795rem] font-bold text-[#8a5a14]">Only {p.stock} left</span>
        )}
      </motion.div>

      <motion.ul {...rise(0.18)} className="mt-7 lg:mt-[clamp(0.85rem,2.6svh,1.75rem)] grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-0" aria-label="Highlights">
        {features.map(({ label, icon: Icon }, n) => (
          <li
            key={label}
            className={`flex flex-col items-center gap-2 text-center sm:flex-row sm:gap-3 sm:text-left ${
              n > 0 ? "sm:ml-5 sm:border-l sm:border-forest-600/15 sm:pl-5" : ""
            }`}
          >
            <span className="grid size-12 shrink-0 place-items-center rounded-full border-[1.5px] border-forest-600 text-forest-600">
              <Icon className="size-[22px]" strokeWidth={1.6} aria-hidden />
            </span>
            <span className="text-[0.855rem] font-semibold leading-tight text-ink">{label}</span>
          </li>
        ))}
      </motion.ul>

      <motion.div {...rise(0.22)} className="mt-7 border-t border-forest-600/12 pt-6 lg:mt-[clamp(0.85rem,2.6svh,1.75rem)] lg:pt-[clamp(0.75rem,2.4svh,1.5rem)]">
        {p.pack && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <p id="pack-label" className="text-[0.925rem] font-semibold text-ink">Pack Size</p>
            <div role="radiogroup" aria-labelledby="pack-label" className="flex flex-wrap gap-3">
              <span
                role="radio"
                aria-checked="true"
                tabIndex={0}
                className="inline-flex min-h-12 items-center rounded-full bg-forest-700 px-7 text-[0.895rem] font-semibold text-white shadow-[0_10px_20px_-12px_rgba(10,57,25,0.7)]"
              >
                {p.pack}
              </span>
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3 lg:mt-[clamp(0.75rem,2.4svh,1.5rem)]">
          {p.inStock && room > 0 ? (
            <>
              <QtyStepper value={q} max={room} onChange={setQty} label={p.name} />
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  addToCart(p.id, q);
                  setQty(1);
                }}
                className="inline-flex min-h-14 min-w-0 flex-1 cursor-pointer items-center justify-center gap-2.5 whitespace-nowrap rounded-full bg-forest-700 px-6 text-[0.975rem] font-semibold text-white shadow-[0_14px_28px_-14px_rgba(10,57,25,0.8)] transition-colors hover:bg-forest-800"
              >
                <ShoppingCart className="size-[20px]" aria-hidden />
                Add to Cart
              </motion.button>
              <button
                type="button"
                onClick={() => {
                  addToCart(p.id, q);
                  router.push("/checkout");
                }}
                className="inline-flex min-h-14 cursor-pointer items-center justify-center rounded-full border-[1.5px] border-forest-600 bg-leaf/15 px-9 text-[0.975rem] font-semibold text-forest-800 transition-colors hover:bg-forest-600 hover:text-white max-sm:w-full"
              >
                Buy Now
              </button>
            </>
          ) : (
            <span className="inline-flex min-h-14 flex-1 items-center justify-center rounded-full bg-ink/8 font-bold text-muted">
              {p.inStock ? "Maximum quantity in cart" : "Out of stock"}
            </span>
          )}
        </div>

        {inCart > 0 && (
          <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.825rem]">
            <span className="inline-flex items-center gap-1.5 font-semibold text-forest-600">
              <Check className="size-4" aria-hidden /> {inCart} in your cart
            </span>
            <Link href="/cart" className="font-bold text-forest-700 underline decoration-gold-soft underline-offset-4 hover:text-forest-500">
              View cart
            </Link>
          </p>
        )}
      </motion.div>

      <motion.ul
        {...rise(0.26)}
        className="mt-7 lg:mt-[clamp(0.85rem,2.6svh,1.75rem)] grid grid-cols-3 rounded-3xl bg-white/55 px-3 py-4 lg:py-[clamp(0.6rem,1.8svh,1.25rem)] shadow-[0_18px_40px_-30px_rgba(60,40,10,0.5)] ring-1 ring-forest-600/8 backdrop-blur-sm sm:px-5 sm:py-5"
        aria-label="Our promise"
      >
        {ASSURANCES.map(({ icon: Icon, title, body }, n) => (
          <li
            key={title}
            className={`flex flex-col items-center justify-center gap-2 px-1.5 text-center sm:flex-row sm:gap-2.5 sm:text-left ${n > 0 ? "border-l border-forest-600/12" : ""}`}
          >
            <Icon className="size-8 shrink-0 text-forest-600 sm:size-9" strokeWidth={1.4} aria-hidden />
            <span className="text-[0.755rem] leading-snug text-ink sm:text-[0.825rem]">
              {title}
              <br />
              <span className="sm:whitespace-nowrap">{body}</span>
            </span>
          </li>
        ))}
      </motion.ul>
    </div>
  );
}

/* ---------------------------------------------------------------- Sticky bar (phones) */

/**
 * Below lg, once the buy box has scrolled away, keep price + Add to Cart in
 * reach. Hidden again while the footer is on screen so it never covers it.
 */
function StickyBuyBar({ product: p }: { product: Product }) {
  const { cart } = useShop();
  const line = cart.find((l) => l.id === p.id);
  const [show, setShow] = useState(false);
  const state = useRef({ buyGone: false, footer: false });
  const bar = useRef<HTMLDivElement>(null);

  // Tell the toaster how tall the bar is, so "Added to cart" sits above it.
  useEffect(() => {
    const root = document.documentElement;
    const h = show && bar.current ? bar.current.offsetHeight : 0;
    root.style.setProperty("--sticky-bar-h", `${h}px`);
    return () => root.style.setProperty("--sticky-bar-h", "0px");
  }, [show]);

  useEffect(() => {
    const box = document.getElementById("buy-box");
    const footer = document.querySelector("footer");
    if (!box) return;
    const sync = () => setShow(state.current.buyGone && !state.current.footer);
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.target === box) state.current.buyGone = !e.isIntersecting && e.boundingClientRect.top < 0;
        else state.current.footer = e.isIntersecting;
      }
      sync();
    });
    io.observe(box);
    if (footer) io.observe(footer);
    return () => io.disconnect();
  }, []);

  if (!p.inStock) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          ref={bar}
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ duration: 0.35, ease: EASE }}
          className="fixed inset-x-0 bottom-0 z-40 border-t border-forest-600/12 bg-paper/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-12px_30px_-18px_rgba(10,57,25,0.45)] backdrop-blur lg:hidden"
        >
          <div className="mx-auto flex max-w-[1320px] items-center gap-3 px-4 py-2.5">
            <span className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-sand">
              <Image src={p.img} alt="" fill sizes="48px" className="object-cover" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[0.825rem] font-bold text-forest-700">{p.name}</span>
              <span className="block text-[0.775rem] text-muted">
                <b className="text-ink">{rupees(p.price)}</b> / {p.pack}
              </span>
            </span>
            {line ? (
              <QtyStepper value={line.qty} min={0} max={maxQty(p)} onChange={(n) => setCartQty(p.id, n)} label={p.name} size="sm" />
            ) : (
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => addToCart(p.id, 1)}
                className="inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-2 rounded-full bg-forest-600 px-5 font-bold text-white transition-colors hover:bg-forest-700"
              >
                <ShoppingCart className="size-[18px]" aria-hidden />
                Add
              </motion.button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------------------------------------------------------------- Details */

function Details({ product: p, detail: d }: { product: Product; detail?: ProductDetail }) {
  const cat = categoryOf(p.category);
  const specs: [string, string][] = [
    ["Category", cat?.name ?? ""],
    ["Pack", p.pack],
    ["Net weight", p.weight],
    ["Pack size", d?.dims ?? ""],
    ["SKU", p.sku],
    ["Vendor", vendorOf(p.slug).name],
    ["Availability", p.inStock ? (p.stock ? `${p.stock} in stock` : "In stock") : "Out of stock"],
    ["Delivery", "Flat ₹50 per order"],
  ];

  return (
    <section aria-labelledby="pd-about" className="mx-auto max-w-[1320px] px-5 pb-4 pt-12 md:px-8 md:pb-6 md:pt-16">
      <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-14">
        <div>
          <h2 id="pd-about" className="font-serif text-[1.555rem] font-bold text-forest-600 md:text-[1.975rem]">
            About this product
          </h2>
          <p lang="ta" className="mt-1 font-tamil text-forest-800">
            பொருள் விவரம்
          </p>

          {p.summary && <p className="mt-6 max-w-[62ch] text-pretty text-[0.975rem] leading-relaxed text-ink/85">{p.summary}</p>}

          {d && (
          <div lang="ta" className="mt-6 font-tamil-sans text-[0.955rem] leading-[1.85] text-ink/85">
            <p className="max-w-[62ch]">{d.intro}</p>

            <h3 className="mt-8 flex flex-wrap items-center gap-x-2 gap-y-1 font-tamil text-[1.117rem] font-bold text-forest-700">
              <Sparkles className="size-5 text-gold" strokeWidth={1.8} aria-hidden />
              சிறப்பம்சங்கள்
              <span lang="en" className="whitespace-nowrap font-sans text-[0.771rem] font-semibold uppercase tracking-[0.14em] text-muted">
                Highlights
              </span>
            </h3>
            <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
              {d.highlights.map((h) => (
                <li key={h} className="flex gap-3 rounded-2xl bg-white p-3.5 leading-relaxed ring-1 ring-forest-600/10">
                  <span className="mt-1 grid size-5 shrink-0 place-items-center rounded-full bg-forest-600 text-white">
                    <Check className="size-3" strokeWidth={3} aria-hidden />
                  </span>
                  {h}
                </li>
              ))}
            </ul>

            <div className="mt-8 rounded-3xl bg-sage/70 p-5 ring-1 ring-forest-600/10 md:p-6">
              <h3 className="flex flex-wrap items-center gap-x-2 gap-y-1 font-tamil text-[1.063rem] font-bold text-forest-700">
                <ChefHat className="size-5 text-gold" strokeWidth={1.8} aria-hidden />
                {d.method.ta}
                <span lang="en" className="whitespace-nowrap font-sans text-[0.771rem] font-semibold uppercase tracking-[0.14em] text-muted">
                  {d.method.en}
                </span>
              </h3>
              <p className="mt-2">{d.method.text}</p>
              {d.storage && (
                <p className="mt-3 flex gap-2 border-t border-forest-600/10 pt-3 text-ink/75">
                  <Package className="mt-1.5 size-4 shrink-0 text-forest-600" strokeWidth={1.8} aria-hidden />
                  {d.storage}
                </p>
              )}
            </div>
          </div>
          )}
        </div>

        <aside aria-labelledby="pd-specs" className="lg:pt-2">
          <div className="space-y-5 lg:sticky lg:top-[92px]">
          <div className="rounded-3xl bg-white p-6 shadow-[0_18px_40px_-30px_rgba(60,40,10,0.5)] ring-1 ring-forest-600/10 md:p-7">
            <h2 id="pd-specs" className="font-serif text-[1.225rem] font-bold text-forest-700">
              Product details
            </h2>
            <dl className="mt-4 divide-y divide-forest-600/10 text-[0.939rem]">
              {specs
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 py-2.5">
                    <dt className="text-muted">{k}</dt>
                    <dd className="text-right font-semibold text-ink">{v}</dd>
                  </div>
                ))}
            </dl>
          </div>
          <VendorCard product={p} />
          </div>
        </aside>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- Vendor */

/** One line under the name: who sells it, with a way into their store. */
function SoldBy({ product: p }: { product: Product }) {
  const v = vendorOf(p.slug);
  return (
    <motion.p {...rise(0.12)} className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.9rem] text-muted">
      Sold by
      <Link href={`/store/${v.slug}`} className="inline-flex items-center gap-1.5 font-semibold text-forest-700 hover:text-forest-500">
        <VendorAvatar vendor={v} size="xs" />
        {v.name}
      </Link>
      <span aria-hidden>·</span>
      <Link
        href={`/store/${v.slug}`}
        className="group inline-flex items-center gap-1 font-semibold text-forest-700 underline decoration-gold-soft underline-offset-4 hover:text-forest-500"
      >
        Visit store
        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
      </Link>
    </motion.p>
  );
}

/** Vendor information, as in the original product page's "Vendor Info" tab. */
function VendorCard({ product: p }: { product: Product }) {
  const v = vendorOf(p.slug);
  const count = PRODUCTS.filter((x) => PRODUCT_VENDOR[x.slug] === v.slug).length;
  return (
    <section aria-labelledby="pd-vendor" className="rounded-3xl bg-white p-6 shadow-[0_18px_40px_-30px_rgba(60,40,10,0.5)] ring-1 ring-forest-600/10 md:p-7">
      <h2 id="pd-vendor" className="font-serif text-[1.225rem] font-bold text-forest-700">
        Sold by
      </h2>
      <div className="mt-4 flex items-center gap-4">
        <VendorAvatar vendor={v} size="md" />
        <div className="min-w-0">
          <p className="text-[1.1rem] font-bold leading-tight text-ink">{v.name}</p>
          <p lang="ta" className="text-[0.95rem] text-forest-800">
            {v.ta}
          </p>
          <p className="mt-0.5 text-[0.84rem] text-muted">
            {count} products · Since {monthYear(v.since)}
          </p>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Link
          href={`/store/${v.slug}`}
          className="group inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-forest-700 px-6 font-semibold text-white transition-colors hover:bg-forest-800"
        >
          Visit store
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
        </Link>
        <a
          href={`tel:${v.tel}`}
          className="inline-flex min-h-12 items-center justify-center rounded-full border-[1.5px] border-forest-600/30 px-5 text-[0.9rem] font-semibold text-forest-800 transition-colors hover:border-forest-600"
        >
          Call {v.phone}
        </a>
      </div>
    </section>
  );
}
