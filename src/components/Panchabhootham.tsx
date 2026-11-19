"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { Droplet, Mountain, Sparkle, Sun, Wind } from "lucide-react";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";
import { ELEMENTS } from "@/lib/content";
import { LeafRule } from "./Leaf";

const ICONS = { earth: Mountain, water: Droplet, fire: Sun, air: Wind, space: Sparkle } as const;

export default function Panchabhootham() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap
          .timeline({ scrollTrigger: { trigger: root.current, start: "top 75%", once: true } })
          .from(".pb-rule", { opacity: 0, x: (i: number) => (i === 0 ? -30 : 30), duration: 0.8, ease: "power3.out" })
          .from(".pb-title", { yPercent: 100, opacity: 0, duration: 0.9, ease: "power4.out" }, 0)
          .from(".pb-sub", { opacity: 0, y: 12, duration: 0.7, stagger: 0.08 }, 0.25);

        gsap.set(".pb-card", { opacity: 0, y: 60 });
        ScrollTrigger.batch(".pb-card", {
          start: "top 88%",
          once: true,
          onEnter: (batch) => {
            gsap.to(batch, { opacity: 1, y: 0, duration: 1, stagger: 0.1, ease: "expo.out", overwrite: true });
            gsap.from(
              batch.map((el) => el.querySelector(".pb-img")),
              { scale: 1.18, duration: 1.6, stagger: 0.1, ease: "expo.out" }
            );
          },
        });
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      id="panchabhootham"
      aria-labelledby="pb-title"
      className="grain flex min-h-[calc(100svh-76px)] flex-col justify-center bg-cream py-[clamp(1.25rem,4svh,3rem)] md:min-h-[calc(100svh-86px)]"
    >
      <div className="mx-auto w-full max-w-[1320px] px-5 md:px-8">
        <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-5">
          <span className="pb-rule hidden min-[480px]:block"><LeafRule /></span>
          <span className="overflow-hidden">
            <h2
              id="pb-title"
              className="pb-title text-center font-serif text-[1.65rem] font-bold leading-tight text-forest-600 min-[400px]:text-[1.85rem] md:text-[2.75rem]"
            >
              Iyarkai Panchabhootham
            </h2>
          </span>
          <span className="pb-rule hidden min-[480px]:block"><LeafRule flip /></span>
        </div>
        <p lang="ta" className="pb-sub mt-2 text-center font-tamil text-[1.05rem] font-semibold text-forest-700 md:text-[1.2rem]">
          இயற்கை பஞ்சபூதம்
        </p>
        <p className="pb-sub mx-auto mt-2 max-w-[52ch] text-balance text-center text-[1rem] text-ink/80 md:text-[1.08rem]">
          Earth, water, fire, air and space: the five elements that nourish every grain we grow.
        </p>

        <ul className="no-scrollbar -mx-5 mt-[clamp(1.25rem,4svh,3rem)] flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-6 pt-2 lg:mx-0 lg:grid lg:grid-cols-5 lg:gap-5 lg:overflow-visible lg:px-0 lg:pb-0">
          {ELEMENTS.map((el) => {
            const Icon = ICONS[el.icon];
            const isScene = el.fit === "cover";
            return (
              <li key={el.en} className="pb-card w-[64vw] max-w-[260px] shrink-0 snap-center sm:w-[40vw] lg:w-auto lg:max-w-none">
                <motion.article
                  whileHover={{ y: -8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  className="group flex h-full flex-col rounded-t-[999px] rounded-b-[22px] bg-ivory p-2.5 shadow-[0_14px_30px_-18px_rgba(60,40,10,0.4)] ring-1 ring-sand/80 transition-shadow duration-500 hover:shadow-[0_26px_44px_-20px_rgba(60,40,10,0.5)]"
                >
                  {/* Arch window */}
                  <div className={`arch relative aspect-[4/5] max-h-[clamp(150px,calc(100svh-500px),340px)] overflow-hidden md:max-h-[clamp(150px,calc(100svh-520px),340px)] bg-gradient-to-b ${el.wash}`}>
                    <div className="pb-img absolute inset-0">
                      <Image
                        src={el.img}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 18vw, (min-width: 640px) 40vw, 64vw"
                        className={`transition-transform duration-[900ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.06] ${
                          isScene
                            ? "scale-[1.12] object-cover"
                            : el.icon === "air"
                              ? "origin-bottom scale-[1.3] object-contain object-bottom px-[4%] pb-[3%]"
                              : "object-contain object-bottom p-[8%] pb-[4%]"
                        }`}
                      />
                    </div>
                    {/* Gold hairline echoing the Seven Generations arch */}
                    <span aria-hidden className="arch pointer-events-none absolute inset-[6px] border border-white/55" />
                  </div>

                  <div className="relative flex flex-1 flex-col items-center px-3 pb-5 text-center">
                    <span
                      aria-hidden
                      className="-mt-6 grid size-12 place-items-center rounded-full bg-ivory text-forest-600 shadow-[0_6px_14px_-8px_rgba(60,40,10,0.45)] ring-1 ring-gold/45"
                    >
                      <Icon className="size-5 transition-transform duration-500 group-hover:rotate-12" strokeWidth={1.6} />
                    </span>
                    <h3 className="mt-2.5 leading-tight">
                      <span lang="ta" className="block font-tamil text-[1.3rem] font-bold text-forest-600">
                        {el.ta}
                      </span>
                      <span className="sr-only"> ({el.en})</span>
                    </h3>
                    <p className="mt-2 text-[0.92rem] leading-snug text-muted">{el.desc}</p>
                  </div>
                </motion.article>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
