"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, Check, ChefHat, Package, ShoppingCart, Sparkles } from "lucide-react";
import type { Product } from "@/lib/catalog";
import type { ProductDetail } from "@/lib/productDetails";
import { categoryOf } from "@/lib/shop";
import { rupees } from "@/lib/format";
import { addToCart, maxQty, useShop } from "@/lib/store";
import QtyStepper from "@/components/shop/QtyStepper";
import { WishButton } from "@/components/shop/ProductCard";

const EASE = [0.22, 1, 0.36, 1] as const;
const rise = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: EASE },
});

export default function ProductView({ product: p, detail }: { product: Product; detail?: ProductDetail }) {
  const cat = categoryOf(p.category);
  const gallery = detail?.gallery.length ? detail.gallery : [p.img];

  return (
    <>
      <section className="grain bg-ivory">
        <div className="mx-auto max-w-[1320px] px-5 pb-12 pt-5 md:px-8 md:pb-16 md:pt-7">
          <Link
            href={cat ? `/shop?category=${cat.slug}` : "/shop"}
            className="group inline-flex min-h-11 items-center gap-2 text-[0.9rem] font-semibold text-muted transition-colors hover:text-forest-600"
          >
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" aria-hidden />
            Back to {cat ? cat.name : "shop"}
          </Link>

          <div className="mt-3 grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
            <Gallery images={gallery} name={p.name} pack={p.pack} />
            <BuyBox product={p} />
          </div>
        </div>
      </section>

      {detail && <Details product={p} detail={detail} />}
    </>
  );
}

/* ---------------------------------------------------------------- Gallery */

function Gallery({ images, name, pack }: { images: string[]; name: string; pack: string }) {
  const [i, setI] = useState(0);
  return (
    <motion.div {...rise()} className="md:sticky md:top-[110px] md:self-start">
      <div className="relative aspect-square overflow-hidden rounded-3xl bg-sand shadow-[0_24px_50px_-30px_rgba(60,40,10,0.6)] ring-1 ring-forest-600/10">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={images[i]}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <Image
              src={images[i]}
              alt={images.length > 1 ? `${name}, photo ${i + 1} of ${images.length}` : name}
              fill
              preload={i === 0}
              sizes="(min-width: 1320px) 640px, (min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>
        {pack && (
          <span className="absolute left-4 top-4 rounded-full bg-forest-900/80 px-3 py-1.5 text-[0.8rem] font-bold text-white backdrop-blur-sm">
            {pack}
          </span>
        )}
      </div>

      {images.length > 1 && (
        <ul className="mt-3 flex gap-3" aria-label="Product photos">
          {images.map((src, n) => (
            <li key={src}>
              <button
                type="button"
                onClick={() => setI(n)}
                aria-pressed={n === i}
                aria-label={`Show photo ${n + 1}`}
                className={`relative block size-20 cursor-pointer overflow-hidden rounded-2xl bg-sand ring-2 transition-[box-shadow,opacity] ${
                  n === i ? "ring-forest-600" : "opacity-70 ring-transparent hover:opacity-100"
                }`}
              >
                <Image src={src} alt="" fill sizes="80px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}

/* ---------------------------------------------------------------- Buy box */

function BuyBox({ product: p }: { product: Product }) {
  const router = useRouter();
  const cat = categoryOf(p.category);
  const { cart } = useShop();
  const inCart = cart.find((l) => l.id === p.id)?.qty ?? 0;
  const room = Math.max(0, maxQty(p) - inCart);
  const [qty, setQty] = useState(1);
  const q = Math.min(qty, Math.max(1, room));
  const lowStock = p.inStock && p.stock !== null && p.stock <= 10;

  return (
    <div className="flex flex-col">
      {cat && (
        <motion.div {...rise(0.05)}>
          <Link
            href={`/shop?category=${cat.slug}`}
            className="text-[0.74rem] font-bold uppercase tracking-[0.18em] text-gold transition-colors hover:text-forest-600"
          >
            {cat.name}
          </Link>
        </motion.div>
      )}
      <motion.h1
        {...rise(0.1)}
        className="mt-2 text-balance font-serif text-[2rem] font-bold leading-[1.15] text-forest-700 md:text-[2.5rem]"
      >
        {p.name}
      </motion.h1>
      {p.ta && (
        <motion.p {...rise(0.14)} lang="ta" className="mt-1.5 font-tamil text-[1.1rem] text-forest-800 md:text-[1.2rem]">
          {p.ta}
        </motion.p>
      )}

      <motion.div {...rise(0.18)} className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
        <p className="flex items-baseline gap-2">
          <span className="font-serif text-[2rem] font-bold leading-none text-ink">{rupees(p.price)}</span>
          {p.onSale && p.regularPrice > p.price && <s className="text-muted">{rupees(p.regularPrice)}</s>}
          {p.pack && <span className="text-muted">/ {p.pack}</span>}
        </p>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.82rem] font-bold ${
            p.inStock ? "bg-forest-600/10 text-forest-700" : "bg-[#b3261e]/10 text-[#b3261e]"
          }`}
        >
          <span aria-hidden className={`size-1.5 rounded-full ${p.inStock ? "bg-forest-500" : "bg-[#b3261e]"}`} />
          {p.inStock ? (lowStock ? `Only ${p.stock} left` : "In stock") : "Out of stock"}
        </span>
      </motion.div>

      {p.summary && (
        <motion.p {...rise(0.22)} className="mt-5 max-w-[56ch] text-pretty text-[1.02rem] leading-relaxed text-ink/85">
          {p.summary}
        </motion.p>
      )}

      <motion.div {...rise(0.26)} className="mt-7 rounded-3xl bg-white p-5 shadow-[0_18px_40px_-28px_rgba(60,40,10,0.55)] ring-1 ring-forest-600/10 md:p-6">
        {p.inStock && room > 0 ? (
          <>
            <div className="flex items-center gap-3">
              <QtyStepper value={q} max={room} onChange={setQty} label={p.name} />
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  addToCart(p.id, q);
                  setQty(1);
                }}
                className="inline-flex min-h-12 min-w-0 flex-1 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full bg-forest-600 px-3 font-bold min-[360px]:px-6 text-white transition-colors hover:bg-forest-700"
              >
                <ShoppingCart className="size-[18px] max-[359px]:hidden" aria-hidden />
                Add to Cart
              </motion.button>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  addToCart(p.id, q);
                  router.push("/checkout");
                }}
                className="inline-flex min-h-12 flex-1 cursor-pointer items-center justify-center rounded-full border-2 border-forest-600 font-bold text-forest-700 transition-colors hover:bg-forest-600 hover:text-white"
              >
                Buy Now
              </button>
              <WishButton product={p} className="size-12 shrink-0" />
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <span className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full bg-ink/8 font-bold text-muted">
              {p.inStock ? "Maximum quantity in cart" : "Out of stock"}
            </span>
            <WishButton product={p} className="size-12" />
          </div>
        )}

        {inCart > 0 && (
          <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <span className="inline-flex items-center gap-1.5 font-semibold text-forest-600">
              <Check className="size-4" aria-hidden /> {inCart} in your cart
            </span>
            <Link href="/cart" className="font-bold text-forest-700 underline decoration-gold-soft underline-offset-4 hover:text-forest-500">
              View cart
            </Link>
          </p>
        )}

        <p className="mt-4 border-t border-forest-600/10 pt-4 text-[0.86rem] text-muted">
          Flat ₹50 delivery across Tamil Nadu · Cash on delivery available
        </p>
      </motion.div>
    </div>
  );
}

/* ---------------------------------------------------------------- Details */

function Details({ product: p, detail: d }: { product: Product; detail: ProductDetail }) {
  const cat = categoryOf(p.category);
  const specs: [string, string][] = [
    ["Category", cat?.name ?? ""],
    ["Pack", p.pack],
    ["Net weight", p.weight],
    ["Pack size", d.dims],
    ["SKU", p.sku],
    ["Availability", p.inStock ? (p.stock ? `${p.stock} in stock` : "In stock") : "Out of stock"],
    ["Delivery", "Flat ₹50 per order"],
  ];

  return (
    <section aria-labelledby="pd-about" className="mx-auto max-w-[1320px] px-5 py-12 md:px-8 md:py-16">
      <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-14">
        <div>
          <h2 id="pd-about" className="font-serif text-[1.6rem] font-bold text-forest-600 md:text-[2rem]">
            About this product
          </h2>
          <p lang="ta" className="mt-1 font-tamil text-forest-800">
            பொருள் விவரம்
          </p>

          <div lang="ta" className="mt-6 font-tamil-sans text-[1rem] leading-[1.85] text-ink/85">
            <p className="max-w-[62ch]">{d.intro}</p>

            <h3 className="mt-8 flex flex-wrap items-center gap-x-2 gap-y-1 font-tamil text-[1.15rem] font-bold text-forest-700">
              <Sparkles className="size-5 text-gold" strokeWidth={1.8} aria-hidden />
              சிறப்பம்சங்கள்
              <span lang="en" className="whitespace-nowrap font-sans text-[0.8rem] font-semibold uppercase tracking-[0.14em] text-muted">
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
              <h3 className="flex flex-wrap items-center gap-x-2 gap-y-1 font-tamil text-[1.1rem] font-bold text-forest-700">
                <ChefHat className="size-5 text-gold" strokeWidth={1.8} aria-hidden />
                {d.method.ta}
                <span lang="en" className="whitespace-nowrap font-sans text-[0.8rem] font-semibold uppercase tracking-[0.14em] text-muted">
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
        </div>

        <aside aria-labelledby="pd-specs" className="lg:pt-2">
          <div className="rounded-3xl bg-white p-6 shadow-[0_18px_40px_-30px_rgba(60,40,10,0.5)] ring-1 ring-forest-600/10 md:p-7 lg:sticky lg:top-[110px]">
            <h2 id="pd-specs" className="font-serif text-[1.25rem] font-bold text-forest-700">
              Product details
            </h2>
            <dl className="mt-4 divide-y divide-forest-600/10 text-[0.95rem]">
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
        </aside>
      </div>
    </section>
  );
}
