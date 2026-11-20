"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { dismissToast, useToast } from "@/lib/store";

/** "Added to cart / wishlist" confirmation, bottom-right, auto-dismissing. */
export default function Toaster() {
  const toast = useToast();
  const pathname = usePathname();

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(dismissToast, 3800);
    return () => window.clearTimeout(t);
  }, [toast]);

  useEffect(() => dismissToast(), [pathname]);

  const target = toast?.kind === "wishlist" ? { href: "/wishlist", label: "View wishlist" } : { href: "/cart", label: "View cart" };
  const showLink = toast && pathname !== target.href;

  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-3 bottom-[calc(0.75rem+var(--sticky-bar-h,0px))] z-[80] flex justify-center transition-[bottom] duration-300 sm:inset-x-auto sm:bottom-[calc(1.5rem+var(--sticky-bar-h,0px))] sm:right-6">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.key}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, transition: { duration: 0.18 } }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            className="pointer-events-auto flex w-full max-w-[400px] items-center gap-3 rounded-2xl bg-forest-900 p-3 pr-2 text-white shadow-[0_24px_50px_-20px_rgba(7,43,18,0.75)] ring-1 ring-white/10"
          >
            <span className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-sand">
              <Image src={toast.product.img} alt="" fill sizes="48px" className="object-cover" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[0.681rem] font-bold uppercase tracking-[0.14em] text-gold-soft">
                {toast.kind === "cart" ? "Added to cart" : "Saved to wishlist"}
              </span>
              <span className="block truncate text-sm font-semibold">{toast.product.name}</span>
            </span>
            {showLink && (
              <Link
                href={target.href}
                className="shrink-0 rounded-full bg-gold-soft px-3.5 py-2 text-[0.771rem] font-bold text-forest-950 transition-colors hover:bg-white"
              >
                {target.label}
              </Link>
            )}
            <button
              type="button"
              onClick={dismissToast}
              aria-label="Dismiss"
              className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="size-4" aria-hidden />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
