"use client";

import { useRef } from "react";
import Image from "next/image";
import { gsap, useGSAP } from "@/lib/gsap";
import { GENERATIONS } from "@/lib/content";

/*
 * All overlay geometry lives in the background photo's own pixel space
 * (1672 × 941). The SVG uses `xMidYMid slice`, which crops exactly like the
 * photo's `object-cover`, so the arc always sits on the painted ivory arch.
 */
const VB_W = 1672;
const VB_H = 941;
const CX = 836;
const CY = 760;
const TRACK = { a: 690, b: 420 };
const LABEL = { a: 742, b: 496 };
const THETA_START = 25; // 1st generation (right)
const THETA_END = 155; // 7th generation (left)

const rad = (d: number) => (d * Math.PI) / 180;
// Rounded so server and client produce byte-identical SVG attributes
const r1 = (v: number) => Math.round(v * 10) / 10;
const pt = (e: { a: number; b: number }, deg: number) => ({
  x: r1(CX + e.a * Math.cos(rad(deg))),
  y: r1(CY - e.b * Math.sin(rad(deg))),
});

const nodes = GENERATIONS.map((g, i) => {
  const deg = THETA_START + (i * (THETA_END - THETA_START)) / (GENERATIONS.length - 1);
  return { ...g, deg, dot: pt(TRACK, deg), label: pt(LABEL, deg) };
});

const p0 = pt(TRACK, THETA_START - 9);
const p1 = pt(TRACK, THETA_END + 9);
const TRACK_D = `M ${p0.x} ${p0.y} A ${TRACK.a} ${TRACK.b} 0 0 0 ${p1.x} ${p1.y}`;

const PIN_QUERY = "(min-width: 1024px) and (min-aspect-ratio: 16/10) and (prefers-reduced-motion: no-preference)";
const PLAY_QUERY = "(prefers-reduced-motion: no-preference) and (not ((min-width: 1024px) and (min-aspect-ratio: 16/10)))";

export default function SevenGenerations() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<SVGPathElement>(null);

  useGSAP(
    () => {
      const len = track.current?.getTotalLength() ?? 2000;
      gsap.set(".sg-track", { strokeDasharray: len, strokeDashoffset: len });

      const build = (tl: gsap.core.Timeline) => {
        tl.from(".sg-bg", { scale: 1.14, duration: 1.2, ease: "none" }, 0)
          .from(".sg-title-rule", { scaleX: 0, duration: 0.5, ease: "power2.out" }, 0)
          .from(".sg-title", { opacity: 0, y: 24, letterSpacing: "0.4em", duration: 0.6, ease: "power2.out" }, 0)
          .from(".sg-family", { yPercent: 38, opacity: 0, duration: 0.9, ease: "power2.out" }, 0.1)
          .to(".sg-track", { strokeDashoffset: 0, duration: 1.4, ease: "none" }, 0.35);

        nodes.forEach((_, i) => {
          const at = 0.35 + 1.4 * ((i + 0.6) / (nodes.length + 0.4));
          tl.from(`.sg-node-${i}`, { scale: 0, transformOrigin: "50% 50%", duration: 0.25, ease: "back.out(3)" }, at)
            .fromTo(
              `.sg-pulse-${i}`,
              { scale: 0.3, opacity: 0.95, transformOrigin: "50% 50%" },
              { scale: 1.9, opacity: 0, duration: 0.5, ease: "power2.out", immediateRender: false },
              at
            )
            .from(`.sg-label-${i}`, { opacity: 0, y: 14, duration: 0.35, ease: "power2.out" }, at + 0.05);
        });
        tl.from(".sg-chip", { opacity: 0, y: 12, stagger: 0.05, duration: 0.3 }, 0.9);
        return tl;
      };

      const mm = gsap.matchMedia();
      mm.add(PIN_QUERY, () => {
        build(
          gsap.timeline({
            scrollTrigger: {
              trigger: root.current,
              start: "top 72px",
              end: "+=140%",
              pin: true,
              scrub: 0.8,
              anticipatePin: 1,
            },
          })
        );
      });
      mm.add(PLAY_QUERY, () => {
        build(
          gsap.timeline({
            scrollTrigger: { trigger: root.current, start: "top 70%", once: true },
            defaults: {},
          })
        ).timeScale(0.9);
      });
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(".sg-track", { strokeDashoffset: 0 });
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      id="generations"
      aria-labelledby="sg-title"
      className="relative overflow-hidden bg-forest-800"
    >
      <div className="relative aspect-[1672/941] w-full [@media(min-width:1024px)_and_(min-aspect-ratio:16/10)]:aspect-auto [@media(min-width:1024px)_and_(min-aspect-ratio:16/10)]:h-[calc(100svh-72px)]">
        <div className="sg-bg absolute inset-0 will-change-transform">
          <Image
            src="/images/generations-arch.webp"
            alt=""
            fill
            sizes="100vw"
            quality={85}
            className="object-cover"
          />
        </div>
        <div aria-hidden className="absolute inset-x-0 top-0 h-[22%] bg-gradient-to-b from-forest-900/60 to-transparent" />

        {/* Title */}
        <div className="absolute inset-x-0 top-[3.5%] z-10 flex items-center justify-center gap-4 px-4 md:gap-8">
          <span aria-hidden className="sg-title-rule hidden h-px w-16 origin-right bg-white/80 sm:block md:w-28" />
          <h2
            id="sg-title"
            className="sg-title text-center font-serif text-[clamp(0.939rem,2.31vw,2.08rem)] font-medium uppercase tracking-[0.14em] text-white [text-shadow:0_2px_16px_rgba(0,0,0,0.35)]"
          >
            The Legacy of Seven Generations
          </h2>
          <span aria-hidden className="sg-title-rule hidden h-px w-16 origin-left bg-white/80 sm:block md:w-28" />
        </div>

        {/* Arc, nodes, labels and family — one coordinate space with the photo */}
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 h-full w-full"
          role="img"
          aria-label="Seven generations along the arch: Self, Parents, Grandparents, Great-grandparents and three generations of ancestors before them"
        >
          <defs>
            <linearGradient id="sgGold" x1="0" x2="1">
              <stop offset="0" stopColor="#a8742c" />
              <stop offset="0.5" stopColor="#d4a24f" />
              <stop offset="1" stopColor="#a8742c" />
            </linearGradient>
            <radialGradient id="sgGlow">
              <stop offset="0" stopColor="#f5cf7a" stopOpacity="0.9" />
              <stop offset="1" stopColor="#f5cf7a" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* faint guide + drawn track */}
          <path d={TRACK_D} fill="none" stroke="#b8863b" strokeOpacity="0.18" strokeWidth="2" />
          <path ref={track} className="sg-track" d={TRACK_D} fill="none" stroke="url(#sgGold)" strokeWidth="3" strokeLinecap="round" />

          {nodes.map((n, i) => (
            <g key={n.n}>
              <circle className={`sg-pulse-${i}`} cx={n.dot.x} cy={n.dot.y} r="26" fill="url(#sgGlow)" opacity="0" />
              <g className={`sg-node-${i}`}>
                <circle cx={n.dot.x} cy={n.dot.y} r="10" fill="#fdf6ec" stroke="#b8863b" strokeWidth="3" />
                <circle cx={n.dot.x} cy={n.dot.y} r="4" fill="#9a6a26" />
              </g>
              <text
                className={`sg-label-${i} hidden md:block`}
                x={n.label.x}
                y={n.label.y - (n.ta.length - 1) * 13 - 4}
                textAnchor="middle"
                fill="#173d22"
              >
                {n.ta.map((t, j) => (
                  <tspan key={t} x={n.label.x} dy={j === 0 ? 0 : 26} lang="ta" fontFamily="var(--font-tamil-sans)" fontSize="21" fontWeight="600">
                    {t}
                  </tspan>
                ))}
                <tspan x={n.label.x} dy="24" fontFamily="var(--font-sans)" fontSize="15" fontWeight="600" fill="#7a5a2c">
                  ({n.ord})
                </tspan>
              </text>
            </g>
          ))}

          <image
            className="sg-family"
            href="/images/generations-family.webp"
            x={286}
            y={493}
            width={1100}
            height={444}
            preserveAspectRatio="xMidYMax meet"
          />
        </svg>
      </div>

      {/* Compact list for small screens, where arch labels would be too small */}
      <ol className="no-scrollbar flex gap-2 overflow-x-auto bg-forest-900 px-4 py-4 md:hidden" aria-label="The seven generations">
        {[...nodes].reverse().map((n) => (
          <li key={n.n} className="sg-chip shrink-0 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-center text-white">
            <span lang="ta" className="block font-tamil-sans text-sm font-semibold">{n.ta.join(" · ")}</span>
            <span className="block text-[0.681rem] text-white/70">{n.ord} · {n.en}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
