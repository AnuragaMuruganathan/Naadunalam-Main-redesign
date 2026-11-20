"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, CalendarDays, Package, Phone, Star } from "lucide-react";
import ShopBanner from "@/components/shop/ShopBanner";
import ShopDecor from "@/components/shop/ShopDecor";
import ProductTile from "@/components/shop/ProductTile";
import VendorAvatar, { monthYear } from "@/components/shop/VendorAvatar";
import { PRODUCTS } from "@/lib/catalog";
import { SORTS, categoryOf, type SortValue } from "@/lib/shop";
import { VENDORS, PRODUCT_VENDOR, type Vendor } from "@/lib/vendors";
import { plural } from "@/lib/format";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * A vendor's storefront, built on the shop page's pieces: the same photo
 * banner (with the vendor's Tamil name and facts card), the same white filter
 * panel, the same width and product grid.
 */
export default function StoreView({ vendor: v }: { vendor: Vendor }) {
  const products = useMemo(() => PRODUCTS.filter((p) => PRODUCT_VENDOR[p.slug] === v.slug), [v.slug]);
  const cats = useMemo(
    () =>
      [...new Set(products.map((p) => p.category))]
        .map((c) => ({ slug: c, name: categoryOf(c)?.name ?? c, n: products.filter((p) => p.category === c).length }))
        .sort((a, b) => b.n - a.n),
    [products]
  );
  const others = VENDORS.filter((o) => o.slug !== v.slug);

  const [cat, setCat] = useState<string | null>(null);
  const [sort, setSort] = useState<SortValue>("default");
  const shown = useMemo(() => {
    const list = products.filter((p) => !cat || p.category === cat);
    if (sort === "name") return [...list].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "price-asc") return [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") return [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [products, cat, sort]);

  // First screen = banner + filter panel + one row of products, nothing more,
  // exactly as on the shop page: the banner takes whatever height is left.
  const fitRoot = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const root = fitRoot.current;
    const main = root?.closest("main");
    if (!root || !main) return;
    let lastW = 0;
    const fit = (e?: Event) => {
      // Phone URL bars resize the viewport while scrolling; only refit when the width changes there.
      if (e && matchMedia("(pointer: coarse)").matches && innerWidth === lastW) return;
      lastW = innerWidth;
      const panel = root.querySelector<HTMLElement>("[data-shop-panel]");
      const grid = root.querySelector<HTMLElement>("[data-shop-grid]");
      const row = grid?.firstElementChild as HTMLElement | null;
      if (!panel || !grid || !row) return root.style.removeProperty("--shop-banner-h");
      const px = (el: Element, prop: string) => parseFloat(getComputedStyle(el).getPropertyValue(prop)) || 0;
      const used =
        px(main, "padding-top") +
        px(panel, "margin-top") + panel.offsetHeight +
        px(grid, "margin-top") + row.offsetHeight + px(grid, "row-gap");
      // Tall enough for the name, Tamil name and (from md) the facts card
      const min = innerWidth >= 768 ? 170 : 150;
      root.style.setProperty("--shop-banner-h", `${Math.round(Math.min(640, Math.max(min, innerHeight - used)))}px`);
    };
    fit();
    document.fonts?.ready.then(() => fit());
    const ro = new ResizeObserver(() => fit());
    const row = root.querySelector("[data-shop-grid] > *");
    if (row) ro.observe(row);
    const panel = root.querySelector("[data-shop-panel]");
    if (panel) ro.observe(panel);
    addEventListener("resize", fit);
    return () => {
      ro.disconnect();
      removeEventListener("resize", fit);
    };
  }, [cat]);

  return (
    <div ref={fitRoot}>
      <ShopBanner
        id="store-title"
        title={v.name}
        sub={
          // Phones: the facts card doesn't fit beside the name, so a short line instead
          <p className="mt-1.5 text-[0.84rem] text-ink/80 md:hidden">
            {plural(products.length, "product")} · Since {monthYear(v.since)}
          </p>
        }
        aside={<StoreFacts vendor={v} count={products.length} />}
      />

      <section aria-label={`${v.name} products`} className="relative isolate flow-root overflow-x-clip">
        <ShopDecor />
        <div className="mx-auto max-w-[1480px] px-3 pb-6 sm:px-4 md:px-6 md:pb-8">
          {/* Filter panel, right under the banner: the store's categories, then sorting */}
          <div
            data-shop-panel
            className="relative z-20 mt-3 flex items-center gap-3 rounded-[1.6rem] bg-white p-2.5 shadow-[0_18px_40px_-28px_rgba(60,40,10,0.5)] ring-1 ring-forest-600/8 md:mt-4 lg:px-5 lg:py-4"
          >
            <ul className="no-scrollbar flex min-w-0 flex-1 gap-2 overflow-x-auto" aria-label="Filter this store">
              {[{ slug: null, name: "All", n: products.length }, ...cats].map((c) => {
                const on = cat === c.slug;
                return (
                  <li key={c.slug ?? "all"} className="shrink-0">
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => setCat(c.slug)}
                      className={`inline-flex min-h-11 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full px-4 text-[0.855rem] font-semibold transition-colors ${
                        on ? "bg-forest-700 text-white" : "bg-cream text-forest-800 hover:bg-leaf/15"
                      }`}
                    >
                      {c.name}
                      <span className={on ? "text-white/75" : "text-muted"}>{c.n}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <p className="sr-only" aria-live="polite">
              Showing {shown.length} of {products.length} products from {v.name}
            </p>
            <label className="sr-only" htmlFor="store-sort">
              Sort products
            </label>
            <select
              id="store-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortValue)}
              className="min-h-11 shrink-0 cursor-pointer rounded-full border border-forest-600/15 bg-white px-4 pr-9 text-[0.855rem] font-semibold text-ink max-sm:w-36"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <ul data-shop-grid className="mt-4 grid grid-cols-2 gap-2.5 sm:gap-3.5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 xl:gap-4">
            {shown.map((p, i) => (
              <motion.li
                key={p.id}
                layout
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: Math.min(i, 11) * 0.035, ease: EASE }}
              >
                <ProductTile product={p} eager={i < 6} />
              </motion.li>
            ))}
          </ul>

          {/* Cross-link to the other stores */}
          {others.length > 0 && (
            <section aria-label="Other vendors" className="mt-10 border-t border-forest-600/12 pt-6">
              <h2 className="text-[1.2rem] font-bold text-forest-700">More stores on Naadu Nalam</h2>
              <ul className="mt-3 flex flex-wrap gap-3">
                {others.map((o) => (
                  <li key={o.slug}>
                    <Link
                      href={`/store/${o.slug}`}
                      className="group inline-flex items-center gap-3 rounded-full bg-white py-2 pl-2 pr-5 ring-1 ring-forest-600/12 transition-shadow hover:shadow-[0_12px_24px_-16px_rgba(10,57,25,0.6)]"
                    >
                      <VendorAvatar vendor={o} size="sm" />
                      <span className="font-semibold text-forest-800">{o.name}</span>
                      <ArrowRight className="size-4 text-forest-600 transition-transform group-hover:translate-x-1" aria-hidden />
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/store" className="inline-flex min-h-14 items-center px-3 font-semibold text-forest-700 underline decoration-gold-soft underline-offset-4 hover:text-forest-500">
                    All vendors
                  </Link>
                </li>
              </ul>
            </section>
          )}
        </div>
      </section>
    </div>
  );
}

/** Store profile beside the title: avatar, then the facts the original store page shows. */
function StoreFacts({ vendor: v, count }: { vendor: Vendor; count: number }) {
  return (
    <div className="hidden shrink-0 items-center gap-4 rounded-[1.4rem] bg-white/85 p-3 pr-5 shadow-[0_16px_34px_-26px_rgba(60,40,10,0.55)] ring-1 ring-forest-600/10 backdrop-blur-sm md:flex">
      <VendorAvatar vendor={v} size="md" />
      <ul className="grid grid-cols-2 gap-x-5 gap-y-1 text-[0.86rem] text-ink">
        <li className="inline-flex items-center gap-1.5">
          <Package className="size-4 text-forest-600" aria-hidden /> {plural(count, "product")}
        </li>
        <li className="inline-flex items-center gap-1.5">
          <CalendarDays className="size-4 text-forest-600" aria-hidden /> Since {monthYear(v.since)}
        </li>
        <li>
          <a href={`tel:${v.tel}`} className="inline-flex items-center gap-1.5 hover:text-forest-600">
            <Phone className="size-4 text-forest-600" aria-hidden /> {v.phone}
          </a>
        </li>
        <li className="inline-flex items-center gap-1.5 text-muted">
          <Star className="size-4 text-gold" aria-hidden /> No ratings yet
        </li>
      </ul>
    </div>
  );
}
