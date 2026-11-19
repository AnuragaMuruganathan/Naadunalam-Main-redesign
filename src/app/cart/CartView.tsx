"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, Heart, Leaf, ShieldCheck, ShoppingBasket, Sprout, Tractor, Trash2, X } from "lucide-react";
import PageIntro from "@/components/shop/PageIntro";
import Perks from "@/components/shop/Perks";
import Recommendations from "@/components/shop/Recommendations";
import QtyStepper from "@/components/shop/QtyStepper";
import Totals, { CodNote } from "@/components/shop/OrderSummary";
import { categoryOf } from "@/lib/shop";
import { rupees } from "@/lib/format";
import { cartSummary, clearCart, maxQty, removeFromCart, restore, setQty, toggleWishlist, useShop, type CartLine } from "@/lib/store";

const EASE = [0.22, 1, 0.36, 1] as const;
const BADGES = [
  { icon: Leaf, label: "100% Natural" },
  { icon: Tractor, label: "Farm Direct" },
  { icon: Sprout, label: "Healthy Living" },
  { icon: ShieldCheck, label: "Safe Delivery" },
];

/** Hide extras on short screens so the summary always fits beside the list. */
const TALL_ONLY = "[@media(max-height:820px)]:hidden";

export default function CartView() {
  const { cart, wishlist, hydrated } = useShop();
  const { lines, items, subtotal, shipping, total } = cartSummary(cart);
  const [undo, setUndo] = useState<{ text: string; cart: CartLine[] } | null>(null);

  const remove = (id: number, name: string) => {
    setUndo({ text: `Removed ${name}.`, cart });
    removeFromCart(id);
  };

  return (
    <>
      {/*
       * The title band and the cart together fill exactly one screen below the
       * header (112px on phones, 122px from md — top bar included). A long
       * cart scrolls inside its own list instead of pushing the summary away.
       */}
      <div className="flex h-[calc(100svh-112px)] min-h-[520px] flex-col md:h-[calc(100svh-122px)]">
        <PageIntro title="Your Cart" ornament={false} compact>
          <Link href="/shop" className="inline-flex min-h-11 items-center gap-2 font-bold text-forest-700 hover:text-forest-500">
            <ArrowLeft className="size-4" aria-hidden /> Continue shopping
          </Link>
        </PageIntro>

        <section aria-label="Cart" className="mx-auto flex min-h-0 w-full max-w-[1320px] flex-1 flex-col px-5 py-[clamp(0.75rem,2.5svh,1.75rem)] md:px-8">
          <div aria-live="polite" className="shrink-0">
            <AnimatePresence>
              {undo && (
                <motion.p
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl bg-sage px-4 py-2 text-sm text-forest-800"
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

          {!hydrated ? (
            <div className="grid min-h-0 flex-1 gap-8 lg:grid-cols-[1fr_380px]" aria-hidden>
              <div className="animate-pulse rounded-3xl bg-sand/60" />
              <div className="animate-pulse rounded-3xl bg-sand/60 max-lg:hidden" />
            </div>
          ) : lines.length === 0 ? (
            <EmptyCart />
          ) : (
            <div className="flex min-h-0 flex-1 flex-col gap-3 lg:grid lg:grid-cols-[1fr_380px] lg:gap-8">
              {/* Items: scroll inside the panel when the cart is long */}
              <div className="flex min-h-0 flex-1 flex-col">
                <ul
                  data-lenis-prevent
                  className="min-h-0 divide-y divide-forest-600/10 overflow-y-auto overscroll-contain rounded-3xl bg-white ring-1 ring-forest-600/10"
                >
                  <AnimatePresence initial={false}>
                    {lines.map(({ id, qty, product: p }) => {
                      const saved = wishlist.includes(id);
                      return (
                        <motion.li
                          key={id}
                          layout
                          exit={{ opacity: 0, x: -30, transition: { duration: 0.25 } }}
                          transition={{ duration: 0.4, ease: EASE }}
                          className="flex gap-3 p-3 sm:gap-4 sm:p-5"
                        >
                          <span className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-sand sm:size-24">
                            <Image src={p.img} alt="" fill sizes="96px" className="object-cover" />
                          </span>
                          <div className="flex min-w-0 flex-1 items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-[0.68rem] font-bold uppercase tracking-[0.14em] text-gold">{categoryOf(p.category)?.name}</p>
                              <p className="font-serif text-[1rem] font-bold leading-snug text-forest-700 sm:text-[1.02rem]">{p.name}</p>
                              <p className="text-sm text-muted">
                                {rupees(p.price)} / {p.pack}
                              </p>
                              <div className="mt-1.5 flex flex-nowrap items-center gap-x-2 sm:flex-wrap sm:gap-x-4 sm:gap-y-1">
                                {/* Phones: stepper sits in the row with icon-only actions */}
                                <span className="sm:hidden">
                                  <QtyStepper value={qty} max={maxQty(p)} onChange={(n) => setQty(id, n)} label={p.name} size="sm" />
                                </span>
                                <span className="flex items-center gap-x-4">
                                  <button
                                    type="button"
                                    onClick={() => !saved && toggleWishlist(id)}
                                    className={`inline-flex min-h-9 min-w-9 items-center justify-center gap-1.5 text-sm font-semibold ${saved ? "text-forest-600" : "cursor-pointer text-muted hover:text-forest-600"}`}
                                    aria-disabled={saved}
                                    aria-label={saved ? `${p.name} is in your wishlist` : `Save ${p.name} for later`}
                                  >
                                    <Heart className="size-4" fill={saved ? "currentColor" : "none"} aria-hidden />
                                    <span className="max-sm:hidden">{saved ? "In wishlist" : "Save for later"}</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => remove(id, p.name)}
                                    aria-label={`Remove ${p.name}`}
                                    className="inline-flex min-h-9 min-w-9 cursor-pointer items-center justify-center gap-1.5 text-sm font-semibold text-muted hover:text-[#b3261e] max-sm:hidden"
                                  >
                                    <Trash2 className="size-4" aria-hidden />
                                    <span className="max-sm:hidden">Remove</span>
                                  </button>
                                </span>
                              </div>
                            </div>
                            <div className="flex shrink-0 flex-col items-end gap-3 self-stretch sm:self-auto">
                              <span className="max-sm:hidden">
                                <QtyStepper value={qty} max={maxQty(p)} onChange={(n) => setQty(id, n)} label={p.name} size="sm" />
                              </span>
                              <p className="font-serif text-[1.05rem] font-bold tabular-nums text-ink sm:text-lg">{rupees(p.price * qty)}</p>
                              {/* Phones: remove sits under the line total */}
                              <button
                                type="button"
                                onClick={() => remove(id, p.name)}
                                aria-label={`Remove ${p.name}`}
                                className="-mr-2 mt-auto grid size-10 cursor-pointer place-items-center rounded-full text-muted hover:bg-[#b3261e]/8 hover:text-[#b3261e] sm:hidden"
                              >
                                <Trash2 className="size-[18px]" aria-hidden />
                              </button>
                            </div>
                          </div>
                        </motion.li>
                      );
                    })}
                  </AnimatePresence>
                </ul>

                <div className="mt-2 flex shrink-0 justify-end max-lg:hidden">
                  <button
                    type="button"
                    onClick={() => {
                      setUndo({ text: "Your cart was emptied.", cart });
                      clearCart();
                    }}
                    className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full px-4 text-sm font-bold text-muted transition-colors hover:bg-[#b3261e]/8 hover:text-[#b3261e]"
                  >
                    <Trash2 className="size-4" aria-hidden /> Empty cart
                  </button>
                </div>
              </div>

              <aside aria-labelledby="summary-title" className="shrink-0 lg:min-h-0">
                <div
                  data-lenis-prevent
                  className="rounded-3xl bg-white p-4 shadow-[0_24px_50px_-30px_rgba(60,40,10,0.55)] ring-1 ring-forest-600/10 sm:p-5 lg:max-h-full lg:overflow-y-auto lg:p-6"
                >
                  <h2 id="summary-title" className="font-serif text-[1.2rem] font-bold text-forest-700 max-lg:sr-only lg:text-[1.35rem]">
                    Order Summary
                  </h2>
                  <div className="lg:mt-4">
                    <Totals subtotal={subtotal} shipping={shipping} total={total} items={items} />
                  </div>
                  <Link
                    href="/checkout"
                    className="group mt-[clamp(0.75rem,2svh,1.5rem)] inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-forest-600 px-6 py-3 text-[1.02rem] font-bold text-white transition-colors hover:bg-forest-700"
                  >
                    Proceed to checkout
                    <ArrowRight className="size-[18px] transition-transform group-hover:translate-x-1" aria-hidden />
                  </Link>
                  {/* Phones: one line instead of the full note */}
                  <p className="mt-2 text-center text-xs text-muted lg:hidden">
                    <b className="text-forest-700">Cash on Delivery</b> — pay when your order arrives.
                  </p>
                  <div className="mt-4 max-lg:hidden">
                    <CodNote />
                  </div>
                  <ul className={`mt-4 grid grid-cols-2 gap-2 max-lg:hidden ${TALL_ONLY}`}>
                    {BADGES.map(({ icon: Icon, label }) => (
                      <li key={label} className="flex items-center gap-2 text-[0.82rem] font-semibold text-forest-800">
                        <Icon className="size-4 shrink-0 text-forest-600" aria-hidden />
                        {label}
                      </li>
                    ))}
                  </ul>
                  <p className={`mt-4 text-center font-serif text-sm italic text-muted max-lg:hidden ${TALL_ONLY}`}>
                    Thank you for choosing a healthier future ♥
                  </p>
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

function EmptyCart() {
  return (
    <div className="grain relative flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden rounded-3xl bg-ivory px-6 py-8 text-center ring-1 ring-forest-600/10">
      <span className="grid size-[clamp(3.5rem,9svh,5rem)] place-items-center rounded-full bg-white text-forest-600 shadow-[0_12px_28px_-14px_rgba(60,40,10,0.5)] ring-1 ring-forest-600/10">
        <ShoppingBasket className="size-[45%]" strokeWidth={1.5} aria-hidden />
      </span>
      <h2 className="mt-[clamp(0.75rem,2.5svh,1.5rem)] font-serif text-[1.75rem] font-bold text-forest-700">Your cart is empty</h2>
      <p className="mx-auto mt-2 max-w-[44ch] text-pretty text-ink/75">
        From our farms to your home — fill it with traditional rice, millets, cold-pressed oils and more.
      </p>
      <div className="mt-[clamp(1rem,3svh,1.75rem)] flex flex-wrap justify-center gap-3">
        <Link href="/shop" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-forest-600 px-7 font-bold text-white transition-colors hover:bg-forest-700">
          Start shopping <span aria-hidden>→</span>
        </Link>
        <Link href="/wishlist" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-forest-600/25 bg-white px-7 font-bold text-forest-700 transition-colors hover:border-forest-600">
          <Heart className="size-4" aria-hidden /> View wishlist
        </Link>
      </div>
    </div>
  );
}
