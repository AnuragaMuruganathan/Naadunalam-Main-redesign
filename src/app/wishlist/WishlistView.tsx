"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, Check, Heart, ShoppingCart, Trash2, X } from "lucide-react";
import PageIntro from "@/components/shop/PageIntro";
import Recommendations from "@/components/shop/Recommendations";
import { CartControl } from "@/components/shop/ProductCard";
import { categoryOf } from "@/lib/shop";
import { plural, rupees } from "@/lib/format";
import {
  addManyToCart,
  addManyToWishlist,
  clearWishlist,
  getProduct,
  restore,
  toggleWishlist,
  useShop,
} from "@/lib/store";
import type { Product } from "@/lib/catalog";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function WishlistView({ shared }: { shared: number[] }) {
  const { wishlist, cart, hydrated } = useShop();
  const items = wishlist.map(getProduct).filter((p): p is Product => !!p);
  const [status, setStatus] = useState<{ text: string; undo?: number[]; link?: boolean } | null>(null);
  const [sharedDismissed, setSharedDismissed] = useState(false);
  const sharedItems = shared.map(getProduct).filter((p): p is Product => !!p);
  const sharedNew = sharedItems.filter((p) => !wishlist.includes(p.id));

  const remove = (p: Product) => {
    const before = wishlist;
    toggleWishlist(p.id);
    setStatus({ text: `Removed ${p.name}.`, undo: before });
  };

  const addAll = () => {
    const n = addManyToCart(items.map((p) => p.id));
    setStatus({
      text: n ? `${plural(n, "product")} added to your cart.` : "Everything here is already in your cart.",
      link: true,
    });
  };

  const clearAll = () => {
    const before = wishlist;
    clearWishlist();
    setStatus({ text: "Your wishlist was cleared.", undo: before });
  };

  return (
    <>
      <PageIntro title="My Wishlist" ornament={false} compact>
        {hydrated && items.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={clearAll}
              className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full px-4 text-sm font-bold text-muted transition-colors hover:bg-[#b3261e]/8 hover:text-[#b3261e]"
            >
              <Trash2 className="size-4" aria-hidden />
              Clear all
            </button>
          </div>
        )}
      </PageIntro>

      <section aria-label="Saved products" className="mx-auto max-w-[1320px] px-5 pb-8 pt-4 md:px-8 md:pb-12 md:pt-6">
        {/* A wishlist someone shared by link */}
        {hydrated && sharedItems.length > 0 && !sharedDismissed && (
          <div className="mb-8 flex flex-col gap-4 rounded-3xl bg-forest-900 p-5 text-white md:flex-row md:items-center md:p-6">
            <div className="flex -space-x-3">
              {sharedItems.slice(0, 4).map((p) => (
                <span key={p.id} className="relative size-12 overflow-hidden rounded-full bg-sand ring-2 ring-forest-900">
                  <Image src={p.img} alt="" fill sizes="48px" className="object-cover" />
                </span>
              ))}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-serif text-lg font-bold">A wishlist was shared with you</p>
              <p className="text-sm text-white/75">
                {plural(sharedItems.length, "product")}
                {sharedNew.length < sharedItems.length && ` · ${sharedItems.length - sharedNew.length} already saved`}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {sharedNew.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    addManyToWishlist(sharedNew.map((p) => p.id));
                    setSharedDismissed(true);
                    window.history.replaceState(window.history.state, "", "/wishlist");
                  }}
                  className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-gold-soft px-5 text-sm font-bold text-forest-950 transition-colors hover:bg-white"
                >
                  <Heart className="size-4" aria-hidden /> Save to my wishlist
                </button>
              )}
              <button
                type="button"
                onClick={() => setSharedDismissed(true)}
                aria-label="Dismiss shared wishlist"
                className="grid size-11 cursor-pointer place-items-center rounded-full text-white/75 hover:bg-white/10 hover:text-white"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>
          </div>
        )}

        <div aria-live="polite">
          <AnimatePresence>
            {status && (
              <motion.p
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl bg-sage px-4 py-3 text-sm text-forest-800"
              >
                <Check className="size-4 shrink-0" aria-hidden />
                <span className="font-semibold">{status.text}</span>
                {status.undo && (
                  <button
                    type="button"
                    onClick={() => {
                      restore({ wishlist: status.undo });
                      setStatus(null);
                    }}
                    className="cursor-pointer font-bold underline underline-offset-4"
                  >
                    Undo
                  </button>
                )}
                {status.link && (
                  <Link href="/cart" className="font-bold underline underline-offset-4">
                    View cart
                  </Link>
                )}
                <button type="button" onClick={() => setStatus(null)} aria-label="Dismiss message" className="ml-auto grid size-8 cursor-pointer place-items-center rounded-full hover:bg-forest-600/10">
                  <X className="size-4" aria-hidden />
                </button>
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {!hydrated ? (
          <div className="space-y-3" aria-hidden>
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl bg-sand/60" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <Empty />
        ) : (
          <>
            <div className="overflow-hidden rounded-3xl bg-white ring-1 ring-forest-600/10">
              <div className="hidden grid-cols-[minmax(0,1fr)_120px_140px_250px_48px] gap-4 border-b border-forest-600/10 bg-cream px-6 py-3 text-[0.74rem] font-bold uppercase tracking-[0.16em] text-forest-800 md:grid">
                <span>Product</span>
                <span>Price</span>
                <span>Availability</span>
                <span>Add to cart</span>
                <span className="sr-only">Remove</span>
              </div>
              <ul className="divide-y divide-forest-600/10">
                <AnimatePresence initial={false}>
                  {items.map((p) => {
                    const cat = categoryOf(p.category);
                    return (
                      <motion.li
                        key={p.id}
                        layout
                        exit={{ opacity: 0, x: -30, transition: { duration: 0.25 } }}
                        transition={{ duration: 0.4, ease: EASE }}
                        className="relative grid grid-cols-[80px_minmax(0,1fr)] gap-x-4 gap-y-3 p-4 md:grid-cols-[minmax(0,1fr)_120px_140px_250px_48px] md:items-center md:gap-4 md:px-6"
                      >
                        <div className="contents md:flex md:min-w-0 md:items-center md:gap-4">
                          <span className="relative row-span-2 size-20 shrink-0 overflow-hidden rounded-xl bg-sand md:row-span-1">
                            <Image src={p.img} alt="" fill sizes="80px" className="object-cover" />
                          </span>
                          <div className="min-w-0 pr-10 md:pr-0">
                            {cat && <p className="truncate text-[0.68rem] font-bold uppercase tracking-[0.14em] text-gold">{cat.name}</p>}
                            <p className="font-serif font-bold leading-snug text-forest-700">{p.name}</p>
                            <p lang="ta" className="truncate font-tamil-sans text-[0.78rem] text-muted">{p.ta}</p>
                            <p className="mt-1 text-sm md:hidden">
                              <b className="text-ink">{rupees(p.price)}</b> <span className="text-muted">/ {p.pack}</span>
                              <span className={`ml-2 font-semibold ${p.inStock ? "text-forest-600" : "text-[#b3261e]"}`}>
                                · {p.inStock ? "In stock" : "Out of stock"}
                              </span>
                            </p>
                          </div>
                        </div>
                        <p className="hidden md:block">
                          <b className="font-serif text-lg text-ink">{rupees(p.price)}</b>
                          <span className="block text-xs text-muted">{p.pack}</span>
                        </p>
                        <p className={`hidden text-sm font-semibold md:block ${p.inStock ? "text-forest-600" : "text-[#b3261e]"}`}>
                          {p.inStock ? (p.stock ? `${p.stock} in stock` : "In stock") : "Out of stock"}
                        </p>
                        <div className="col-start-2 md:col-start-auto">
                          <CartControl product={p} />
                        </div>
                        <button
                          type="button"
                          onClick={() => remove(p)}
                          aria-label={`Remove ${p.name} from wishlist`}
                          className="absolute right-3 top-3 grid size-10 cursor-pointer place-items-center rounded-full text-muted transition-colors hover:bg-[#b3261e]/8 hover:text-[#b3261e] md:static"
                        >
                          <X className="size-5" aria-hidden />
                        </button>
                      </motion.li>
                    );
                  })}
                </AnimatePresence>
              </ul>
            </div>

            <div className="mt-6 flex flex-col-reverse items-stretch justify-between gap-3 sm:flex-row sm:items-center">
              <Link href="/shop" className="inline-flex min-h-11 items-center justify-center gap-2 font-bold text-forest-700 hover:text-forest-500">
                <ArrowLeft className="size-4" aria-hidden /> Continue shopping
              </Link>
              <button
                type="button"
                onClick={addAll}
                disabled={items.every((p) => cart.some((l) => l.id === p.id) || !p.inStock)}
                className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-forest-600 px-7 font-bold text-white transition-colors hover:bg-forest-700 disabled:cursor-not-allowed disabled:bg-forest-600/40"
              >
                <ShoppingCart className="size-[18px]" aria-hidden />
                Add all to cart
              </button>
            </div>
          </>
        )}
      </section>

      <Recommendations exclude={hydrated ? wishlist : []} sub="Explore more healthy choices" />
    </>
  );
}

function Empty() {
  return (
    <div className="grain relative overflow-hidden rounded-3xl bg-ivory px-6 py-16 text-center ring-1 ring-forest-600/10 md:py-20">
      <span className="mx-auto grid size-20 place-items-center rounded-full bg-white text-[#b3261e] shadow-[0_12px_28px_-14px_rgba(60,40,10,0.5)] ring-1 ring-forest-600/10">
        <Heart className="size-9" strokeWidth={1.5} aria-hidden />
      </span>
      <h2 className="mt-6 font-serif text-[1.75rem] font-bold text-forest-700">Your wishlist is empty</h2>
      <p className="mx-auto mt-2 max-w-[44ch] text-pretty text-ink/75">
        Save the products you love and come back to them any time — they will be waiting right here.
      </p>
      <Link
        href="/shop"
        className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-full bg-forest-600 px-7 font-bold text-white transition-colors hover:bg-forest-700"
      >
        Start shopping <span aria-hidden>→</span>
      </Link>
    </div>
  );
}
