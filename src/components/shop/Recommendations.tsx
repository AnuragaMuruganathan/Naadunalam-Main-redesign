"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { recommend } from "@/lib/shop";
import ProductCard from "./ProductCard";
import QuickView from "./QuickView";

/** "You may also like" row used on the wishlist and cart pages. */
export default function Recommendations({
  exclude,
  title = "You may also like",
  sub = "Discover more natural goodness",
}: {
  exclude: number[];
  title?: string;
  sub?: string;
}) {
  const items = recommend(exclude, 4);
  const [quick, setQuick] = useState<Product | null>(null);
  const close = useCallback(() => setQuick(null), []);
  if (!items.length) return null;

  return (
    <section aria-labelledby="rec-title" className="mx-auto max-w-[1320px] px-5 pb-14 pt-4 md:px-8 md:pb-20">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          {sub && <p className="text-[0.704rem] font-bold uppercase tracking-[0.1em] text-gold">{sub}</p>}
          <h2 id="rec-title" className="mt-1 font-serif text-[1.555rem] font-bold text-forest-600 md:text-[1.975rem]">
            {title}
          </h2>
        </div>
        <Link
          href="/shop"
          className="group inline-flex min-h-11 items-center gap-2 font-bold text-forest-700 hover:text-forest-500"
        >
          View all products
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
        </Link>
      </div>
      <ul className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        {items.map((p) => (
          <li key={p.id}>
            <ProductCard product={p} onQuickView={setQuick} />
          </li>
        ))}
      </ul>
      <QuickView product={quick} onClose={close} />
    </section>
  );
}
