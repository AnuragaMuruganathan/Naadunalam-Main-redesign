"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { Eye, Heart, ShoppingCart } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { categoryOf } from "@/lib/shop";
import { rupees } from "@/lib/format";
import { addToCart, maxQty, setQty, toggleWishlist, useShop } from "@/lib/store";
import QtyStepper from "./QtyStepper";

export function WishButton({ product, className = "" }: { product: Product; className?: string }) {
  const { wishlist } = useShop();
  const on = wishlist.includes(product.id);
  return (
    <motion.button
      type="button"
      onClick={() => toggleWishlist(product.id)}
      aria-pressed={on}
      aria-label={on ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
      whileTap={{ scale: 0.85 }}
      className={`grid size-10 cursor-pointer place-items-center rounded-full bg-white/95 shadow-[0_6px_16px_-8px_rgba(10,57,25,0.5)] ring-1 ring-forest-600/10 transition-colors hover:text-[#b3261e] ${
        on ? "text-[#b3261e]" : "text-ink"
      } ${className}`}
    >
      <motion.span
        key={on ? "on" : "off"}
        initial={{ scale: on ? 0.4 : 1 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 520, damping: 14 }}
        className="grid place-items-center"
      >
        <Heart className="size-[19px]" strokeWidth={1.9} fill={on ? "currentColor" : "none"} aria-hidden />
      </motion.span>
    </motion.button>
  );
}

/** Add-to-cart button that becomes a quantity stepper once the item is in the cart. */
export function CartControl({ product, full = true }: { product: Product; full?: boolean }) {
  const { cart } = useShop();
  const line = cart.find((l) => l.id === product.id);
  if (!product.inStock) {
    return (
      <span className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-ink/8 text-sm font-bold text-muted">
        Out of stock
      </span>
    );
  }
  if (line) {
    return (
      <div className={`flex items-center justify-between gap-2 ${full ? "w-full" : ""}`}>
        <QtyStepper
          value={line.qty}
          min={0}
          max={maxQty(product)}
          onChange={(n) => setQty(product.id, n)}
          label={product.name}
          size="sm"
        />
        <span className="text-xs font-bold text-forest-600">In cart</span>
      </div>
    );
  }
  return (
    <motion.button
      type="button"
      onClick={() => addToCart(product.id)}
      whileTap={{ scale: 0.97 }}
      className={`inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full bg-forest-600 px-3 text-[0.883rem] font-bold sm:px-5 sm:text-[0.905rem] text-white transition-colors hover:bg-forest-700 ${
        full ? "w-full" : ""
      }`}
    >
      <ShoppingCart className="size-[18px] max-[420px]:hidden" strokeWidth={2} aria-hidden />
      Add to Cart
    </motion.button>
  );
}

export default function ProductCard({
  product: p,
  onQuickView,
  sizes = "(min-width: 1280px) 300px, (min-width: 768px) 30vw, 48vw",
  eager = false,
}: {
  product: Product;
  onQuickView?: (p: Product) => void;
  sizes?: string;
  eager?: boolean;
}) {
  const cat = categoryOf(p.category);
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_14px_30px_-22px_rgba(60,40,10,0.55)] ring-1 ring-forest-600/10 transition-[box-shadow,transform] duration-500 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-1 hover:shadow-[0_26px_44px_-22px_rgba(60,40,10,0.55)]">
      <div className="relative aspect-square overflow-hidden bg-sand">
        {/* Whole image opens the product page; the title link below is the accessible one */}
        <Link href={`/shop/${p.slug}`} tabIndex={-1} aria-hidden className="absolute inset-0 z-0" />
        <Image
          src={p.img}
          alt={p.name}
          fill
          sizes={sizes}
          loading={eager ? "eager" : undefined}
          className="pointer-events-none object-cover transition-transform duration-[900ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.05]"
        />
        {p.pack && (
          <span className="absolute left-3 top-3 rounded-full bg-forest-900/80 px-2.5 py-1 text-[0.681rem] font-bold text-white backdrop-blur-sm">
            {p.pack}
          </span>
        )}
        <WishButton product={p} className="absolute right-3 top-3" />
        {onQuickView && (
          <button
            type="button"
            onClick={() => onQuickView(p)}
            className="absolute inset-x-3 bottom-3 inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-full bg-white/95 text-sm font-bold text-forest-700 shadow-[0_8px_20px_-10px_rgba(10,57,25,0.6)] transition-[opacity,transform] duration-300 hover:bg-white [@media(hover:hover)]:translate-y-2 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-focus-within:translate-y-0 [@media(hover:hover)]:group-focus-within:opacity-100 [@media(hover:hover)]:group-hover:translate-y-0 [@media(hover:hover)]:group-hover:opacity-100 max-sm:hidden"
          >
            <Eye className="size-4" aria-hidden />
            Quick view<span className="sr-only">: {p.name}</span>
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        {cat && (
          <p className="truncate text-[0.637rem] font-bold uppercase tracking-[0.14em] text-gold">{cat.name}</p>
        )}
        {/*
          Name + Tamil name reserve the height of a two-line name, so every card
          (and every category grid) has the same height. The Tamil line stays
          right under the name; any spare space falls above the price.
        */}
        <div className="min-h-[4.34rem] sm:min-h-[4.55rem]">
          <h3 className="mt-1 line-clamp-2 font-serif text-[0.955rem] font-bold leading-snug text-forest-700 sm:text-[1.02rem]">
            <Link href={`/shop/${p.slug}`} className="transition-colors hover:text-forest-500">
              {p.name}
            </Link>
          </h3>
          {p.ta && (
            <p lang="ta" className="mt-0.5 line-clamp-1 font-tamil-sans text-[0.749rem] text-muted">
              {p.ta}
            </p>
          )}
        </div>
        <div className="mt-auto pt-3">
          <p className="mb-3 flex items-baseline gap-2">
            <span className="font-serif text-[1.225rem] font-bold text-ink">{rupees(p.price)}</span>
            {p.onSale && p.regularPrice > p.price && (
              <s className="text-sm text-muted">{rupees(p.regularPrice)}</s>
            )}
            {p.pack && <span className="text-[0.771rem] text-muted">/ {p.pack}</span>}
          </p>
          <CartControl product={p} />
        </div>
      </div>
    </article>
  );
}
