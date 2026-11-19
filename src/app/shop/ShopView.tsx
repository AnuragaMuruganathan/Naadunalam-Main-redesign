"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal, X } from "lucide-react";
import PageIntro from "@/components/shop/PageIntro";
import ProductCard from "@/components/shop/ProductCard";
import QuickView from "@/components/shop/QuickView";
import { PRODUCTS, SHOP_CATEGORIES, type Product } from "@/lib/catalog";
import { PACKS, PRICE_MAX, PRICE_MIN, SORTS, categoryOf, type SortValue } from "@/lib/shop";
import { rupees } from "@/lib/format";
import { scrollToHash } from "@/lib/gsap";

const PER_PAGE = 12;
const EASE = [0.22, 1, 0.36, 1] as const;

type Filters = {
  categories: string[];
  q: string;
  packs: string[];
  price: [number, number];
  sort: SortValue;
};

export default function ShopView({
  initial,
}: {
  initial: { categories: string[]; q: string; sort: SortValue; page: number };
}) {
  const [f, setF] = useState<Filters>({
    categories: initial.categories.filter((c) => categoryOf(c)),
    q: initial.q,
    packs: [],
    price: [PRICE_MIN, PRICE_MAX],
    sort: initial.sort,
  });
  const [page, setPage] = useState(initial.page);
  const [drawer, setDrawer] = useState(false);
  const [quick, setQuick] = useState<Product | null>(null);
  const closeQuick = useCallback(() => setQuick(null), []);

  const update = (patch: Partial<Filters>) => {
    setF((prev) => ({ ...prev, ...patch }));
    setPage(1);
  };

  const results = useMemo(() => {
    const term = f.q.trim().toLowerCase();
    const list = PRODUCTS.filter(
      (p) =>
        (!f.categories.length || f.categories.includes(p.category)) &&
        (!f.packs.length || f.packs.includes(p.pack)) &&
        p.price >= f.price[0] &&
        p.price <= f.price[1] &&
        (!term ||
          `${p.name} ${p.ta} ${categoryOf(p.category)?.name ?? ""} ${p.summary}`.toLowerCase().includes(term))
    );
    const sorted = [...list];
    if (f.sort === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
    if (f.sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    if (f.sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    return sorted;
  }, [f]);

  /** Category counts reflect every other active filter, so they predict what a click will show. */
  const catCounts = useMemo(() => {
    const term = f.q.trim().toLowerCase();
    const counts = new Map<string, number>();
    for (const p of PRODUCTS) {
      if (f.packs.length && !f.packs.includes(p.pack)) continue;
      if (p.price < f.price[0] || p.price > f.price[1]) continue;
      if (term && !`${p.name} ${p.ta} ${p.summary}`.toLowerCase().includes(term)) continue;
      counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
    }
    return counts;
  }, [f.q, f.packs, f.price]);

  const pages = Math.max(1, Math.ceil(results.length / PER_PAGE));
  const current = Math.min(page, pages);
  const shown = results.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  // Keep the URL shareable without re-rendering the server page
  useEffect(() => {
    const sp = new URLSearchParams();
    if (f.categories.length) sp.set("category", f.categories.join(","));
    if (f.q.trim()) sp.set("q", f.q.trim());
    if (f.sort !== "default") sp.set("sort", f.sort);
    if (current > 1) sp.set("page", String(current));
    const qs = sp.toString();
    window.history.replaceState(window.history.state, "", qs ? `/shop?${qs}` : "/shop");
  }, [f.categories, f.q, f.sort, current]);

  const goPage = (n: number) => {
    setPage(n);
    scrollToHash("#products");
  };

  const single = f.categories.length === 1 ? categoryOf(f.categories[0]) : undefined;
  const activeChips = [
    ...f.categories.map((c) => ({
      key: `c-${c}`,
      label: categoryOf(c)?.name ?? c,
      clear: () => update({ categories: f.categories.filter((x) => x !== c) }),
    })),
    ...f.packs.map((pk) => ({ key: `p-${pk}`, label: pk, clear: () => update({ packs: f.packs.filter((x) => x !== pk) }) })),
    ...(f.price[0] > PRICE_MIN || f.price[1] < PRICE_MAX
      ? [{ key: "price", label: `${rupees(f.price[0])} – ${rupees(f.price[1])}`, clear: () => update({ price: [PRICE_MIN, PRICE_MAX] }) }]
      : []),
    ...(f.q.trim() ? [{ key: "q", label: `“${f.q.trim()}”`, clear: () => update({ q: "" }) }] : []),
  ];
  const resetAll = () => update({ categories: [], packs: [], price: [PRICE_MIN, PRICE_MAX], q: "" });

  const filterPanel = (
    <FilterPanel
      f={f}
      update={update}
      catCounts={catCounts}
      onReset={activeChips.length ? resetAll : undefined}
    />
  );

  return (
    <>
      <PageIntro
        title={single ? single.name : "Shop All Products"}
        ta={single ? single.ta : "நாட்டு நலம் அங்காடி"}
        ornament={false}
        compact
      >
        <p className="w-fit rounded-full bg-white px-4 py-2 text-sm font-semibold text-forest-700 ring-1 ring-forest-600/12">
          {PRODUCTS.length} products · {SHOP_CATEGORIES.length} categories
        </p>
      </PageIntro>

      <section id="products" aria-label="Products" className="mx-auto max-w-[1320px] scroll-mt-32 px-5 pb-8 pt-4 md:px-8 md:pb-12 md:pt-6">
        <div className="lg:grid lg:grid-cols-[272px_1fr] lg:gap-10">
          <aside aria-label="Filter products" className="hidden lg:block">
            <div className="sticky top-[108px]">{filterPanel}</div>
          </aside>

          <div className="min-w-0">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Result count with the active filters beside it */}
              <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2">
                <p className="text-[0.95rem] text-muted" aria-live="polite">
                  {results.length
                    ? <>Showing <b className="text-ink">{(current - 1) * PER_PAGE + 1}–{Math.min(current * PER_PAGE, results.length)}</b> of <b className="text-ink">{results.length}</b> results</>
                    : "No matching products"}
                </p>
                {activeChips.length > 0 && (
                  <ul className="flex flex-wrap items-center gap-2" aria-label="Active filters">
                    {activeChips.map((c) => (
                      <li key={c.key}>
                        <button
                          type="button"
                          onClick={c.clear}
                          className="inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-full bg-forest-600/8 px-3 text-sm font-semibold text-forest-700 transition-colors hover:bg-forest-600/15"
                        >
                          {c.label}
                          <X className="size-3.5" aria-hidden />
                          <span className="sr-only">Remove filter</span>
                        </button>
                      </li>
                    ))}
                    <li>
                      <button type="button" onClick={resetAll} className="min-h-9 cursor-pointer px-2 text-sm font-bold text-gold underline-offset-4 hover:underline">
                        Clear all
                      </button>
                    </li>
                  </ul>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDrawer(true)}
                  className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-forest-600/20 bg-white px-4 text-sm font-bold text-forest-700 lg:hidden"
                >
                  <SlidersHorizontal className="size-4" aria-hidden />
                  Filters
                  {activeChips.length > 0 && (
                    <span className="grid size-5 place-items-center rounded-full bg-forest-600 text-[0.68rem] text-white">{activeChips.length}</span>
                  )}
                </button>
                <label className="sr-only" htmlFor="shop-sort">Sort products</label>
                <select
                  id="shop-sort"
                  value={f.sort}
                  onChange={(e) => update({ sort: e.target.value as SortValue })}
                  className="min-h-11 cursor-pointer rounded-full border border-forest-600/20 bg-white px-4 pr-9 text-sm font-semibold text-ink"
                >
                  {SORTS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>


            {shown.length ? (
              <ul className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
                {shown.map((p, i) => (
                  <motion.li
                    key={`${current}-${p.id}`}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, delay: Math.min(i, 8) * 0.04, ease: EASE }}
                  >
                    <ProductCard product={p} onQuickView={setQuick} eager={current === 1 && i < 4} />
                  </motion.li>
                ))}
              </ul>
            ) : (
              <div className="mt-6 rounded-3xl border border-dashed border-forest-600/25 bg-ivory px-6 py-16 text-center">
                <p className="font-serif text-2xl font-bold text-forest-700">Nothing matches those filters</p>
                <p className="mx-auto mt-2 max-w-[42ch] text-muted">
                  Try a different search, widen the price range, or browse every product.
                </p>
                <button
                  type="button"
                  onClick={resetAll}
                  className="mt-6 inline-flex min-h-11 cursor-pointer items-center rounded-full bg-forest-600 px-6 font-bold text-white transition-colors hover:bg-forest-700"
                >
                  Show all products
                </button>
              </div>
            )}

            {pages > 1 && <Pagination current={current} pages={pages} go={goPage} />}
          </div>
        </div>
      </section>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {drawer && (
          <Drawer onClose={() => setDrawer(false)} count={results.length}>
            {filterPanel}
          </Drawer>
        )}
      </AnimatePresence>

      <QuickView product={quick} onClose={closeQuick} />
    </>
  );
}

/* ---------------------------------------------------------------- */

function FilterPanel({
  f,
  update,
  catCounts,
  onReset,
}: {
  f: Filters;
  update: (p: Partial<Filters>) => void;
  catCounts: Map<string, number>;
  onReset?: () => void;
}) {
  const searchId = useId();
  const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  return (
    <div className="space-y-7">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl font-bold text-forest-700">Filter by</h2>
        {onReset && (
          <button type="button" onClick={onReset} className="min-h-9 cursor-pointer text-sm font-bold text-gold hover:underline">
            Reset
          </button>
        )}
      </div>

      <div>
        <label htmlFor={searchId} className="mb-2 block text-[0.78rem] font-bold uppercase tracking-[0.16em] text-forest-800">
          Search products
        </label>
        <div className="flex items-center gap-2 rounded-full border border-forest-600/20 bg-white px-4 focus-within:border-forest-600">
          <Search className="size-4 shrink-0 text-forest-600" aria-hidden />
          <input
            id={searchId}
            type="search"
            value={f.q}
            onChange={(e) => update({ q: e.target.value })}
            placeholder="Name, or in Tamil…"
            className="h-11 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted/70"
          />
        </div>
      </div>

      <fieldset>
        <legend className="mb-2 text-[0.78rem] font-bold uppercase tracking-[0.16em] text-forest-800">Categories</legend>
        <ul className="space-y-0.5">
          {SHOP_CATEGORIES.map((c) => {
            const on = f.categories.includes(c.slug);
            const n = catCounts.get(c.slug) ?? 0;
            return (
              <li key={c.slug}>
                <label
                  className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-2 py-1.5 transition-colors ${
                    on ? "bg-forest-600/10" : "hover:bg-forest-600/5"
                  } ${n === 0 && !on ? "opacity-50" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={() => update({ categories: toggle(f.categories, c.slug) })}
                    className="size-4 shrink-0 cursor-pointer accent-forest-600"
                  />
                  <span className="relative size-8 shrink-0 overflow-hidden rounded-lg bg-sand">
                    {c.img && <Image src={c.img} alt="" fill sizes="32px" className="object-cover" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`block truncate text-[0.9rem] ${on ? "font-bold text-forest-700" : "font-semibold text-ink"}`}>{c.name}</span>
                    <span lang="ta" className="block truncate font-tamil-sans text-[0.7rem] text-muted">{c.ta}</span>
                  </span>
                  <span className="text-xs font-semibold tabular-nums text-muted">{n}</span>
                </label>
              </li>
            );
          })}
        </ul>
      </fieldset>

      <PriceRange value={f.price} onChange={(price) => update({ price })} />

      <fieldset>
        <legend className="mb-2 text-[0.78rem] font-bold uppercase tracking-[0.16em] text-forest-800">Pack size</legend>
        <div className="flex flex-wrap gap-2">
          {PACKS.map((pk) => {
            const on = f.packs.includes(pk);
            return (
              <label
                key={pk}
                className={`inline-flex min-h-10 cursor-pointer items-center rounded-full border px-4 text-sm font-semibold transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-gold ${
                  on ? "border-forest-600 bg-forest-600 text-white" : "border-forest-600/20 bg-white text-ink hover:border-forest-600/50"
                }`}
              >
                <input type="checkbox" className="sr-only" checked={on} onChange={() => update({ packs: toggle(f.packs, pk) })} />
                {pk}
              </label>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}

function PriceRange({ value, onChange }: { value: [number, number]; onChange: (v: [number, number]) => void }) {
  const [lo, hi] = value;
  const pct = (n: number) => ((n - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;
  const thumb =
    "pointer-events-none absolute inset-x-0 top-1/2 h-0 w-full -translate-y-1/2 appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-5 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-forest-600 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-forest-600 [&::-webkit-slider-thumb]:shadow";
  return (
    <fieldset>
      <legend className="mb-2 text-[0.78rem] font-bold uppercase tracking-[0.16em] text-forest-800">Price</legend>
      <p className="mb-3 font-serif text-lg font-bold text-ink">
        {rupees(lo)} <span className="text-muted">–</span> {rupees(hi)}
      </p>
      <div className="relative h-6">
        <span className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-forest-600/15" />
        <span
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-forest-600"
          style={{ left: `${pct(lo)}%`, right: `${100 - pct(hi)}%` }}
        />
        <input
          type="range"
          aria-label="Minimum price"
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={5}
          value={lo}
          onChange={(e) => onChange([Math.min(Number(e.target.value), hi - 5), hi])}
          className={thumb}
        />
        <input
          type="range"
          aria-label="Maximum price"
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={5}
          value={hi}
          onChange={(e) => onChange([lo, Math.max(Number(e.target.value), lo + 5)])}
          className={thumb}
        />
      </div>
    </fieldset>
  );
}

function Pagination({ current, pages, go }: { current: number; pages: number; go: (n: number) => void }) {
  const btn = "grid size-11 cursor-pointer place-items-center rounded-full text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-35";
  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-1.5">
      <button type="button" className={`${btn} text-forest-700 hover:bg-forest-600/10`} disabled={current === 1} onClick={() => go(current - 1)} aria-label="Previous page">
        <ChevronLeft className="size-5" aria-hidden />
      </button>
      {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => go(n)}
          aria-current={n === current ? "page" : undefined}
          aria-label={`Page ${n}`}
          className={`${btn} ${n === current ? "bg-forest-600 text-white" : "text-ink hover:bg-forest-600/10"}`}
        >
          {n}
        </button>
      ))}
      <button type="button" className={`${btn} text-forest-700 hover:bg-forest-600/10`} disabled={current === pages} onClick={() => go(current + 1)} aria-label="Next page">
        <ChevronRight className="size-5" aria-hidden />
      </button>
    </nav>
  );
}

function Drawer({ children, onClose, count }: { children: React.ReactNode; onClose: () => void; count: number }) {
  const panel = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  });
  useEffect(() => {
    const lenis = (window as unknown as { __lenis?: { stop: () => void; start: () => void } }).__lenis;
    lenis?.stop();
    document.documentElement.style.overflow = "hidden";
    panel.current?.querySelector<HTMLElement>("button")?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close.current();
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      lenis?.start();
      document.documentElement.style.overflow = "";
    };
  }, []);

  return (
    <motion.div className="fixed inset-0 z-[70] lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div aria-hidden className="absolute inset-0 bg-forest-950/55" onClick={onClose} />
      <motion.div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label="Filters"
        initial={{ x: "-100%" }}
        animate={{ x: 0 }}
        exit={{ x: "-100%", transition: { duration: 0.25 } }}
        transition={{ duration: 0.45, ease: EASE }}
        className="absolute inset-y-0 left-0 flex w-[min(360px,90vw)] flex-col bg-paper"
      >
        <div className="flex items-center justify-between border-b border-forest-600/10 px-5 py-3">
          <p className="font-serif text-lg font-bold text-forest-700">Filters</p>
          <button type="button" onClick={onClose} aria-label="Close filters" className="grid size-11 cursor-pointer place-items-center rounded-full hover:bg-forest-600/8">
            <X className="size-5" aria-hidden />
          </button>
        </div>
        <div data-lenis-prevent className="flex-1 overflow-y-auto px-5 py-6">{children}</div>
        <div className="border-t border-forest-600/10 p-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-12 w-full cursor-pointer items-center justify-center rounded-full bg-forest-600 font-bold text-white transition-colors hover:bg-forest-700"
          >
            Show {count} {count === 1 ? "product" : "products"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
