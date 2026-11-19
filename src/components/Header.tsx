"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { ChevronDown, Heart, Menu, Phone, Search, ShoppingCart, Truck, User, X } from "lucide-react";
import BrandLockup from "./BrandLockup";
import { NAV, STORE } from "@/lib/content";
import { PRODUCTS, SHOP_CATEGORIES } from "@/lib/catalog";
import { scrollToHash } from "@/lib/gsap";
import { rupees } from "@/lib/format";
import { useShop } from "@/lib/store";

const TOPBAR_H = 36;
const MotionLink = motion.create(Link);
type NavItem = (typeof NAV)[number];
type NavLabel = NavItem["label"];

const lenis = () =>
  (window as unknown as { __lenis?: { stop: () => void; start: () => void } }).__lenis;

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [spy, setSpy] = useState<NavLabel>("Home");
  const [shopOpen, setShopOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [lang, setLang] = useState<"EN" | "த">("EN");
  const { cart, wishlist, hydrated } = useShop();
  const cartCount = hydrated ? cart.reduce((n, l) => n + l.qty, 0) : 0;
  const wishCount = hydrated ? wishlist.length : 0;

  /*
   * On the homepage the active item follows the section in view: the last one
   * whose top has passed a reading line a third of the way below the header.
   * Short sections at the very end (the footer) can never reach that line, so
   * the last stretch of scroll is handed to them. A click claims the highlight
   * until its smooth scroll ends. Other pages simply highlight their own item.
   */
  const lockUntil = useRef(0);
  const updateSpy = useCallback(() => {
    if (window.location.pathname !== "/" || performance.now() < lockUntil.current) return;
    const vh = window.innerHeight;
    const headerH = window.innerWidth >= 768 ? 86 : 76;
    const line = headerH + (vh - headerH) / 3;
    const remaining = Math.max(0, document.documentElement.scrollHeight - vh - window.scrollY);
    const sections = NAV.filter((n): n is Extract<NavItem, { section: string }> => "section" in n)
      .map((n) => ({ label: n.label as NavLabel, el: document.querySelector(n.section) }))
      .filter((s): s is { label: NavLabel; el: Element } => !!s.el)
      .map((s) => ({ label: s.label, top: s.el.getBoundingClientRect().top }))
      .sort((a, b) => a.top - b.top);
    if (!sections.length) return;

    const passed = sections.filter((s) => s.top <= line);
    let next = passed[passed.length - 1] ?? sections[0];
    const unreachable = sections.filter((s) => s.top - remaining > line);
    const ramp = vh * 0.6;
    if (unreachable.length && remaining < ramp) {
      const slice = ramp / (unreachable.length + 1);
      const idx = Math.min(unreachable.length, Math.floor((ramp - remaining) / slice));
      if (idx > 0) next = unreachable[idx - 1];
    }
    setSpy(next.label);
  }, []);

  useMotionValueEvent(scrollY, "change", (y) => {
    setScrolled(y > 40);
    updateSpy();
  });

  useEffect(() => {
    updateSpy();
    window.addEventListener("resize", updateSpy);
    return () => window.removeEventListener("resize", updateSpy);
  }, [updateSpy]);

  // Close overlays on navigation; when arriving on the homepage with a hash
  // (e.g. /#generations from another page), land on it below the fixed header
  // once the pinned sections have been laid out.
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
    setShopOpen(false);
    if (pathname !== "/" || !window.location.hash) return;
    const hash = window.location.hash;
    const t = window.setTimeout(() => scrollToHash(hash), 350);
    return () => window.clearTimeout(t);
  }, [pathname]);

  // Pause smooth scroll while the mobile menu is open
  useEffect(() => {
    if (menuOpen) lenis()?.stop();
    else lenis()?.start();
    document.documentElement.style.overflow = menuOpen ? "hidden" : "";
  }, [menuOpen]);

  const pageActive: NavLabel | null = isHome
    ? spy
    : pathname.startsWith("/shop")
      ? "Shop"
      : pathname.startsWith("/wishlist")
        ? "Wishlist"
        : null;

  /** Section links scroll in place on the homepage and navigate everywhere else. */
  const go = (e: React.MouseEvent, item: NavItem) => {
    setShopOpen(false);
    if (!isHome || !("section" in item)) {
      setMenuOpen(false);
      return;
    }
    // On the homepage, "Shop" still opens the shop page; the others scroll.
    if (item.label === "Shop") return;
    e.preventDefault();
    setMenuOpen(false);
    // The open mobile menu pauses Lenis and locks overflow; release both
    // before scrolling, or a stopped Lenis silently drops the scrollTo.
    lenis()?.start();
    document.documentElement.style.overflow = "";
    setSpy(item.label);
    lockUntil.current = performance.now() + 1400;
    history.replaceState(null, "", item.section === "#top" ? "/" : `/${item.section}`);
    scrollToHash(item.section);
  };

  const indicator = hovered ?? pageActive;

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-50"
        animate={{ y: scrolled ? -TOPBAR_H : 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Top utility bar */}
        <div className="bg-forest-800 text-[0.8rem] text-white/95" style={{ height: TOPBAR_H }}>
          <div className="mx-auto flex h-full max-w-[1320px] items-center justify-between gap-4 px-4 md:px-8">
            <p className="truncate font-medium tracking-wide">From Our Land to Your Family</p>
            <div className="flex shrink-0 items-center gap-4">
              <span className="hidden items-center gap-1.5 lg:flex">
                <Truck className="size-3.5 text-gold-soft" aria-hidden />
                {STORE.delivery}
              </span>
              <span aria-hidden className="hidden h-3.5 w-px bg-white/40 lg:block" />
              <a href={`tel:${STORE.tel}`} className="flex items-center gap-1.5 transition-colors hover:text-gold-soft">
                <Phone className="size-3.5" aria-hidden />
                <span className="max-sm:sr-only">Call {STORE.phone}</span>
              </a>
              <span aria-hidden className="hidden h-3.5 w-px bg-white/40 sm:block" />
              <button
                type="button"
                onClick={() => setLang((l) => (l === "EN" ? "த" : "EN"))}
                className="hidden cursor-pointer items-center gap-1 transition-colors hover:text-gold-soft sm:flex"
                aria-label={`Language: ${lang === "EN" ? "English" : "Tamil"}. Switch language`}
              >
                {lang} <ChevronDown className="size-3.5" aria-hidden />
              </button>
            </div>
          </div>
        </div>

        {/* Main header */}
        <div
          className={`relative border-b bg-paper transition-[box-shadow,border-color] duration-500 ${
            scrolled || !isHome ? "border-forest-600/12" : "border-transparent"
          }`}
        >
          <div className="mx-auto flex h-[76px] max-w-[1320px] items-center justify-between gap-3 px-4 md:h-[86px] md:gap-6 md:px-8">
            <Link
              href="/"
              onClick={(e) => go(e, NAV[0])}
              aria-label="Naadu Nalam — home"
              className="min-w-0"
            >
              <BrandLockup />
            </Link>

            <nav aria-label="Primary" className="hidden xl:block" onMouseLeave={() => setHovered(null)}>
              <ul className="flex items-center gap-0.5 2xl:gap-2">
                {NAV.map((item) => {
                  const isActive = pageActive === item.label;
                  const isShop = "dropdown" in item;
                  return (
                    <li
                      key={item.label}
                      className="relative"
                      onMouseEnter={() => {
                        setHovered(item.label);
                        if (isShop) setShopOpen(true);
                      }}
                      onMouseLeave={() => isShop && setShopOpen(false)}
                      onKeyDown={(e) => isShop && e.key === "Escape" && setShopOpen(false)}
                    >
                      <Link
                        href={item.href}
                        onClick={(e) => go(e, item)}
                        onFocus={() => isShop && setShopOpen(true)}
                        aria-current={isActive ? (isHome ? "true" : "page") : undefined}
                        aria-haspopup={isShop ? "true" : undefined}
                        aria-expanded={isShop ? shopOpen : undefined}
                        className={`relative flex items-center gap-1 whitespace-nowrap px-3 py-3 text-[0.95rem] font-semibold transition-colors ${
                          isActive ? "text-forest-600" : "text-ink hover:text-forest-600"
                        }`}
                      >
                        {item.label}
                        {item.label === "Wishlist" && wishCount > 0 && (
                          <span className="grid h-[18px] min-w-[18px] place-items-center rounded-full bg-gold-soft px-1 text-[0.66rem] font-bold text-forest-950">
                            {wishCount}
                            <span className="sr-only"> saved</span>
                          </span>
                        )}
                        {isShop && (
                          <ChevronDown
                            aria-hidden
                            className={`size-3.5 transition-transform duration-300 ${shopOpen ? "rotate-180" : ""}`}
                          />
                        )}
                        {indicator === item.label && (
                          <motion.span
                            layoutId="nav-underline"
                            className="absolute inset-x-3 -bottom-0.5 h-[2px] rounded-full bg-forest-600"
                            transition={{ type: "spring", stiffness: 420, damping: 34 }}
                          />
                        )}
                      </Link>

                      {isShop && (
                        <AnimatePresence>
                          {shopOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: 10, scale: 0.98 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 6, scale: 0.98, transition: { duration: 0.15 } }}
                              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                              className="absolute left-1/2 top-full z-10 w-[760px] -translate-x-1/2 pt-3"
                            >
                              <div className="rounded-2xl border border-forest-600/10 bg-paper p-3 shadow-[0_24px_60px_-20px_rgba(10,57,25,0.35)]">
                                <ul className="grid grid-cols-3 gap-1">
                                  {SHOP_CATEGORIES.map((c) => (
                                    <li key={c.slug}>
                                      <Link
                                        href={`/shop?category=${c.slug}`}
                                        onClick={() => setShopOpen(false)}
                                        className="group flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-cream"
                                      >
                                        <span className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-sand">
                                          {c.img && (
                                            <Image src={c.img} alt="" fill sizes="44px" className="object-cover transition-transform duration-500 group-hover:scale-110" />
                                          )}
                                        </span>
                                        <span className="flex min-w-0 flex-col">
                                          <span className="truncate text-sm font-bold text-ink">{c.name}</span>
                                          <span lang="ta" className="truncate font-tamil-sans text-xs text-muted">{c.ta}</span>
                                        </span>
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                                <Link
                                  href="/shop"
                                  onClick={() => setShopOpen(false)}
                                  className="mt-2 flex items-center justify-between rounded-xl bg-forest-600 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-forest-700"
                                >
                                  Shop all {PRODUCTS.length} products
                                  <span aria-hidden>→</span>
                                </Link>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      )}
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="flex shrink-0 items-center gap-0.5 md:gap-1.5">
              <IconBtn
                label={searchOpen ? "Close search" : "Search products"}
                className="max-sm:hidden"
                onClick={() => setSearchOpen((o) => !o)}
                expanded={searchOpen}
              >
                {searchOpen ? <X className="size-[22px]" strokeWidth={1.8} /> : <Search className="size-[22px]" strokeWidth={1.8} />}
              </IconBtn>
              <IconBtn label={`Wishlist, ${wishCount} saved`} href="/wishlist" className="xl:hidden">
                <Heart className="size-[22px]" strokeWidth={1.8} />
                <Badge n={wishCount} tone="gold" />
              </IconBtn>
              <IconBtn label="Account" className="max-md:hidden">
                <User className="size-[22px]" strokeWidth={1.8} />
              </IconBtn>
              <IconBtn label={`Cart, ${cartCount} ${cartCount === 1 ? "item" : "items"}`} href="/cart">
                <ShoppingCart className="size-[22px]" strokeWidth={1.8} />
                <Badge n={cartCount} />
              </IconBtn>
              <IconBtn
                label={menuOpen ? "Close menu" : "Open menu"}
                className="xl:hidden"
                onClick={() => setMenuOpen((o) => !o)}
                expanded={menuOpen}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={menuOpen ? "x" : "m"}
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {menuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
                  </motion.span>
                </AnimatePresence>
              </IconBtn>
            </div>
          </div>

          <AnimatePresence>
            {searchOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6, transition: { duration: 0.15 } }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-x-0 top-full border-b border-forest-600/12 bg-paper shadow-[0_24px_40px_-28px_rgba(10,57,25,0.45)]"
              >
                <div className="mx-auto max-w-[760px] px-4 py-4 md:px-8">
                  <ProductSearch
                    autoFocus
                    onDone={(href) => {
                      setSearchOpen(false);
                      router.push(href);
                    }}
                    onEscape={() => setSearchOpen(false)}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-40 overflow-y-auto bg-forest-900 xl:hidden"
            data-lenis-prevent
            initial={{ clipPath: "circle(0% at 100% 0%)" }}
            animate={{ clipPath: "circle(150% at 100% 0%)" }}
            exit={{ clipPath: "circle(0% at 100% 0%)", transition: { duration: 0.45, ease: [0.65, 0, 0.35, 1] } }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <nav aria-label="Mobile" className="flex min-h-full flex-col justify-center px-8 pb-10 pt-32">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12, duration: 0.4 }}
                className="mb-6"
              >
                <ProductSearch
                  tone="dark"
                  onDone={(href) => {
                    setMenuOpen(false);
                    router.push(href);
                  }}
                />
              </motion.div>
              <ul className="space-y-0.5">
                {[...NAV, { label: "Your Cart", href: "/cart" } as const].map((item, i) => (
                  <motion.li
                    key={item.label}
                    initial={{ opacity: 0, x: -24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + i * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link
                      href={item.href}
                      onClick={(e) => (item.label === "Your Cart" ? setMenuOpen(false) : go(e, item as NavItem))}
                      className={`flex items-center gap-3 py-2 font-serif text-[1.85rem] font-semibold ${
                        pageActive === item.label || (item.label === "Your Cart" && pathname === "/cart")
                          ? "text-gold-soft"
                          : "text-white"
                      }`}
                    >
                      {item.label}
                      {item.label === "Wishlist" && wishCount > 0 && (
                        <span className="rounded-full bg-white/15 px-2.5 py-0.5 font-sans text-sm font-bold">{wishCount}</span>
                      )}
                      {item.label === "Your Cart" && cartCount > 0 && (
                        <span className="rounded-full bg-white/15 px-2.5 py-0.5 font-sans text-sm font-bold">{cartCount}</span>
                      )}
                    </Link>
                  </motion.li>
                ))}
              </ul>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-10 space-y-2 text-white/75"
              >
                <p lang="ta" className="font-tamil text-lg">ஏழு தலைமுறை, ஒரே பாரம்பரியம்</p>
                <a href={`tel:${STORE.tel}`} className="inline-flex min-h-11 items-center gap-2 text-white">
                  <Phone className="size-4" aria-hidden /> {STORE.phone}
                </a>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/** Search box with live product suggestions; submits to /shop?q=… */
function ProductSearch({
  onDone,
  onEscape,
  autoFocus,
  tone = "light",
}: {
  onDone: (href: string) => void;
  onEscape?: () => void;
  autoFocus?: boolean;
  tone?: "light" | "dark";
}) {
  const id = useId();
  const [q, setQ] = useState("");
  const term = q.trim().toLowerCase();
  const hits = useMemo(
    () =>
      term.length < 2
        ? []
        : PRODUCTS.filter((p) => `${p.name} ${p.ta}`.toLowerCase().includes(term)).slice(0, 5),
    [term]
  );
  const dark = tone === "dark";

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        onDone(term ? `/shop?q=${encodeURIComponent(q.trim())}` : "/shop");
      }}
      onKeyDown={(e) => e.key === "Escape" && onEscape?.()}
    >
      <label htmlFor={id} className="sr-only">Search products</label>
      <div
        className={`flex items-center gap-2 rounded-full border px-4 ${
          dark ? "border-white/25 bg-white/10 text-white" : "border-forest-600/20 bg-white text-ink"
        }`}
      >
        <Search className={`size-5 shrink-0 ${dark ? "text-white/70" : "text-forest-600"}`} aria-hidden />
        <input
          id={id}
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          autoFocus={autoFocus}
          autoComplete="off"
          placeholder="Search rice, millets, oils… or அவல்"
          className={`h-12 min-w-0 flex-1 bg-transparent text-base outline-none ${
            dark ? "placeholder:text-white/55" : "placeholder:text-muted/70"
          }`}
        />
        <button
          type="submit"
          className={`shrink-0 cursor-pointer rounded-full px-4 py-1.5 text-sm font-bold transition-colors ${
            dark ? "bg-gold-soft text-forest-950 hover:bg-white" : "bg-forest-600 text-white hover:bg-forest-700"
          }`}
        >
          Search
        </button>
      </div>
      {hits.length > 0 && (
        <ul className={`mt-3 divide-y overflow-hidden rounded-2xl ${dark ? "divide-white/10 bg-white/5" : "divide-forest-600/8 bg-white ring-1 ring-forest-600/10"}`}>
          {hits.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => onDone(`/shop?q=${encodeURIComponent(p.name)}`)}
                className={`flex w-full cursor-pointer items-center gap-3 px-3 py-2 text-left transition-colors ${
                  dark ? "hover:bg-white/10" : "hover:bg-cream"
                }`}
              >
                <span className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-sand">
                  <Image src={p.img} alt="" fill sizes="40px" className="object-cover" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className={`block truncate text-sm font-bold ${dark ? "text-white" : "text-ink"}`}>{p.name}</span>
                  <span lang="ta" className={`block truncate font-tamil-sans text-xs ${dark ? "text-white/65" : "text-muted"}`}>{p.ta}</span>
                </span>
                <span className={`shrink-0 text-sm font-bold ${dark ? "text-gold-soft" : "text-forest-600"}`}>{rupees(p.price)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}

function Badge({ n, tone = "forest" }: { n: number; tone?: "forest" | "gold" }) {
  return (
    <AnimatePresence>
      {n > 0 && (
        <motion.span
          key={n}
          aria-hidden
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.4, opacity: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 22 }}
          className={`absolute right-0.5 top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full px-1 text-[0.62rem] font-bold ring-2 ring-paper ${
            tone === "gold" ? "bg-gold-soft text-forest-950" : "bg-forest-600 text-white"
          }`}
        >
          {n > 99 ? "99+" : n}
        </motion.span>
      )}
    </AnimatePresence>
  );
}

function IconBtn({
  label,
  children,
  className = "",
  onClick,
  href,
  expanded,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  href?: string;
  expanded?: boolean;
}) {
  const cls = `relative inline-flex size-10 cursor-pointer items-center justify-center rounded-full text-ink transition-colors hover:bg-forest-600/8 hover:text-forest-600 sm:size-11 ${className}`;
  const motionProps = { whileHover: { scale: 1.08 }, whileTap: { scale: 0.92 } };
  if (href) {
    return (
      <MotionLink href={href} aria-label={label} className={cls} {...motionProps}>
        {children}
      </MotionLink>
    );
  }
  return (
    <motion.button type="button" aria-label={label} aria-expanded={expanded} onClick={onClick} className={cls} {...motionProps}>
      {children}
    </motion.button>
  );
}
