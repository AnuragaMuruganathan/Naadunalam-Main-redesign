"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, Check, Heart, ShoppingCart, Trash2, X } from "lucide-react";
import PageStage from "@/components/shop/PageStage";
import Recommendations from "@/components/shop/Recommendations";
import QtyStepper from "@/components/shop/QtyStepper";
import { categoryOf } from "@/lib/shop";
import { plural, rupees } from "@/lib/format";
import {
  addManyToCart,
  addManyToWishlist,
  addToCart,
  clearWishlist,
  getProduct,
  maxQty,
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
  const addable = items.filter((p) => p.inStock && !cart.some((l) => l.id === p.id));

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
      <PageStage id="wl-title" title="My Wishlist">
        {/* A wishlist someone shared by link */}
        {hydrated && sharedItems.length > 0 && !sharedDismissed && (
          <div className="mb-4 flex flex-col gap-4 rounded-[1.6rem] bg-forest-900 p-5 text-white md:flex-row md:items-center md:p-6">
            <div className="flex -space-x-3">
              {sharedItems.slice(0, 4).map((p) => (
                <span key={p.id} className="relative size-12 overflow-hidden rounded-full bg-sand ring-2 ring-forest-900">
                  <Image src={p.img} alt="" fill sizes="48px" className="object-cover" />
                </span>
              ))}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-lg font-bold">A wishlist was shared with you</p>
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
                className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl bg-[#e9f2da] px-4 py-3 text-sm text-forest-800 ring-1 ring-leaf/20"
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
          <div className="space-y-3 rounded-[1.6rem] bg-white/70 p-4" aria-hidden>
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl bg-sand/60" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <Empty />
        ) : (
          <>
            <div className="rounded-[1.6rem] bg-white/75 p-2.5 shadow-[0_24px_50px_-30px_rgba(60,40,10,0.5)] ring-1 ring-forest-600/8 backdrop-blur-md sm:p-3.5">
              <div className="flex items-center justify-between gap-3 px-2 pb-2.5 pt-1 sm:px-3">
                <p className="text-[0.95rem] font-semibold text-ink/80">{plural(items.length, "saved product")}</p>
                <button
                  type="button"
                  onClick={clearAll}
                  className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full px-3 text-[0.95rem] font-semibold text-ink transition-colors hover:bg-[#b3261e]/8 hover:text-[#b3261e]"
                >
                  <Trash2 className="size-[18px]" aria-hidden />
                  Clear All
                </button>
              </div>
              <ul className="divide-y divide-forest-600/10 overflow-hidden rounded-[1.25rem] bg-white ring-1 ring-forest-600/8">
                <AnimatePresence initial={false}>
                  {items.map((p) => (
                    <Row key={p.id} product={p} inCart={cart.find((l) => l.id === p.id)?.qty ?? 0} onRemove={() => remove(p)} />
                  ))}
                </AnimatePresence>
              </ul>
            </div>

            <div className="mt-5 flex flex-col-reverse items-stretch justify-between gap-3 sm:flex-row sm:items-center">
              <Link href="/shop" className="inline-flex min-h-11 items-center justify-center gap-2.5 rounded-full px-3 text-[1.02rem] font-bold text-forest-700 transition-colors hover:text-forest-500">
                <ArrowLeft className="size-5" aria-hidden /> Continue Shopping
              </Link>
              <button
                type="button"
                onClick={addAll}
                disabled={!addable.length}
                className="inline-flex min-h-[3.25rem] cursor-pointer items-center justify-center gap-2.5 rounded-full bg-forest-700 px-8 text-[1.05rem] font-bold text-white shadow-[0_14px_26px_-14px_rgba(10,57,25,0.8)] transition-colors hover:bg-forest-800 disabled:cursor-not-allowed disabled:bg-forest-700/45 disabled:shadow-none"
              >
                <ShoppingCart className="size-5" aria-hidden />
                {addable.length ? `Add All to Cart (${addable.length})` : "All in your cart"}
              </button>
            </div>
          </>
        )}
      </PageStage>

      <Recommendations exclude={hydrated ? wishlist : []} sub="" />
    </>
  );
}

/* ---------------------------------------------------------------- Row */

function Row({ product: p, inCart, onRemove }: { product: Product; inCart: number; onRemove: () => void }) {
  const cat = categoryOf(p.category);
  const room = Math.max(0, maxQty(p) - inCart);
  const [qty, setQty] = useState(1);
  const q = Math.min(qty, Math.max(1, room));

  return (
    <motion.li
      layout
      exit={{ opacity: 0, x: -30, transition: { duration: 0.25 } }}
      transition={{ duration: 0.4, ease: EASE }}
      className="relative grid grid-cols-[88px_minmax(0,1fr)] items-center gap-x-4 gap-y-3 p-3.5 sm:grid-cols-[120px_minmax(0,1fr)] sm:px-5 xl:grid-cols-[124px_minmax(0,1fr)_110px_150px_128px_190px_44px] xl:gap-x-5 xl:py-3"
    >
      <Link href={`/shop/${p.slug}`} tabIndex={-1} aria-hidden className="relative block aspect-[6/5] w-full overflow-hidden rounded-2xl bg-sand max-xl:row-span-2 max-xl:self-start">
        <Image src={p.img} alt="" fill sizes="124px" className="object-cover transition-transform duration-700 hover:scale-105" />
      </Link>

      <div className="min-w-0 pr-10 xl:pr-0">
        {cat && <p className="truncate text-[0.78rem] font-bold uppercase tracking-[0.12em] text-gold">{cat.name}</p>}
        <Link href={`/shop/${p.slug}`} className="mt-0.5 block text-[1.08rem] font-bold leading-snug text-forest-800 transition-colors hover:text-forest-600 sm:text-[1.2rem]">
          {p.name}
        </Link>
        {p.ta && (
          <p lang="ta" className="mt-0.5 line-clamp-2 text-[0.88rem] text-ink/80 sm:text-[0.98rem]">
            {p.ta}
          </p>
        )}
      </div>

      {/* Price + availability: own columns on desktop, one line under the name on smaller screens */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 max-xl:col-start-2 xl:contents">
        <p className="leading-tight">
          <span className="block text-[1.35rem] font-bold tabular-nums text-ink sm:text-[1.6rem]">{rupees(p.price)}</span>
          {p.pack && <span className="text-[0.92rem] text-muted">{p.pack}</span>}
        </p>
        <p>
          <span
            className={`inline-flex rounded-full px-3.5 py-1 text-[0.85rem] font-semibold ${
              p.inStock ? "bg-[#e9f2da] text-forest-800" : "bg-[#b3261e]/10 text-[#b3261e]"
            }`}
          >
            {p.inStock ? (p.stock ? `In stock (${p.stock})` : "In stock") : "Out of stock"}
          </span>
        </p>
      </div>

      {/* Quantity + add: full-width row on phones, own columns on desktop */}
      <div className="col-span-2 flex items-center gap-3 sm:col-span-1 sm:col-start-2 xl:contents">
        <div className="xl:flex xl:justify-center">
          {p.inStock && room > 0 && <QtyStepper value={q} max={room} onChange={setQty} label={p.name} />}
        </div>
        <div className="flex-1 sm:max-w-[240px] xl:max-w-none xl:flex-none">
          {p.inStock ? (
            <motion.button
              type="button"
              disabled={room === 0}
              onClick={() => {
                addToCart(p.id, q);
                setQty(1);
              }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2.5 rounded-full bg-forest-700 px-5 text-[1.02rem] font-bold text-white shadow-[0_12px_22px_-14px_rgba(10,57,25,0.8)] transition-colors hover:bg-forest-800 disabled:cursor-not-allowed disabled:bg-forest-700/45 disabled:shadow-none"
            >
              <ShoppingCart className="size-5" aria-hidden />
              {room === 0 ? "Max in cart" : "Add to Cart"}
            </motion.button>
          ) : (
            <span className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-ink/8 text-[0.95rem] font-bold text-muted">Out of stock</span>
          )}
          {inCart > 0 && (
            <Link href="/cart" className="mt-1 block text-center text-[0.8rem] font-semibold text-forest-600 underline-offset-4 hover:underline">
              {inCart} in your cart
            </Link>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${p.name} from wishlist`}
        className="absolute right-2.5 top-2.5 grid size-11 cursor-pointer place-items-center rounded-full text-ink transition-colors hover:bg-[#b3261e]/8 hover:text-[#b3261e] xl:static"
      >
        <X className="size-[22px]" strokeWidth={1.8} aria-hidden />
      </button>
    </motion.li>
  );
}

function Empty() {
  return (
    <div className="relative overflow-hidden rounded-[1.6rem] bg-white/85 px-6 py-16 text-center shadow-[0_24px_50px_-30px_rgba(60,40,10,0.5)] ring-1 ring-forest-600/8 backdrop-blur-md md:py-20">
      <span className="mx-auto grid size-20 place-items-center rounded-full bg-white text-[#b3261e] shadow-[0_12px_28px_-14px_rgba(60,40,10,0.5)] ring-1 ring-forest-600/10">
        <Heart className="size-9" strokeWidth={1.5} aria-hidden />
      </span>
      <h2 className="mt-6 text-[1.713rem] font-bold text-forest-700">Your wishlist is empty</h2>
      <p className="mx-auto mt-2 max-w-[44ch] text-pretty text-ink/75">
        Save the products you love and come back to them any time — they will be waiting right here.
      </p>
      <Link
        href="/shop"
        className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-full bg-forest-700 px-7 font-bold text-white transition-colors hover:bg-forest-800"
      >
        Start shopping <span aria-hidden>→</span>
      </Link>
    </div>
  );
}
