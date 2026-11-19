"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { gsap, useGSAP, scrollToHash } from "@/lib/gsap";

const ease = [0.22, 1, 0.36, 1] as const;

function MaskLine({ children, delay }: { children: React.ReactNode; delay: number }) {
  return (
    <span className="block overflow-hidden pb-[0.12em]">
      <motion.span
        className="block"
        initial={{ y: "110%" }}
        animate={{ y: "0%" }}
        transition={{ duration: 1.1, delay, ease }}
      >
        {children}
      </motion.span>
    </span>
  );
}

export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.to(".hero-media", {
          yPercent: 14,
          scale: 1.08,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
        });
        gsap.to(".hero-copy", {
          yPercent: -30,
          opacity: 0,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: "75% top", scrub: true },
        });
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      id="top"
      aria-label="Seven generations, one heritage"
      className="relative h-[min(82svh,720px)] min-h-[520px] overflow-hidden bg-forest-900 md:h-[clamp(520px,44vw,740px)]"
    >
      <motion.div
        className="hero-media absolute inset-0 origin-top will-change-transform"
        initial={{ scale: 1.12, opacity: 0.4 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.8, ease }}
      >
        <Image
          src="/images/hero-family-home.webp"
          alt="Three generations of a Tamil family seated together on the veranda of their village home, paddy fields and palms behind them"
          fill
          preload
          quality={85}
          sizes="100vw"
          className="object-cover object-[64%_center] md:object-center"
        />
      </motion.div>

      {/* Legibility scrims */}
      <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-[#0b2410]/75 via-[#0b2410]/30 to-transparent md:via-[#0b2410]/15 md:to-transparent" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#0b2410]/70 to-transparent md:hidden" />

      <div className="hero-copy relative mx-auto flex h-full max-w-[1320px] flex-col justify-end px-5 pb-14 md:justify-center md:px-12 md:pb-0 lg:px-16">
        <h1
          lang="ta"
          className="font-tamil text-[1.7rem] font-bold leading-[1.3] min-[400px]:text-[1.85rem] text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.35)] sm:text-[2.6rem] md:text-[clamp(2.2rem,3.5vw,3.25rem)]"
        >
          <MaskLine delay={0.45}>ஏழு தலைமுறை,</MaskLine>
          <MaskLine delay={0.6}>
            <span className="whitespace-nowrap">ஒரே பாரம்பரியம்</span>
          </MaskLine>
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.1 }}
          className="mt-3 font-serif text-base italic text-white/85 md:text-lg"
        >
          Seven generations. One heritage.
        </motion.p>

        <motion.a
          href="#shop"
          onClick={(e) => {
            e.preventDefault();
            scrollToHash("#shop");
          }}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.25, ease }}
          whileHover="hover"
          whileTap={{ scale: 0.97 }}
          className="group relative mt-8 inline-flex w-fit cursor-pointer items-center gap-3 overflow-hidden rounded-full bg-white px-7 py-3.5 text-[0.98rem] font-bold text-ink shadow-[0_10px_30px_-10px_rgba(0,0,0,0.45)]"
        >
          <motion.span
            aria-hidden
            className="absolute inset-0 origin-left bg-forest-600"
            initial={{ scaleX: 0 }}
            variants={{ hover: { scaleX: 1 } }}
            transition={{ duration: 0.45, ease }}
          />
          <span className="relative transition-colors duration-300 group-hover:text-white">Explore Our Products</span>
          <motion.span
            className="relative transition-colors duration-300 group-hover:text-white"
            variants={{ hover: { x: 5 } }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <ArrowRight className="size-5" aria-hidden />
          </motion.span>
        </motion.a>
      </div>
    </section>
  );
}
