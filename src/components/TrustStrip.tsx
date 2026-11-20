"use client";

import { motion, useReducedMotion } from "motion/react";
import { FlaskConical, Heart, Leaf, Soup, Sprout } from "lucide-react";

const ITEMS = [
  { icon: Leaf, title: "Pure & Natural", ta: "தூய இயற்கை" },
  { icon: Soup, title: "Traditionally Sourced", ta: "பாரம்பரிய முறை" },
  { icon: FlaskConical, title: "Chemical Free", ta: "ரசாயனமற்றது" },
  { icon: Sprout, title: "Sustainable Practices", ta: "நீடித்த நடைமுறைகள்" },
  { icon: Heart, title: "Family Wellbeing", ta: "குடும்ப நலம்" },
];

const EASE = [0.22, 1, 0.36, 1] as const;

export default function TrustStrip() {
  const reduce = useReducedMotion();

  return (
    <section
      id="heritage"
      aria-labelledby="ts-title"
      className="grain relative overflow-hidden border-y border-forest-600/10 bg-sage"
    >
      {/* Gold hairline accent along the top edge */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent"
      />

      <div className="mx-auto max-w-[1320px] px-5 py-10 md:px-8 md:py-12">
        <div className="flex items-center justify-center gap-3">
          <span aria-hidden className="h-px w-8 bg-gold/60 sm:w-12" />
          <h2
            id="ts-title"
            className="text-center text-[0.704rem] font-bold uppercase tracking-[0.22em] text-forest-700"
          >
            The Naadu Nalam Promise
          </h2>
          <span aria-hidden className="h-px w-8 bg-gold/60 sm:w-12" />
        </div>

        <motion.ul
          className="mt-8 grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 md:mt-9 lg:grid-cols-5 lg:gap-x-0"
          initial={reduce ? false : "hidden"}
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
        >
          {ITEMS.map(({ icon: Icon, title, ta }, i) => {
            const last = i === ITEMS.length - 1;
            return (
              <motion.li
                key={title}
                variants={{
                  hidden: { opacity: 0, y: 18 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
                }}
                className={`group relative flex flex-col items-center gap-3.5 px-3 text-center ${
                  last ? "col-span-2 sm:col-span-1" : ""
                }`}
              >
                {/* Seal badge */}
                <span className="relative grid size-16 shrink-0 place-items-center">
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-full border border-dashed border-gold/45 transition-transform duration-[1200ms] ease-[cubic-bezier(.22,1,.36,1)] motion-safe:group-hover:rotate-90"
                  />
                  <span className="relative grid size-[3.25rem] place-items-center rounded-full bg-ivory text-forest-600 shadow-[0_8px_18px_-10px_rgba(60,40,10,0.45)] ring-1 ring-forest-600/10 transition-colors duration-300 group-hover:bg-forest-600 group-hover:text-ivory">
                    <motion.span
                      className="grid place-items-center"
                      whileHover={reduce ? undefined : { rotate: [0, -10, 8, -4, 0] }}
                      transition={{ duration: 0.6 }}
                    >
                      <Icon className="size-6" strokeWidth={1.6} aria-hidden />
                    </motion.span>
                  </span>
                </span>

                <span className="min-w-0">
                  <span className="block text-balance font-serif text-[0.977rem] font-bold leading-snug text-forest-700 md:text-[1.02rem]">
                    {title}
                  </span>
                  <span lang="ta" className="mt-1 block font-tamil-sans text-[0.749rem] leading-snug text-muted">
                    {ta}
                  </span>
                </span>

                {/* Ornamental divider: fading rule with a gold diamond */}
                {!last && (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-y-1 right-0 hidden w-px bg-gradient-to-b from-transparent via-forest-600/25 to-transparent lg:block"
                  >
                    <span className="absolute left-1/2 top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-gold/70" />
                  </span>
                )}
              </motion.li>
            );
          })}
        </motion.ul>
      </div>
    </section>
  );
}
