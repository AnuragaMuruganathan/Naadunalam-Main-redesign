"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Droplet, Mountain, Sparkle, Sun, Wind } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import { ELEMENTS, GENERATIONS } from "@/lib/content";
import { LeafRule } from "./Leaf";

/*
 * One scroll story in two acts.
 *
 * Act 1 — Panchabhootham: the five arch windows start as quiet sand; each element
 * rises into its arch in turn (earth, water, fire, air, space) as its badge
 * turns green and its line of text settles in, while a gold thread runs
 * beneath the row.
 * Act 2 — Seven Generations: a full-width arch rises from the bottom like a
 * curtain, its crown flattening as it fills the screen, then the gold arc
 * draws through all seven generations.
 *
 * On large, wide screens (the `cine` variant) the stage is sticky and the
 * whole story is scrubbed by scroll. Elsewhere the acts stack and each plays
 * once as it enters. Reduced-motion users get the finished state.
 */

const ICONS = { earth: Mountain, water: Droplet, fire: Sun, air: Wind, space: Sparkle } as const;

/* ---------- Seven Generations geometry (photo pixel space, 1672 × 941) ---------- */
const VB_W = 1672;
const VB_H = 941;
const CX = 836;
const CY = 760;
const TRACK = { a: 690, b: 420 };
const THETA_START = 25;
const THETA_END = 155;

const rad = (d: number) => (d * Math.PI) / 180;
const r1 = (v: number) => Math.round(v * 10) / 10;
const pt = (e: { a: number; b: number }, deg: number) => ({
  x: r1(CX + e.a * Math.cos(rad(deg))),
  y: r1(CY - e.b * Math.sin(rad(deg))),
});

const nodes = GENERATIONS.map((g, i) => {
  const deg = THETA_START + (i * (THETA_END - THETA_START)) / (GENERATIONS.length - 1);
  // Outward normal of the track ellipse at this dot (screen space, y down)
  const nx = Math.cos(rad(deg)) / TRACK.a;
  const ny = -Math.sin(rad(deg)) / TRACK.b;
  const nl = Math.hypot(nx, ny);
  return { ...g, deg, dot: pt(TRACK, deg), normal: { x: nx / nl, y: ny / nl } };
});

/*
 * Generation labels sit in the painted ivory band. Each label block is
 * centred on the track's outward normal, halfway between its dot and the
 * band's outer edge, so every label reads as centred in the band and lined
 * up with its own dot. BAND_EDGE is the distance (photo px) from each dot to
 * the band's outer edge along that normal, measured from the photo, 1st → 7th.
 * Block sizes are measured once fonts load; the estimates (text-local units,
 * first baseline at 0) keep server and first client render identical.
 */
const DOT_R = 13;
const BAND_EDGE = [104, 109, 122, 126, 125, 121, 122];
type Box = { x: number; y: number; w: number; h: number };
const LABEL_EST: Box[] = nodes.map((n) => ({ x: -46, y: -18, w: 92, h: n.ta.length === 1 ? 44 : 68 }));
const labelOffset = (i: number, b: Box) => {
  const n = nodes[i];
  const reach = (DOT_R + BAND_EDGE[i]) / 2;
  const cx = n.dot.x + n.normal.x * reach;
  const cy = n.dot.y + n.normal.y * reach;
  return `translate(${r1(cx - (b.x + b.w / 2))} ${r1(cy - (b.y + b.h / 2))})`;
};

const p0 = pt(TRACK, THETA_START - 9);
const p1 = pt(TRACK, THETA_END + 9);
const TRACK_D = `M ${p0.x} ${p0.y} A ${TRACK.a} ${TRACK.b} 0 0 0 ${p1.x} ${p1.y}`;

/* Keep in sync with the `cine` custom variant in globals.css */
const CINE = "(min-width: 1024px) and (min-height: 600px) and (min-aspect-ratio: 16/10) and (prefers-reduced-motion: no-preference)";
const PLAY = "(prefers-reduced-motion: no-preference) and (not ((min-width: 1024px) and (min-height: 600px) and (min-aspect-ratio: 16/10)))";


/*
 * Curtain clip in stage pixels: a full-width arch whose top edge rises from
 * the bottom. The crown starts as a deep curve and flattens to a straight
 * edge as it reaches the top, so the scene arrives as one clean shape. Both
 * stages use the same syntax so GSAP can interpolate every number.
 */
const curtain = (el: Element | null, stage: "closed" | "open") => {
  const w = el?.clientWidth ?? 1440;
  const h = el?.clientHeight ?? 800;
  const rx = w / 2;
  const ry = stage === "closed" ? h * 0.32 : 0;
  const top = stage === "closed" ? h : 0;
  return `inset(${top}px 0px 0px 0px round ${rx}px ${rx}px 0px 0px / ${ry}px ${ry}px 0px 0px)`;
};

export default function HeritageJourney() {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<SVGPathElement>(null);
  const [boxes, setBoxes] = useState<Box[]>(LABEL_EST);

  // Measure the real label blocks once the Tamil font has loaded
  useEffect(() => {
    let alive = true;
    const measure = () => {
      if (!alive || !root.current) return;
      const next = nodes.map((_, i) => {
        const t = root.current!.querySelector<SVGTextElement>(`.sg-label-${i}`);
        const b = t?.getBBox();
        return b && b.width > 0 ? { x: b.x, y: b.y, w: b.width, h: b.height } : LABEL_EST[i];
      });
      setBoxes(next);
    };
    measure();
    document.fonts?.ready.then(measure);
    window.addEventListener("resize", measure);
    return () => {
      alive = false;
      window.removeEventListener("resize", measure);
    };
  }, []);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const len = track.current?.getTotalLength() ?? 2000;

      /* --- Act 1 pieces --- */
      const intro = (tl: gsap.core.Timeline, at = 0) =>
        tl
          .from(q(".pb-rule"), { opacity: 0, x: (i: number) => (i === 0 ? -30 : 30), duration: 0.8, ease: "power3.out" }, at)
          .from(q(".pb-title"), { yPercent: 100, opacity: 0, duration: 0.9, ease: "power4.out" }, at)
          .from(q(".pb-sub"), { opacity: 0, y: 12, duration: 0.7, stagger: 0.08 }, at + 0.25)
          .from(q(".pb-card"), { opacity: 0, y: 50, duration: 0.9, stagger: 0.08, ease: "expo.out" }, at + 0.2);

      /* Resting state before an element arrives: empty arch, small pale badge */
      const setRest = () => {
        gsap.set(q(".pb-img"), { yPercent: 28, scale: 1.08, opacity: 0, transformOrigin: "50% 100%" });
        gsap.set(q(".pb-wash"), { opacity: 0 });
        gsap.set(q(".pb-medal"), { scale: 0.75, backgroundColor: "#fdf8f1", color: "#1d6933" });
        gsap.set(q(".pb-desc"), { opacity: 0, y: 10 });
        gsap.set(q(".pb-thread"), { scaleX: 0 });
      };

      /* Element i rises into its arch over `d` seconds starting at `at` */
      const rise = (tl: gsap.core.Timeline, i: number, at: number, d: number) => {
        const card = q(".pb-card")[i];
        const $ = (s: string) => card.querySelector(s);
        tl.to($(".pb-wash"), { opacity: 1, duration: d * 0.6, ease: "power1.out" }, at)
          .to($(".pb-img"), { yPercent: 0, scale: 1, opacity: 1, duration: d, ease: "power3.out" }, at)
          .to(
            $(".pb-medal"),
            { scale: 1, backgroundColor: "#1d6933", color: "#fdf8f1", duration: d * 0.5, ease: "back.out(2)" },
            at + d * 0.35
          )
          .to($(".pb-desc"), { opacity: 1, y: 0, duration: d * 0.5, ease: "power2.out" }, at + d * 0.45);
      };

      /* --- Act 2 sequence (relative to `at`) --- */
      const generations = (tl: gsap.core.Timeline, at: number) => {
        gsap.set(q(".sg-track"), { strokeDasharray: len, strokeDashoffset: len });
        tl.from(q(".sg-bg"), { scale: 1.14, duration: 1.2, ease: "none" }, at)
          .from(q(".sg-title-rule"), { scaleX: 0, duration: 0.5, ease: "power2.out" }, at + 0.3)
          .from(q(".sg-title"), { opacity: 0, y: 24, letterSpacing: "0.4em", duration: 0.6, ease: "power2.out" }, at + 0.3)
          .from(q(".sg-family"), { yPercent: 38, opacity: 0, duration: 0.9, ease: "power2.out" }, at + 0.4)
          .to(q(".sg-track"), { strokeDashoffset: 0, duration: 1.4, ease: "none" }, at + 0.65);
        nodes.forEach((_, i) => {
          const t = at + 0.65 + 1.4 * ((i + 0.6) / (nodes.length + 0.4));
          tl.from(q(`.sg-node-${i}`), { scale: 0, transformOrigin: "50% 50%", duration: 0.25, ease: "back.out(3)" }, t)
            .fromTo(
              q(`.sg-pulse-${i}`),
              { scale: 0.3, opacity: 0.95, transformOrigin: "50% 50%" },
              { scale: 1.9, opacity: 0, duration: 0.5, ease: "power2.out", immediateRender: false },
              t
            )
            .from(q(`.sg-label-${i}`), { opacity: 0, y: 14, duration: 0.35, ease: "power2.out" }, t + 0.05);
        });
        tl.from(q(".sg-chip"), { opacity: 0, y: 12, stagger: 0.05, duration: 0.3 }, at + 1.2);
        return tl;
      };

      const mm = gsap.matchMedia();

      /* Large wide screens: one scrubbed story on a sticky stage */
      mm.add(CINE, () => {
        intro(gsap.timeline({ scrollTrigger: { trigger: root.current, start: "top 75%", once: true } }));

        setRest();
        const act2 = q(".hj-act2")[0];
        gsap.set(act2, { clipPath: () => curtain(act2, "closed") });

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: root.current,
            start: "top 86px",
            end: "bottom bottom",
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        });

        ELEMENTS.forEach((_, i) => rise(tl, i, i * 0.7, 0.9));
        tl.to(q(".pb-thread"), { scaleX: 1, duration: 3.7 }, 0);

        // Brief hold on the five filled elements, then one curtain move:
        // the arch rises across the full width while Act 1 eases up and back.
        // Explicit from-value: the browser normalises inset() when reading it back.
        tl.fromTo(
          act2,
          { clipPath: () => curtain(act2, "closed") },
          { clipPath: () => curtain(act2, "open"), duration: 1.2, ease: "power2.inOut", immediateRender: false },
          4.1
        ).to(q(".hj-act1-inner"), { y: -48, opacity: 0.35, duration: 1.2, ease: "power2.inOut" }, 4.1);

        generations(tl, 4.5);
        tl.to({}, { duration: 0.9 }, 6.3); // hold on the finished scene
      });

      /* Everywhere else: each act plays once as it enters */
      mm.add(PLAY, () => {
        setRest();
        const a1 = gsap.timeline({ scrollTrigger: { trigger: q(".hj-act1")[0], start: "top 70%", once: true } });
        intro(a1);
        ELEMENTS.forEach((_, i) => rise(a1, i, 0.6 + i * 0.18, 1.1));

        generations(
          gsap.timeline({ scrollTrigger: { trigger: q(".hj-act2")[0], start: "top 70%", once: true } }),
          0
        ).timeScale(0.9);
      });

      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <div
      ref={root}
      id="panchabhootham"
      className="relative flex flex-col cine:block cine:h-[360svh]"
    >
      {/* Nav anchor for "7 Generations": in flow between the acts, or at the point in the story where the doorway has filled the screen */}
      <span
        id="generations"
        aria-hidden
        className="order-2 block h-0 cine:absolute cine:inset-x-0 cine:top-[calc((260svh+86px)*0.74)]"
      />

      <div className="contents cine:sticky cine:top-[86px] cine:block cine:h-[calc(100svh-86px)] cine:overflow-hidden">
        {/* ================= Act 1: Panchabhootham ================= */}
        <section
          aria-labelledby="pb-title"
          className="hj-act1 grain order-1 flex flex-col justify-center bg-cream py-16 md:py-20 cine:absolute cine:inset-0 cine:py-[clamp(1.25rem,4svh,3rem)]"
        >
          <div className="hj-act1-inner mx-auto w-full max-w-[1320px] px-5 md:px-8">
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
                const imgClass = isScene
                  ? "scale-[1.12] object-cover"
                  : el.icon === "air"
                    ? "origin-bottom scale-[1.3] object-contain object-bottom px-[4%] pb-[3%]"
                    : "object-contain object-bottom p-[8%] pb-[4%]";
                return (
                  <li key={el.en} className="pb-card w-[64vw] max-w-[260px] shrink-0 snap-center sm:w-[40vw] lg:w-auto lg:max-w-none">
                    <article className="group flex h-full flex-col rounded-t-[999px] rounded-b-[22px] bg-ivory p-2.5 shadow-[0_14px_30px_-18px_rgba(60,40,10,0.4)] ring-1 ring-sand/80 transition-[box-shadow,translate] duration-500 hover:-translate-y-2 hover:shadow-[0_26px_44px_-20px_rgba(60,40,10,0.5)]">
                      {/* Arch window: the element rises into it from the ground */}
                      <div className="arch relative aspect-[4/5] max-h-[clamp(150px,calc(100svh-500px),340px)] overflow-hidden bg-sand/35 md:max-h-[clamp(150px,calc(100svh-520px),340px)]">
                        <div aria-hidden className={`pb-wash absolute inset-0 bg-gradient-to-b ${el.wash}`} />
                        <div className="pb-img absolute inset-0 will-change-transform">
                          <Image
                            src={el.img}
                            alt=""
                            fill
                            sizes="(min-width: 1024px) 18vw, (min-width: 640px) 40vw, 64vw"
                            className={`transition-transform duration-[900ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.06] ${imgClass}`}
                          />
                        </div>
                        <span aria-hidden className="arch pointer-events-none absolute inset-[6px] border border-white/55" />
                      </div>

                      <div className="relative flex flex-1 flex-col items-center px-3 pb-5 text-center">
                        <span
                          aria-hidden
                          className="pb-medal -mt-6 grid size-12 place-items-center rounded-full bg-ivory text-forest-600 shadow-[0_6px_14px_-8px_rgba(60,40,10,0.45)] ring-1 ring-gold/45"
                        >
                          <Icon className="size-5 transition-transform duration-500 group-hover:rotate-12" strokeWidth={1.6} />
                        </span>
                        <h3 className="mt-2.5 leading-tight">
                          <span lang="ta" className="block font-tamil text-[1.3rem] font-bold text-forest-600">
                            {el.ta}
                          </span>
                          <span className="sr-only"> ({el.en})</span>
                        </h3>
                        <p className="pb-desc mt-2 text-[0.92rem] leading-snug text-muted">{el.desc}</p>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>

            {/* Gold thread that runs under the row as the elements fill (scroll story only) */}
            <div aria-hidden className="relative mx-auto mt-6 hidden h-px w-full max-w-[1100px] bg-gold/20 cine:block">
              <span className="pb-thread absolute inset-0 origin-left bg-gradient-to-r from-gold/40 via-gold to-gold/40" />
            </div>
          </div>
        </section>

        {/* ================= Act 2: Seven Generations ================= */}
        <section
          aria-labelledby="sg-title"
          className="hj-act2 relative order-3 overflow-hidden bg-forest-800 cine:absolute cine:inset-0"
        >
          <div className="relative aspect-[1672/941] w-full cine:aspect-auto cine:h-full">
            <div className="sg-bg absolute inset-0 will-change-transform">
              <Image src="/images/generations-arch.webp" alt="" fill sizes="100vw" quality={85} className="object-cover" />
            </div>
            <div aria-hidden className="absolute inset-x-0 top-0 h-[22%] bg-gradient-to-b from-forest-900/60 to-transparent" />

            <div className="absolute inset-x-0 top-[3.5%] z-10 flex items-center justify-center gap-4 px-4 md:gap-8">
              <span aria-hidden className="sg-title-rule hidden h-px w-16 origin-right bg-white/80 sm:block md:w-28" />
              <h2
                id="sg-title"
                className="sg-title text-center font-serif text-[clamp(0.95rem,2.2vw,2.1rem)] font-medium uppercase tracking-[0.14em] text-white [text-shadow:0_2px_16px_rgba(0,0,0,0.35)]"
              >
                The Legacy of Seven Generations
              </h2>
              <span aria-hidden className="sg-title-rule hidden h-px w-16 origin-left bg-white/80 sm:block md:w-28" />
            </div>

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

              <path d={TRACK_D} fill="none" stroke="#b8863b" strokeOpacity="0.18" strokeWidth="2" />
              <path ref={track} className="sg-track" d={TRACK_D} fill="none" stroke="url(#sgGold)" strokeWidth="3" strokeLinecap="round" />

              {nodes.map((n, i) => (
                <g key={n.n}>
                  <circle className={`sg-pulse-${i}`} cx={n.dot.x} cy={n.dot.y} r="26" fill="url(#sgGlow)" opacity="0" />
                  <g className={`sg-node-${i}`}>
                    <circle cx={n.dot.x} cy={n.dot.y} r="10" fill="#fdf6ec" stroke="#b8863b" strokeWidth="3" />
                    <circle cx={n.dot.x} cy={n.dot.y} r="4" fill="#9a6a26" />
                  </g>
                  <g transform={labelOffset(i, boxes[i])}>
                    <text className={`sg-label-${i} hidden md:block`} x={0} y={0} textAnchor="middle" fill="#173d22">
                      {n.ta.map((t, j) => (
                        <tspan key={t} x={0} dy={j === 0 ? 0 : 24} lang="ta" fontFamily="var(--font-tamil-sans)" fontSize="20" fontWeight="600">
                          {t}
                        </tspan>
                      ))}
                      <tspan x={0} dy="22" fontFamily="var(--font-nunito)" fontSize="15" fontWeight="600" fill="#7a5a2c">
                        ({n.ord})
                      </tspan>
                    </text>
                  </g>
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

          <ol className="no-scrollbar flex gap-2 overflow-x-auto bg-forest-900 px-4 py-4 md:hidden" aria-label="The seven generations">
            {[...nodes].reverse().map((n) => (
              <li key={n.n} className="sg-chip shrink-0 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-center text-white">
                <span lang="ta" className="block font-tamil-sans text-sm font-semibold">{n.ta.join(" · ")}</span>
                <span className="block text-[0.72rem] text-white/70">{n.ord} · {n.en}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}
