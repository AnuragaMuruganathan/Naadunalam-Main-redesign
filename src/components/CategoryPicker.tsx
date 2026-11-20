"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Amphora,
  Bean,
  Boxes,
  Check,
  ChevronDown,
  CookingPot,
  Droplet,
  Flower,
  IceCreamBowl,
  LayoutGrid,
  Leaf,
  Soup,
  Sprout,
  Wheat,
  type LucideIcon,
} from "lucide-react";
import { SHOP_CATEGORIES } from "@/lib/catalog";
import { Leaf as LeafArt } from "./Leaf";

const ICONS: Record<string, LucideIcon> = {
  "aval-flakes": Wheat,
  "oil-vinegers": Droplet,
  "health-mixes": Soup,
  "herbal-wellness": Leaf,
  honey: Amphora,
  "paruppu-pulses": Bean,
  "masala-podi": CookingPot,
  siruthaniyam: Sprout,
  "natural-sweeteners": Boxes,
  "other-rice": IceCreamBowl,
  "personal-care": Flower,
  "rice-grains": Wheat,
};

const OPTIONS = [
  { slug: "", name: "All Categories", icon: LayoutGrid },
  ...SHOP_CATEGORIES.map((c) => ({ slug: c.slug, name: c.name, icon: ICONS[c.slug] ?? Leaf })),
];

/**
 * "All Categories" picker for the search bar: a pill trigger that opens a
 * cream panel listing every category with its icon; the chosen one is tinted
 * green with a check. A proper listbox: arrow keys, Home/End, Enter/Space,
 * Escape (closes the menu only), click outside to close.
 */
export default function CategoryPicker({
  value,
  onChange,
  dark = false,
}: {
  value: string;
  onChange: (slug: string) => void;
  dark?: boolean;
}) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const selected = Math.max(0, OPTIONS.findIndex((o) => o.slug === value));
  const current = OPTIONS[selected];
  const CurrentIcon = current.slug ? current.icon : LayoutGrid;

  // Start on the selected option and move focus into the list
  useEffect(() => {
    if (!open) return;
    setActive(selected);
    const raf = requestAnimationFrame(() => list.current?.focus());
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("pointerdown", onDown);
    };
    // selected only matters at the moment the menu opens
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Keep the keyboard-highlighted option in view
  useEffect(() => {
    if (open) list.current?.querySelector(`[data-i="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const choose = (i: number) => {
    onChange(OPTIONS[i].slug);
    setOpen(false);
    button.current?.focus();
  };

  const onListKey = (e: React.KeyboardEvent) => {
    const last = OPTIONS.length - 1;
    if (e.key === "ArrowDown") setActive((a) => Math.min(last, a + 1));
    else if (e.key === "ArrowUp") setActive((a) => Math.max(0, a - 1));
    else if (e.key === "Home") setActive(0);
    else if (e.key === "End") setActive(last);
    else if (e.key === "Enter" || e.key === " ") choose(active);
    else if (e.key === "Escape") {
      setOpen(false);
      button.current?.focus();
    } else if (e.key === "Tab") return setOpen(false);
    else return;
    e.preventDefault();
    e.stopPropagation(); // Escape here closes the menu, not the whole search panel
  };

  return (
    <div ref={root} className="relative shrink-0">
      <button
        ref={button}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-label={`Category: ${current.name}`}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className={`flex h-11 max-w-[14rem] cursor-pointer items-center gap-2.5 rounded-full pl-3 pr-3 text-[0.95rem] font-semibold transition-colors ${
          dark
            ? `text-white ${open ? "bg-white/15" : "hover:bg-white/10"}`
            : `text-ink ${open ? "bg-[#eef5e4] ring-1 ring-forest-600/35" : "hover:bg-cream"}`
        }`}
      >
        <CurrentIcon className={`size-5 shrink-0 ${dark ? "text-white/80" : "text-forest-800"}`} strokeWidth={1.8} aria-hidden />
        <span className="truncate">{current.name}</span>
        <ChevronDown
          className={`ml-1 size-4 shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""} ${dark ? "text-white/80" : "text-forest-800"}`}
          strokeWidth={2.2}
          aria-hidden
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98, transition: { duration: 0.12 } }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-0 top-[calc(100%+12px)] z-50 w-[19.5rem] origin-top-left overflow-hidden rounded-[1.4rem] bg-[#fbf9f3] p-2 shadow-[0_28px_60px_-24px_rgba(10,57,25,0.45)] ring-1 ring-forest-600/15"
          >
            {/* Faint leaves in the corner */}
            <span aria-hidden className="pointer-events-none absolute -bottom-1 right-1 h-24 w-24 opacity-30">
              <LeafArt className="absolute bottom-2 right-3 h-[34px] w-[46px] -rotate-[60deg]" />
              <LeafArt className="absolute bottom-0 right-9 h-[26px] w-[36px] -rotate-[150deg]" />
              <LeafArt className="absolute bottom-9 right-0 h-[24px] w-[32px] -rotate-[95deg]" />
            </span>

            <ul
              ref={list}
              id={`${id}-list`}
              role="listbox"
              tabIndex={-1}
              aria-label="Categories"
              aria-activedescendant={`${id}-o${active}`}
              onKeyDown={onListKey}
              data-lenis-prevent
              className="relative max-h-[min(62svh,560px)] overflow-y-auto outline-none"
            >
              {OPTIONS.map((o, i) => {
                const Icon = o.icon;
                const isSel = i === selected;
                const isActive = i === active;
                return (
                  <li
                    key={o.slug || "all"}
                    id={`${id}-o${i}`}
                    data-i={i}
                    role="option"
                    aria-selected={isSel}
                    onPointerEnter={() => setActive(i)}
                    onClick={() => choose(i)}
                    className={`flex cursor-pointer items-center gap-3 rounded-2xl px-2 py-1 transition-colors ${
                      isSel ? "bg-[#e3efd3]" : isActive ? "bg-forest-600/6" : ""
                    } ${isActive ? "ring-1 ring-forest-600/25" : ""}`}
                  >
                    <span
                      aria-hidden
                      className={`grid size-9 shrink-0 place-items-center rounded-xl ${isSel ? "bg-white/70" : "bg-leaf/12"} text-forest-700`}
                    >
                      <Icon className="size-[19px]" strokeWidth={1.7} />
                    </span>
                    {/* Thin rule under each name, as in the design (not under the tinted selected row or the last one) */}
                    <span
                      className={`flex min-w-0 flex-1 items-center justify-between gap-2 self-stretch py-1.5 text-[0.95rem] ${
                        isSel ? "font-bold text-forest-900" : "text-ink"
                      } ${!isSel && i < OPTIONS.length - 1 && i + 1 !== selected ? "border-b border-forest-600/10" : "border-b border-transparent"}`}
                    >
                      <span className="truncate">{o.name}</span>
                      {isSel && (
                        <span aria-hidden className="grid size-6 shrink-0 place-items-center rounded-full bg-forest-700 text-white">
                          <Check className="size-3.5" strokeWidth={3} />
                        </span>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
