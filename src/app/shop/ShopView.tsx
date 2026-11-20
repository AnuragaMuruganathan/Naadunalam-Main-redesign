"use client";

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, ChevronLeft, ChevronRight, Filter, RotateCcw, Search, SlidersHorizontal, X } from "lucide-react";
import ShopBanner from "@/components/shop/ShopBanner";
import ShopDecor from "@/components/shop/ShopDecor";
import ProductTile from "@/components/shop/ProductTile";
import { PRODUCTS, SHOP_CATEGORIES } from "@/lib/catalog";
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

  // First screen = banner + filter panel + one row of products, nothing more:
  // size the banner to whatever height is left after the header, panel and first row.
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
      const min = innerWidth >= 768 ? 140 : 130;
      root.style.setProperty("--shop-banner-h", `${Math.round(Math.min(640, Math.max(min, innerHeight - used)))}px`);
    };
    fit();
    const ro = new ResizeObserver(() => fit());
    const row = root.querySelector("[data-shop-grid] > *");
    if (row) ro.observe(row);
    addEventListener("resize", fit);
    return () => {
      ro.disconnect();
      removeEventListener("resize", fit);
    };
  }, [current, shown.length === 0]);

  const goPage = (n: number) => {
    setPage(n);
    scrollToHash("#products");
  };

  const single = f.categories.length === 1 ? categoryOf(f.categories[0]) : undefined;
  const priceActive = f.price[0] > PRICE_MIN || f.price[1] < PRICE_MAX;
  const activeCount = f.categories.length + f.packs.length + (priceActive ? 1 : 0) + (f.q.trim() ? 1 : 0);
  const resetAll = () => update({ categories: [], packs: [], price: [PRICE_MIN, PRICE_MAX], q: "" });
  const from = (current - 1) * PER_PAGE + 1;
  const to = Math.min(current * PER_PAGE, results.length);

  const sortSelect = (
    <>
      <label className="sr-only" htmlFor="shop-sort">Sort products</label>
      <span className="relative inline-flex">
        <select
          id="shop-sort"
          value={f.sort}
          onChange={(e) => update({ sort: e.target.value as SortValue })}
          className="min-h-11 cursor-pointer appearance-none rounded-full bg-forest-700 pl-5 pr-11 text-[0.855rem] font-semibold text-white shadow-[0_10px_20px_-12px_rgba(10,57,25,0.8)] transition-colors hover:bg-forest-800 sm:pl-6"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value} className="bg-white text-ink">{s.label}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-white" aria-hidden />
      </span>
    </>
  );

  return (
    <div ref={fitRoot}>
      <ShopBanner title={single ? single.name : "Shop All Products"} />

      <section id="products" aria-label="Products" className="relative isolate flow-root scroll-mt-32 overflow-x-clip">
        <ShopDecor />
        <div className="mx-auto max-w-[1480px] px-3 pb-6 sm:px-4 md:px-6 md:pb-8">
        {/* Filter panel, right under the banner */}
        <div data-shop-panel className="relative z-20 mt-3 rounded-[1.6rem] bg-white p-2.5 shadow-[0_18px_40px_-28px_rgba(60,40,10,0.5)] ring-1 ring-forest-600/8 md:mt-4 lg:px-5 lg:py-4">
          {/* Desktop: one-line filter bar with dropdowns */}
          <FilterBar f={f} update={update} catCounts={catCounts} activeCount={activeCount} priceActive={priceActive} onReset={resetAll} sort={sortSelect} />

          {/* Phones / tablets: search, then Filters drawer + sort */}
          <div className="space-y-2.5 lg:hidden">
            <SearchPill value={f.q} onChange={(q) => update({ q })} />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDrawer(true)}
                className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-forest-600/15 bg-white px-5 text-[0.855rem] font-semibold text-ink transition-colors hover:border-forest-600/45"
              >
                <SlidersHorizontal className="size-4 text-forest-600" aria-hidden />
                Filters
                {activeCount > 0 && (
                  <span className="grid size-5 place-items-center rounded-full bg-forest-600 text-[0.625rem] text-white">{activeCount}</span>
                )}
              </button>
              <div className="ml-auto">{sortSelect}</div>
            </div>
          </div>
        </div>


        {shown.length ? (
          <ul data-shop-grid className="mt-4 grid grid-cols-2 gap-2.5 sm:gap-3.5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 xl:gap-4">
            {shown.map((p, i) => (
              <motion.li
                key={`${current}-${p.id}`}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: Math.min(i, 11) * 0.035, ease: EASE }}
              >
                <ProductTile product={p} eager={current === 1 && i < 6} />
              </motion.li>
            ))}
          </ul>
        ) : (
          <div className="mt-5 rounded-3xl border border-dashed border-forest-600/25 bg-ivory px-6 py-16 text-center">
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

        {/* Result count · page numbers */}
        {results.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
            <p className="text-[0.875rem] text-muted" aria-live="polite">
              Showing <span className="font-semibold text-ink">{from}–{to}</span> of{" "}
              <span className="font-semibold text-ink">{results.length}</span> products
            </p>
            {pages > 1 && <Pagination current={current} pages={pages} go={goPage} compact />}
          </div>
        )}
        </div>
      </section>

      {/* Phone filter drawer */}
      <AnimatePresence>
        {drawer && (
          <Drawer onClose={() => setDrawer(false)} count={results.length}>
            <div className="space-y-7">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-xl font-bold text-forest-700">Filter by</h2>
                {activeCount > 0 && (
                  <button type="button" onClick={resetAll} className="min-h-9 cursor-pointer text-sm font-bold text-gold hover:underline">
                    Reset filter
                  </button>
                )}
              </div>
              <Group label="Categories">
                <CategoryOptions f={f} update={update} catCounts={catCounts} />
              </Group>
              <PriceRange value={f.price} onChange={(price) => update({ price })} />
              <Group label="Pack size">
                <PackOptions f={f} update={update} />
              </Group>
            </div>
          </Drawer>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------------------------------------------------------------- Filter bar (desktop) */

type Menu = "cat" | "price" | "pack" | null;
const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

function FilterBar({
  f,
  update,
  catCounts,
  activeCount,
  priceActive,
  onReset,
  sort,
}: {
  f: Filters;
  update: (p: Partial<Filters>) => void;
  catCounts: Map<string, number>;
  activeCount: number;
  priceActive: boolean;
  onReset: () => void;
  sort: React.ReactNode;
}) {
  const [open, setOpen] = useState<Menu>(null);
  const bar = useRef<HTMLDivElement>(null);

  // One menu at a time; close on outside click or Escape
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!bar.current?.contains(e.target as Node)) setOpen(null);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const menu = (id: Exclude<Menu, null>, label: string, count: number, panel: React.ReactNode, width: string) => (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => (o === id ? null : id))}
        aria-expanded={open === id}
        aria-controls={`filter-${id}`}
        className={`inline-flex min-h-11 cursor-pointer items-center gap-2 whitespace-nowrap rounded-full border px-5 text-[0.855rem] font-medium transition-colors ${
          open === id || count
            ? "border-forest-600 bg-forest-600/8 text-forest-700"
            : "border-forest-600/15 bg-white text-ink hover:border-forest-600/45"
        }`}
      >
        {label}
        {count > 0 && (
          <span className="grid h-5 min-w-5 place-items-center rounded-full bg-forest-600 px-1 text-[0.625rem] text-white">{count}</span>
        )}
        <ChevronDown className={`size-4 transition-transform duration-300 ${open === id ? "rotate-180" : ""}`} aria-hidden />
      </button>
      <AnimatePresence>
        {open === id && (
          <motion.div
            id={`filter-${id}`}
            role="group"
            aria-label={label}
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98, transition: { duration: 0.15 } }}
            transition={{ duration: 0.25, ease: EASE }}
            className={`absolute left-0 top-full z-30 mt-2 origin-top-left rounded-2xl bg-paper p-4 shadow-[0_24px_60px_-20px_rgba(10,57,25,0.4)] ring-1 ring-forest-600/12 ${width}`}
          >
            {panel}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div ref={bar} className="flex flex-wrap items-center gap-3 max-lg:hidden xl:flex-nowrap xl:justify-between [&>*]:shrink-0">
      <span className="inline-flex items-center gap-2 whitespace-nowrap pl-1 pr-2 text-[0.895rem] font-semibold text-ink">
        <Filter className="size-[18px] text-forest-700" strokeWidth={2} aria-hidden />
        Filter by
      </span>
      <div className="w-[280px] xl:w-auto xl:min-w-[180px] xl:max-w-[310px] xl:flex-1 xl:shrink!">
        <SearchPill value={f.q} onChange={(q) => update({ q })} />
      </div>
      {menu("cat", "Categories", f.categories.length, <CategoryOptions f={f} update={update} catCounts={catCounts} columns />, "w-[560px]")}
      {menu("price", "Price", priceActive ? 1 : 0, <PriceRange value={f.price} onChange={(price) => update({ price })} bare />, "w-[320px]")}
      {menu("pack", "Pack Size", f.packs.length, <PackOptions f={f} update={update} />, "w-[320px]")}
      <button
        type="button"
        onClick={() => {
          onReset();
          setOpen(null);
        }}
        disabled={!activeCount}
        className="inline-flex min-h-11 cursor-pointer items-center gap-2 whitespace-nowrap rounded-full px-3 text-[0.855rem] font-medium text-forest-700 transition-colors hover:bg-forest-600/8 disabled:cursor-not-allowed disabled:text-muted/70 disabled:hover:bg-transparent"
      >
        <RotateCcw className="size-4" aria-hidden />
        Reset Filter
      </button>
      <div className="max-xl:ml-auto">{sort}</div>
    </div>
  );
}

/* ---------------------------------------------------------------- Shared filter pieces */

function SearchPill({ value, onChange }: { value: string; onChange: (q: string) => void }) {
  const id = useId();
  return (
    <div className="flex items-center gap-2.5 rounded-full border border-forest-600/15 bg-white px-5 transition-colors focus-within:border-forest-600 hover:border-forest-600/45">
      <label htmlFor={id} className="sr-only">Search products</label>
      <Search className="size-[18px] shrink-0 text-forest-600" aria-hidden />
      <input
        id={id}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search products…"
        className="h-11 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted/80"
      />
      {value && (
        <button type="button" onClick={() => onChange("")} aria-label="Clear search" className="-mr-2 grid size-8 cursor-pointer place-items-center rounded-full text-muted hover:bg-forest-600/8">
          <X className="size-4" aria-hidden />
        </button>
      )}
    </div>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-2 text-[0.749rem] font-bold uppercase tracking-[0.16em] text-forest-800">{label}</legend>
      {children}
    </fieldset>
  );
}

function CategoryOptions({
  f,
  update,
  catCounts,
  columns = false,
}: {
  f: Filters;
  update: (p: Partial<Filters>) => void;
  catCounts: Map<string, number>;
  columns?: boolean;
}) {
  return (
    <ul className={columns ? "grid grid-cols-2 gap-x-2 gap-y-0.5" : "space-y-0.5"}>
      {SHOP_CATEGORIES.map((c) => {
        const on = f.categories.includes(c.slug);
        const n = catCounts.get(c.slug) ?? 0;
        return (
          <li key={c.slug} className="min-w-0">
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
                <span className={`block truncate text-[0.855rem] ${on ? "font-bold text-forest-700" : "font-semibold text-ink"}`}>{c.name}</span>
                <span lang="ta" className="block truncate text-[0.655rem] text-muted">{c.ta}</span>
              </span>
              <span className="text-xs font-semibold tabular-nums text-muted">{n}</span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}

function PackOptions({ f, update }: { f: Filters; update: (p: Partial<Filters>) => void }) {
  return (
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
  );
}

function PriceRange({ value, onChange, bare = false }: { value: [number, number]; onChange: (v: [number, number]) => void; bare?: boolean }) {
  const [lo, hi] = value;
  const pct = (n: number) => ((n - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;
  const thumb =
    "pointer-events-none absolute inset-x-0 top-1/2 h-0 w-full -translate-y-1/2 appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-5 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-forest-600 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-forest-600 [&::-webkit-slider-thumb]:shadow";
  return (
    <fieldset className="min-w-0">
      <legend className={bare ? "sr-only" : "mb-2 text-[0.749rem] font-bold uppercase tracking-[0.16em] text-forest-800"}>Price</legend>
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

function Pagination({ current, pages, go, compact = false }: { current: number; pages: number; go: (n: number) => void; compact?: boolean }) {
  const btn = `grid ${compact ? "size-10 border border-forest-600/15 bg-white/60" : "size-11"} cursor-pointer place-items-center rounded-full text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-35`;
  return (
    <nav aria-label="Pagination" className={compact ? "flex items-center justify-center gap-1.5 max-sm:[&>[data-far]]:hidden" : "mt-10 flex items-center justify-center gap-1.5"}>
      <button type="button" className={`${btn} text-forest-700 hover:bg-forest-600/10`} disabled={current === 1} onClick={() => go(current - 1)} aria-label="Previous page">
        <ChevronLeft className="size-5" aria-hidden />
      </button>
      {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          data-far={Math.abs(n - current) > 2 || undefined}
          type="button"
          onClick={() => go(n)}
          aria-current={n === current ? "page" : undefined}
          aria-label={`Page ${n}`}
          className={`${btn} ${n === current ? "border-forest-600! bg-forest-600! text-white shadow-[0_8px_18px_-8px_rgba(10,57,25,0.6)]" : "text-ink hover:bg-forest-600/10"}`}
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
