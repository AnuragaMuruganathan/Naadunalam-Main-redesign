"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, Heart, ShoppingBasket, Sprout, Trash2, Truck, X } from "lucide-react";
import Perks from "@/components/shop/Perks";
import Recommendations from "@/components/shop/Recommendations";
import QtyStepper from "@/components/shop/QtyStepper";
import { Leaf } from "@/components/Leaf";
import type { Product } from "@/lib/catalog";
import { categoryOf } from "@/lib/shop";
import { rupees } from "@/lib/format";
import { cartSummary, clearCart, maxQty, removeFromCart, restore, setQty, toggleWishlist, useShop, type CartLine } from "@/lib/store";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function CartView() {
  const { cart, wishlist, hydrated } = useShop();
  const { lines, items, subtotal, shipping, total } = cartSummary(cart);
  const [undo, setUndo] = useState<{ text: string; cart: CartLine[] } | null>(null);

  const remove = (id: number, name: string) => {
    setUndo({ text: `Removed ${name}.`, cart });
    removeFromCart(id);
  };
  const emptyCart = () => {
    setUndo({ text: "Your cart was emptied.", cart });
    clearCart();
  };

  return (
    <>
      {/*
       * Banner + cart fill exactly one screen below the header (96px phones,
       * 104px from md). The cards overlap the foot of the banner; a long cart
       * scrolls inside its own list so the summary always stays in view.
       */}
      <div className="relative isolate flex h-[calc(100svh-96px)] min-h-[560px] flex-col overflow-hidden md:h-[calc(100svh-104px)]">
        <CartBanner />

        {/* Faded fields along the foot */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[140px] opacity-35 [mask-image:linear-gradient(to_bottom,transparent,black_70%)]">
          <Image src="/images/pdp-fields.webp" alt="" fill sizes="100vw" className="object-cover object-[center_70%]" />
        </div>

        <section
          aria-label="Cart"
          className="relative mx-auto -mt-5 flex md:-mt-[clamp(2.5rem,7svh,4.5rem)] min-h-0 w-full max-w-[1320px] flex-1 flex-col px-4 pb-[clamp(0.75rem,2.5svh,1.5rem)] sm:px-5 md:px-8"
        >
          {!hydrated ? (
            <div className="grid min-h-0 flex-1 gap-6 lg:grid-cols-[1fr_360px]" aria-hidden>
              <div className="animate-pulse rounded-[1.75rem] bg-white/70" />
              <div className="animate-pulse rounded-[1.75rem] bg-white/70 max-lg:hidden" />
            </div>
          ) : lines.length === 0 ? (
            <EmptyCart />
          ) : (
            <div className="flex min-h-0 flex-1 flex-col gap-3 lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-7">
              {/* ---------------- Items ---------------- */}
              <div className="flex min-h-0 flex-1 flex-col lg:max-h-full">
                <div aria-live="polite" className="shrink-0">
                  <AnimatePresence>
                    {undo && (
                      <motion.p
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mb-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl bg-white/90 px-4 py-2 text-sm text-forest-800 shadow-sm ring-1 ring-forest-600/10"
                      >
                        <Check className="size-4 shrink-0" aria-hidden />
                        <span className="font-semibold">{undo.text}</span>
                        <button
                          type="button"
                          onClick={() => {
                            restore({ cart: undo.cart });
                            setUndo(null);
                          }}
                          className="cursor-pointer font-bold underline underline-offset-4"
                        >
                          Undo
                        </button>
                        <button type="button" onClick={() => setUndo(null)} aria-label="Dismiss message" className="ml-auto grid size-8 cursor-pointer place-items-center rounded-full hover:bg-forest-600/10">
                          <X className="size-4" aria-hidden />
                        </button>
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex min-h-0 flex-col rounded-[1.75rem] bg-white/55 p-2 shadow-[0_24px_50px_-30px_rgba(60,40,10,0.5)] ring-1 ring-forest-600/8 backdrop-blur-md sm:p-2.5">
                  <ul data-lenis-prevent className="min-h-0 space-y-2 overflow-y-auto overscroll-contain sm:space-y-2.5">
                    <AnimatePresence initial={false}>
                      {lines.map(({ id, qty, product: p }) => (
                        <motion.li
                          key={id}
                          layout
                          exit={{ opacity: 0, x: -30, transition: { duration: 0.25 } }}
                          transition={{ duration: 0.4, ease: EASE }}
                        >
                          <CartRow
                            product={p}
                            qty={qty}
                            saved={wishlist.includes(id)}
                            onQty={(n) => setQty(id, n)}
                            onSave={() => !wishlist.includes(id) && toggleWishlist(id)}
                            onRemove={() => remove(id, p.name)}
                          />
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ul>
                </div>

                <div className="mt-2 flex shrink-0 items-center justify-between gap-3 px-1 sm:mt-3">
                  <Link href="/shop" className="inline-flex min-h-10 items-center gap-2 text-[0.9rem] font-semibold text-forest-800 transition-colors hover:text-forest-600 sm:text-[0.95rem]">
                    <ArrowLeft className="size-4" aria-hidden /> Continue Shopping
                  </Link>
                  <button
                    type="button"
                    onClick={emptyCart}
                    className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full px-2 text-[0.9rem] font-semibold text-ink transition-colors hover:text-[#b3261e] sm:text-[0.95rem]"
                  >
                    <Trash2 className="size-4" aria-hidden /> Empty Cart
                  </button>
                </div>
              </div>

              {/* ---------------- Summary ---------------- */}
              <aside aria-labelledby="summary-title" className="shrink-0 lg:max-h-full lg:min-h-0">
                <div
                  data-lenis-prevent
                  className="rounded-[1.75rem] bg-white/85 p-4 shadow-[0_28px_60px_-32px_rgba(60,40,10,0.55)] ring-1 ring-forest-600/8 backdrop-blur-md sm:p-5 lg:max-h-full lg:overflow-y-auto lg:p-6"
                >
                  <h2 id="summary-title" className="text-[1.2rem] font-bold text-forest-700 max-lg:sr-only lg:text-[1.4rem]">
                    Order Summary
                  </h2>
                  <span aria-hidden className="mt-2 flex items-center max-lg:hidden">
                    <span className="h-px w-40 bg-gradient-to-r from-forest-600/50 to-forest-600/20" />
                    <Leaf className="-ml-0.5 h-3.5 w-5" />
                  </span>

                  <dl className="space-y-1.5 text-[0.9rem] lg:mt-5 lg:space-y-2.5 lg:text-[0.95rem]">
                    <div className="flex justify-between gap-4">
                      <dt className="text-ink/80">Subtotal ({items} {items === 1 ? "item" : "items"})</dt>
                      <dd className="font-semibold tabular-nums text-ink">{rupees(subtotal)}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt>
                        <span className="font-semibold text-ink">Delivery</span>
                        <span className="block text-[0.78rem] text-muted max-lg:hidden">Flat rate, per order</span>
                      </dt>
                      <dd className="font-semibold tabular-nums text-ink">{shipping ? rupees(shipping) : "—"}</dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-4 border-t border-forest-600/12 pt-2.5 lg:pt-3.5">
                      <dt className="text-[1.1rem] font-bold text-forest-800 lg:text-[1.25rem]">Total</dt>
                      <dd className="text-[1.35rem] font-bold tabular-nums text-forest-800 lg:text-[1.55rem]">{rupees(total)}</dd>
                    </div>
                  </dl>

                  <Link
                    href="/checkout"
                    className="group mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-full bg-gradient-to-b from-forest-600 to-forest-800 px-6 text-[0.98rem] font-semibold text-white shadow-[0_14px_28px_-14px_rgba(10,57,25,0.85)] transition-[filter] hover:brightness-110 lg:mt-5"
                  >
                    Proceed to Checkout
                    <ArrowRight className="size-[18px] transition-transform group-hover:translate-x-1" aria-hidden />
                  </Link>

                  {/* Phones: one line; larger screens: the note card */}
                  <p className="mt-2 text-center text-xs text-muted lg:hidden">
                    <b className="text-forest-700">Cash on Delivery</b> — pay when your order arrives.
                  </p>
                  <div className="relative mt-4 flex items-center gap-3.5 overflow-hidden rounded-2xl bg-leaf/12 px-4 py-3.5 ring-1 ring-leaf/20 max-lg:hidden">
                    <Truck className="size-7 shrink-0 text-forest-700" strokeWidth={1.6} aria-hidden />
                    <span className="min-w-0">
                      <span className="block text-[0.93rem] font-bold text-forest-800">Cash on Delivery</span>
                      <span className="block text-[0.83rem] text-ink/75">Pay when your order arrives.</span>
                    </span>
                    <Sprout aria-hidden className="absolute -bottom-1 right-2 size-10 text-leaf/30" strokeWidth={1.3} />
                  </div>
                </div>
              </aside>
            </div>
          )}
        </section>
      </div>

      <Perks />
      <div className="pt-10 md:pt-14">
        <Recommendations exclude={hydrated ? cart.map((l) => l.id) : []} />
      </div>
    </>
  );
}

/* ---------------------------------------------------------------- Banner */

function CartBanner() {
  return (
    <section aria-labelledby="cart-title" className="relative isolate h-[clamp(112px,15svh,140px)] shrink-0 overflow-hidden bg-sand md:h-[clamp(160px,24svh,250px)]">
      <picture>
        <source media="(min-width: 768px)" srcSet="/images/shop-banner.webp" />
        <img src="/images/shop-banner-m.webp" alt="" className="absolute inset-0 -z-10 size-full object-cover object-[78%_60%] md:object-[right_62%]" />
      </picture>
      {/* Keeps the title readable over the haze, and fades into the page below */}
      <span
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(252,245,237,0.85)_0%,rgba(252,245,237,0.45)_36%,rgba(252,245,237,0)_60%)]"
      />
      <span aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-1/3 bg-gradient-to-b from-transparent to-cream/70" />
      <div className="mx-auto max-w-[1320px] px-4 pt-[clamp(0.9rem,3.5svh,2.25rem)] sm:px-5 md:px-8">
        <h1 id="cart-title" className="text-[1.75rem] font-bold leading-none tracking-[-0.01em] text-forest-700 md:text-[clamp(2.4rem,5svh,3.1rem)]">
          Your Cart
        </h1>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- Row */

function CartRow({
  product: p,
  qty,
  saved,
  onQty,
  onSave,
  onRemove,
}: {
  product: Product;
  qty: number;
  saved: boolean;
  onQty: (n: number) => void;
  onSave: () => void;
  onRemove: () => void;
}) {
  const cat = categoryOf(p.category);
  const action = "inline-flex min-h-9 items-center gap-1.5 text-[0.88rem] font-semibold transition-colors";
  return (
    <div className="flex gap-3 rounded-2xl bg-white/95 p-2.5 shadow-[0_10px_24px_-20px_rgba(60,40,10,0.6)] ring-1 ring-forest-600/8 sm:gap-5 sm:p-3.5">
      <Link href={`/shop/${p.slug}`} tabIndex={-1} aria-hidden className="relative size-[72px] shrink-0 overflow-hidden rounded-xl bg-sand sm:size-[104px]">
        <Image src={p.img} alt="" fill sizes="104px" className="object-cover" />
      </Link>

      <div className="flex min-w-0 flex-1 items-start justify-between gap-3 sm:items-center">
        <div className="min-w-0 flex-1">
          {cat && <p className="truncate text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[#a8661e] max-sm:hidden">{cat.name}</p>}
          <Link href={`/shop/${p.slug}`} className="block text-[1rem] font-bold leading-snug sm:mt-0.5 text-forest-700 transition-colors hover:text-forest-500 sm:text-[1.1rem]">
            {p.name}
          </Link>
          {p.ta && (
            <p lang="ta" className="truncate text-[0.8rem] text-ink/75">
              {p.ta}
            </p>
          )}
          {p.pack && <p className="mt-0.5 text-[0.88rem] text-ink/80">{p.pack}</p>}

          <div className="mt-1 flex flex-nowrap items-center gap-x-3 sm:gap-x-5">
            {/* Phones: the stepper joins this row */}
            <span className="sm:hidden">
              <QtyStepper value={qty} max={maxQty(p)} onChange={onQty} label={p.name} size="sm" />
            </span>
            <button
              type="button"
              onClick={onSave}
              aria-disabled={saved}
              aria-label={saved ? `${p.name} is in your wishlist` : `Save ${p.name} for later`}
              className={`${action} ${saved ? "text-forest-600" : "cursor-pointer text-ink hover:text-forest-600"} max-sm:min-w-9 max-sm:justify-center`}
            >
              <Heart className="size-4" fill={saved ? "currentColor" : "none"} aria-hidden />
              <span className="max-sm:hidden">{saved ? "In wishlist" : "Save for later"}</span>
            </button>
            <button type="button" onClick={onRemove} aria-label={`Remove ${p.name}`} className={`${action} cursor-pointer text-ink hover:text-[#b3261e] max-sm:hidden`}>
              <Trash2 className="size-4" aria-hidden />
              Remove
            </button>
          </div>
        </div>

        {/* Desktop: stepper and line total side by side; phones: total + remove stacked */}
        <div className="hidden shrink-0 items-center gap-6 sm:flex lg:gap-10">
          <QtyStepper value={qty} max={maxQty(p)} onChange={onQty} label={p.name} size="sm" />
          <p className="w-20 text-right text-[1.2rem] font-bold tabular-nums text-forest-800">{rupees(p.price * qty)}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end self-stretch sm:hidden">
          <p className="text-[1.05rem] font-bold tabular-nums text-forest-800">{rupees(p.price * qty)}</p>
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${p.name}`}
            className="-mr-2 mt-auto grid size-10 cursor-pointer place-items-center rounded-full text-muted hover:bg-[#b3261e]/8 hover:text-[#b3261e]"
          >
            <Trash2 className="size-[18px]" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Empty */

function EmptyCart() {
  return (
    <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden rounded-[1.75rem] bg-white/80 px-6 py-8 text-center shadow-[0_24px_50px_-30px_rgba(60,40,10,0.5)] ring-1 ring-forest-600/8 backdrop-blur-md">
      <span className="grid size-[clamp(3.5rem,9svh,5rem)] place-items-center rounded-full bg-leaf/12 text-forest-600 ring-1 ring-leaf/20">
        <ShoppingBasket className="size-[45%]" strokeWidth={1.5} aria-hidden />
      </span>
      <h2 className="mt-[clamp(0.75rem,2.5svh,1.5rem)] text-[1.6rem] font-bold text-forest-700">Your cart is empty</h2>
      <p className="mx-auto mt-2 max-w-[44ch] text-pretty text-ink/75">
        From our farms to your home — fill it with traditional rice, millets, cold-pressed oils and more.
      </p>
      <div className="mt-[clamp(1rem,3svh,1.75rem)] flex flex-wrap justify-center gap-3">
        <Link href="/shop" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-gradient-to-b from-forest-600 to-forest-800 px-7 font-semibold text-white">
          Start shopping <span aria-hidden>→</span>
        </Link>
        <Link href="/wishlist" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-forest-600/25 bg-white px-7 font-semibold text-forest-700 transition-colors hover:border-forest-600">
          <Heart className="size-4" aria-hidden /> View wishlist
        </Link>
      </div>
    </div>
  );
}
