"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";
import { CATEGORIES } from "@/lib/content";
import { LeafRule } from "./Leaf";

const MotionLink = motion.create(Link);

export default function ShopByCategory() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap
          .timeline({ scrollTrigger: { trigger: root.current, start: "top 75%", once: true } })
          .from(".sc-rule", { opacity: 0, x: (i: number) => (i === 0 ? -30 : 30), duration: 0.8, ease: "power3.out" })
          .from(".sc-title", { yPercent: 100, opacity: 0, duration: 0.9, ease: "power4.out" }, 0)
          .from(".sc-sub", { opacity: 0, y: 12, duration: 0.7 }, 0.25);

        gsap.set(".sc-card", { opacity: 0, y: 60 });
        ScrollTrigger.batch(".sc-card", {
          start: "top 88%",
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, { opacity: 1, y: 0, duration: 0.9, stagger: 0.09, ease: "expo.out", overwrite: true }),
        });

        gsap.utils.toArray<HTMLElement>(".sc-img").forEach((img) => {
          gsap.fromTo(
            img,
            { yPercent: -6 },
            {
              yPercent: 6,
              ease: "none",
              scrollTrigger: { trigger: img, start: "top bottom", end: "bottom top", scrub: true },
            }
          );
        });
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      id="shop"
      aria-labelledby="sc-title"
      className="grain flex h-[calc(100svh-76px)] min-h-[540px] bg-ivory py-[clamp(1.25rem,4svh,2.5rem)] md:h-[calc(100svh-86px)]"
    >
      <div className="mx-auto flex w-full max-w-[1480px] flex-col px-5 md:px-8">
        <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-5">
          <span className="sc-rule hidden min-[400px]:block"><LeafRule /></span>
          <span className="overflow-hidden">
            <h2 id="sc-title" className="sc-title whitespace-nowrap font-serif text-[1.65rem] font-bold leading-tight text-forest-600 min-[400px]:text-[1.85rem] md:text-[2.75rem]">
              Shop by Category
            </h2>
          </span>
          <span className="sc-rule hidden min-[400px]:block"><LeafRule flip /></span>
        </div>
        <p className="sc-sub mt-2 text-balance text-center text-[0.95rem] text-ink/80 md:mt-3 md:text-[1.08rem]">
          Time-tested, naturally sourced products for your family&rsquo;s everyday wellbeing.
        </p>

        {/* The grid takes whatever height is left below the heading: 2×3 on phones, 3×2 from sm up. */}
        <ul className="mt-[clamp(1rem,3.5svh,2.25rem)] grid min-h-0 flex-1 grid-cols-2 grid-rows-3 gap-3 sm:grid-cols-3 sm:grid-rows-2 sm:gap-4 lg:gap-5">
          {CATEGORIES.map((c) => (
            <li key={c.name} className="sc-card min-h-0">
              <MotionLink
                href={`/shop?category=${c.slug}`}
                className="group relative block h-full cursor-pointer overflow-hidden rounded-2xl bg-sand shadow-[0_14px_30px_-16px_rgba(60,40,10,0.45)] transition-shadow duration-500 hover:shadow-[0_26px_44px_-18px_rgba(60,40,10,0.55)] lg:rounded-3xl"
                initial="rest"
                whileHover="hover"
                whileFocus="hover"
                animate="rest"
                variants={{ rest: { y: 0 }, hover: { y: -6 } }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
              >
                <div className="sc-img absolute -inset-y-[8%] inset-x-0">
                  <Image
                    src={c.img}
                    alt={c.alt}
                    fill
                    sizes="(min-width: 1480px) 470px, (min-width: 640px) 32vw, 48vw"
                    className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.06]"
                  />
                </div>

                {/* Scrim keeps the label readable on any photo */}
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-forest-950/85 via-forest-950/35 to-transparent"
                />

                <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-3.5 sm:p-4 md:p-5 lg:p-6">
                  <span className="min-w-0 text-left">
                    <span className="block font-serif text-[1.02rem] font-bold leading-tight text-white sm:text-[1.15rem] md:text-[1.3rem] lg:text-[1.55rem]">
                      {c.name}
                    </span>
                    <span lang="ta" className="mt-1 block font-tamil-sans text-[0.74rem] text-white/85 md:text-[0.85rem]">
                      {c.ta}
                    </span>
                  </span>
                  <motion.span
                    aria-hidden
                    variants={{ rest: { scale: 1, rotate: 0 }, hover: { scale: 1.08, rotate: 45 } }}
                    transition={{ type: "spring", stiffness: 380, damping: 20 }}
                    className="hidden size-10 shrink-0 place-items-center rounded-full bg-white/95 text-forest-600 shadow sm:grid lg:size-11"
                  >
                    <ArrowUpRight className="size-5" />
                  </motion.span>
                </span>
              </MotionLink>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
