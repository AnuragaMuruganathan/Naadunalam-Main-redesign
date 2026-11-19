"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Check, ShoppingCart, X } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { categoryOf } from "@/lib/shop";
import { rupees } from "@/lib/format";
import { addToCart, maxQty, useShop } from "@/lib/store";
import QtyStepper from "./QtyStepper";
import { WishButton } from "./ProductCard";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Modal product detail, opened from a card's "Quick view". */
export default function QuickView({ product, onClose }: { product: Product | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {product && <Dialog key={product.id} product={product} onClose={onClose} />}
    </AnimatePresence>
  );
}

function Dialog({ product: p, onClose }: { product: Product; onClose: () => void }) {
  const panel = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const [qty, setQty] = useState(1);
  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  });
  const { cart } = useShop();
  const inCart = cart.find((l) => l.id === p.id)?.qty ?? 0;
  const cat = categoryOf(p.category);
  const max = Math.max(1, maxQty(p) - inCart);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const lenis = (window as unknown as { __lenis?: { stop: () => void; start: () => void } }).__lenis;
    lenis?.stop();
    document.documentElement.style.overflow = "hidden";
    closeBtn.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close.current();
      if (e.key !== "Tab" || !panel.current) return;
      const f = panel.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      lenis?.start();
      document.documentElement.style.overflow = "";
      opener?.focus?.();
    };
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
    >
      <div aria-hidden className="absolute inset-0 bg-forest-950/55 backdrop-blur-[2px]" onClick={onClose} />
      <motion.div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`qv-${p.id}`}
        data-lenis-prevent
        initial={{ y: 40, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 24, opacity: 0, transition: { duration: 0.18 } }}
        transition={{ duration: 0.45, ease: EASE }}
        className="relative grid max-h-[92svh] w-full max-w-[920px] overflow-y-auto rounded-t-3xl bg-paper shadow-[0_40px_80px_-30px_rgba(7,43,18,0.6)] sm:rounded-3xl md:grid-cols-[1fr_1.05fr]"
      >
        <button
          ref={closeBtn}
          type="button"
          onClick={onClose}
          aria-label="Close quick view"
          className="absolute right-3 top-3 z-10 grid size-11 cursor-pointer place-items-center rounded-full bg-white/95 text-ink shadow ring-1 ring-forest-600/10 transition-colors hover:text-forest-600"
        >
          <X className="size-5" aria-hidden />
        </button>

        <div className="relative aspect-[4/3] bg-sand md:aspect-auto md:min-h-[460px]">
          <Image src={p.img} alt={p.name} fill sizes="(min-width: 768px) 450px, 100vw" className="object-cover" />
        </div>

        <div className="flex flex-col p-6 md:p-8">
          {cat && (
            <Link
              href={`/shop?category=${cat.slug}`}
              onClick={onClose}
              className="w-fit text-[0.72rem] font-bold uppercase tracking-[0.16em] text-gold hover:text-forest-600"
            >
              {cat.name}
            </Link>
          )}
          <h2 id={`qv-${p.id}`} className="mt-2 pr-10 font-serif text-[1.6rem] font-bold leading-tight text-forest-700 md:text-[1.85rem]">
            {p.name}
          </h2>
          {p.ta && (
            <p lang="ta" className="mt-1 font-tamil text-[1.02rem] text-forest-800">
              {p.ta}
            </p>
          )}

          <p className="mt-4 flex items-baseline gap-2">
            <span className="font-serif text-[1.75rem] font-bold text-ink">{rupees(p.price)}</span>
            {p.pack && <span className="text-muted">/ {p.pack}</span>}
          </p>

          {p.summary && <p className="mt-4 text-pretty leading-relaxed text-ink/85">{p.summary}</p>}

          <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2 rounded-2xl bg-cream p-4 text-sm">
            <div>
              <dt className="text-muted">Availability</dt>
              <dd className={`font-bold ${p.inStock ? "text-forest-600" : "text-[#b3261e]"}`}>
                {p.inStock ? (p.stock ? `${p.stock} in stock` : "In stock") : "Out of stock"}
              </dd>
            </div>
            {p.pack && (
              <div>
                <dt className="text-muted">Pack</dt>
                <dd className="font-bold text-ink">{p.pack}</dd>
              </div>
            )}
            {p.sku && (
              <div>
                <dt className="text-muted">SKU</dt>
                <dd className="font-semibold text-ink">{p.sku}</dd>
              </div>
            )}
            <div>
              <dt className="text-muted">Delivery</dt>
              <dd className="font-semibold text-ink">Flat ₹50 / order</dd>
            </div>
          </dl>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {p.inStock && inCart < maxQty(p) && (
              <>
                <QtyStepper value={Math.min(qty, max)} max={max} onChange={setQty} label={p.name} />
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    addToCart(p.id, Math.min(qty, max));
                    setQty(1);
                  }}
                  className="inline-flex min-h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-forest-600 px-6 font-bold text-white transition-colors hover:bg-forest-700"
                >
                  <ShoppingCart className="size-[18px]" aria-hidden />
                  Add to Cart
                </motion.button>
              </>
            )}
            <WishButton product={p} className="size-12" />
          </div>

          <Link
            href={`/shop/${p.slug}`}
            onClick={onClose}
            className="mt-5 w-fit font-bold text-forest-700 underline decoration-gold-soft underline-offset-4 hover:text-forest-500"
          >
            View full details
          </Link>

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
        </div>
      </motion.div>
    </motion.div>
  );
}
