"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ShoppingCart } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { addToCart, maxQty, useShop } from "@/lib/store";
import { WishButton } from "./ProductCard";

const price = (n: number) => `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/**
 * Shop-grid card: near-square photo inset in a white card, name + Tamil name,
 * price over pack size, and a round cart button. Once the item is in the cart
 * a small badge on the button shows the quantity (tap again to add one more).
 */
export default function ProductTile({
  product: p,
  eager = false,
  sizes = "(min-width: 1280px) 210px, (min-width: 1024px) 23vw, (min-width: 768px) 31vw, 47vw",
}: {
  product: Product;
  eager?: boolean;
  sizes?: string;
}) {
  const { cart } = useShop();
  const qty = cart.find((l) => l.id === p.id)?.qty ?? 0;
  const full = qty >= maxQty(p);

  return (
    <article className="group relative flex h-full flex-col rounded-[1.25rem] bg-white p-1.5 shadow-[0_16px_34px_-24px_rgba(60,40,10,0.55)] ring-1 ring-forest-600/8 transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-1 hover:shadow-[0_28px_44px_-26px_rgba(60,40,10,0.6)]">
      <div className="relative aspect-[16/15] overflow-hidden rounded-[1rem] bg-sand">
        <Link href={`/shop/${p.slug}`} tabIndex={-1} aria-hidden className="absolute inset-0">
          <Image
            src={p.img}
            alt=""
            fill
            sizes={sizes}
            loading={eager ? "eager" : undefined}
            className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.05]"
          />
        </Link>
        <WishButton product={p} className="absolute right-2 top-2 size-9! bg-white/90! backdrop-blur-sm" />
        {!p.inStock && (
          <span className="absolute inset-x-2 bottom-2 rounded-full bg-ink/75 py-1 text-center text-[0.675rem] font-bold text-white">Out of stock</span>
        )}
      </div>

      <div className="flex flex-1 flex-col px-2 pb-1.5 pt-3 sm:px-2.5">
        <h3 className="line-clamp-2 text-[0.95rem] font-semibold leading-snug text-[#0f1a12] sm:text-[1.02rem]">
          <Link href={`/shop/${p.slug}`} className="transition-colors hover:text-forest-700">
            {p.name}
          </Link>
        </h3>
        {p.ta && (
          <p lang="ta" className="mt-1 line-clamp-2 text-[0.74rem] leading-snug text-ink/75 sm:text-[0.78rem]">
            {p.ta}
          </p>
        )}

        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <p className="flex min-w-0 flex-col leading-tight">
            <span className="text-[0.935rem] font-bold tabular-nums text-ink sm:text-[1.015rem]">{price(p.price)}</span>
            {p.pack && <span className="mt-0.5 text-[0.695rem] text-muted">{p.pack}</span>}
          </p>

          {p.inStock && (
            <motion.button
              type="button"
              onClick={() => !full && addToCart(p.id)}
              whileTap={{ scale: 0.9 }}
              disabled={full}
              aria-label={qty ? `${qty} of ${p.name} in cart. Add one more` : `Add ${p.name} to cart`}
              className="relative grid size-11 shrink-0 cursor-pointer place-items-center rounded-full bg-forest-600 text-white shadow-[0_8px_18px_-8px_rgba(10,57,25,0.6)] transition-colors hover:bg-forest-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ShoppingCart className="size-[19px]" strokeWidth={2.1} aria-hidden />
              <AnimatePresence initial={false}>
                {qty > 0 && (
                  <motion.span
                    key={qty}
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.4, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 26 }}
                    className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-gold-soft px-1 text-[0.625rem] font-bold tabular-nums text-forest-950 ring-2 ring-white"
                  >
                    {qty}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          )}
        </div>
      </div>
    </article>
  );
}
