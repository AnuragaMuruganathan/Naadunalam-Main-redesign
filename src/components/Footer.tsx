"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { gsap, useGSAP, scrollToHash } from "@/lib/gsap";
import { FOOTER_LINKS } from "@/lib/content";
import BrandLockup from "./BrandLockup";

const SOCIALS = [
  {
    label: "Instagram",
    path: "M12 2.2c3.2 0 3.6 0 4.8.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-3.3-.1-4.8-1.7-4.9-4.9C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8C2.4 3.9 3.9 2.4 7.2 2.3 8.4 2.2 8.8 2.2 12 2.2Zm0 4.6a5.2 5.2 0 1 0 0 10.4 5.2 5.2 0 0 0 0-10.4Zm0 8.6a3.4 3.4 0 1 1 0-6.8 3.4 3.4 0 0 1 0 6.8Zm5.4-9.9a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4Z",
  },
  {
    label: "YouTube",
    path: "M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.2 3.6-6.2 3.6Z",
  },
  {
    label: "Facebook",
    path: "M24 12a12 12 0 1 0-13.9 11.9v-8.4h-3V12h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9V12h3.3l-.5 3.5h-2.8v8.4A12 12 0 0 0 24 12Z",
  },
  {
    label: "WhatsApp",
    path: "M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5 1.9.8 2.6.9 3.6.7.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.4ZM12 21.8a9.8 9.8 0 0 1-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4A9.8 9.8 0 1 1 12 21.8Zm0-21.6A11.8 11.8 0 0 0 1.8 17.9L.1 24l6.3-1.6A11.8 11.8 0 1 0 12 .2Z",
  },
];

export default function Footer() {
  const root = useRef<HTMLElement>(null);
  const isHome = usePathname() === "/";

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap
          .timeline({ scrollTrigger: { trigger: root.current, start: "top 85%", once: true } })
          .from(".ft-col", { opacity: 0, y: 30, duration: 0.8, stagger: 0.1, ease: "power3.out" })
          .from(".ft-village", { opacity: 0, xPercent: 8, duration: 1.2, ease: "power3.out" }, 0);
        gsap.fromTo(
          ".ft-village-img",
          { scale: 1.15 },
          { scale: 1, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom bottom", scrub: true } }
        );
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  // Homepage anchors scroll in place when already on the homepage.
  const go = (e: React.MouseEvent, href: string) => {
    if (!isHome) return;
    const hash = href === "/" ? "#top" : href.startsWith("/#") ? href.slice(1) : null;
    if (!hash) return;
    e.preventDefault();
    history.replaceState(null, "", href);
    scrollToHash(hash);
  };

  return (
    <footer
      ref={root}
      id="about"
      /*
       * Exactly one screen tall below the fixed header (77px phones, 87px from
       * md, borders included), so at the end of every page the footer sits
       * flush under the header: nothing hidden beneath it, nothing cut off.
       * Type and spacing scale with screen height so it all fits.
       */
      className="relative flex min-h-[calc(100svh-65px)] flex-col overflow-hidden bg-forest-900 text-white md:min-h-[calc(100svh-73px)]"
    >
      {/* Village scene, fading into the green on its left edge */}
      <div className="ft-village pointer-events-none absolute inset-y-0 right-0 hidden w-[34%] overflow-hidden xl:block">
        <div className="ft-village-img absolute inset-0 origin-bottom-right">
          <Image src="/images/footer-village.webp" alt="" fill sizes="30vw" className="object-cover object-[60%_center]" />
        </div>
        <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-forest-900 via-forest-900/40 to-transparent" />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-forest-900/70 to-transparent" />
      </div>

      <div className="relative mx-auto flex w-full max-w-[1320px] flex-1 flex-col justify-center px-5 py-[clamp(1.25rem,4svh,4.5rem)] md:px-8">
        {/* Closing statement */}
        <div className="ft-col xl:w-[calc(66vw-96px)] xl:max-w-[900px]">
          <p className="text-[0.681rem] font-bold uppercase tracking-[0.06em] text-gold-soft md:text-[0.749rem]">From Our Land to Your Family</p>
          <h2 className="mt-[clamp(0.4rem,1.2svh,0.75rem)] text-balance font-serif text-[clamp(1.279rem,2.52svh+0.379rem,2.08rem)] sm:max-w-[22ch] font-bold leading-[1.15] text-white md:text-[clamp(1.87rem,3.78svh+0.547rem,3.288rem)]">
            Seven generations of wellbeing, rooted in our land.
          </h2>
          <p lang="ta" className="mt-[clamp(0.3rem,1svh,0.75rem)] whitespace-nowrap font-tamil text-[0.861rem] text-white/80 sm:text-[0.939rem] md:whitespace-normal md:text-[clamp(0.955rem,1.296svh+0.379rem,1.171rem)]">
            ஏழு தலைமுறைகளின் நலம் – நாடு நலம்
          </p>
          <Link
            href="/shop"
            className="mt-[clamp(0.75rem,2.6svh,1.5rem)] inline-flex min-h-11 items-center gap-2 rounded-full bg-gold-soft px-6 font-semibold text-forest-950 transition-[background-color,transform] duration-300 hover:-translate-y-0.5 hover:bg-white"
          >
            Shop All Products
            <span aria-hidden>→</span>
          </Link>
        </div>

        <span aria-hidden className="my-[clamp(0.9rem,3.5svh,3.5rem)] block h-px w-full bg-white/15 xl:w-[calc(66vw-96px)] xl:max-w-[900px]" />

        <div className="grid gap-[clamp(1.1rem,3svh,2.5rem)] md:grid-cols-[1.15fr_2fr] lg:grid-cols-[1.2fr_auto_2fr] lg:gap-10 xl:w-[calc(66vw-96px)] xl:max-w-[900px]">
          {/*
           * Brand block. On phones the fixed header right above already shows
           * the logo, so only the social links stay; logo + blurb from sm.
           */}
          <div className="ft-col flex items-center justify-between gap-4 md:block">
            <Link href="/" onClick={(e) => go(e, "/")} aria-label="Naadu Nalam — home" className="min-w-0 max-sm:hidden">
              <BrandLockup tone="dark" size="fluid" divider={false} />
            </Link>
            <p className="mt-[clamp(0.75rem,2svh,1.25rem)] hidden max-w-[34ch] text-[0.939rem] leading-relaxed text-white/85 md:block">
              Bringing the wisdom of our land, nature and Tamil heritage to the wellbeing of every generation.
            </p>
            <ul className="flex shrink-0 gap-2.5 md:mt-[clamp(0.75rem,2svh,1.25rem)] md:gap-3" aria-label="Social media">
              {SOCIALS.map((s) => (
                <li key={s.label}>
                  <a
                    href="#"
                    aria-label={s.label}
                    className="grid size-10 place-items-center rounded-full border border-white/20 text-white transition-[background-color,color,transform] duration-300 hover:-translate-y-1 hover:bg-white hover:text-forest-900 max-[400px]:size-9"
                  >
                    <svg viewBox="0 0 24 24" className="size-[18px] fill-current" aria-hidden>
                      <path d={s.path} />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <span aria-hidden className="hidden w-px bg-white/20 lg:block" />

          <div className="grid grid-cols-3 gap-2.5 sm:gap-8">
            {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
              <nav key={heading} aria-label={heading} className="ft-col min-w-0">
                <h3 className="font-serif text-[0.955rem] font-semibold text-white md:text-[1.041rem]">{heading}</h3>
                <ul className="mt-[clamp(0.35rem,1.2svh,0.75rem)] space-y-[clamp(0.05rem,0.5svh,0.375rem)]">
                  {links.map(([label, href]) => (
                    <li key={label}>
                      <Link
                        href={href}
                        onClick={(e) => go(e, href)}
                        className="group relative inline-block py-[clamp(0.2rem,0.45svh,0.3rem)] whitespace-nowrap text-[0.793rem] leading-snug text-white/80 transition-colors hover:text-white max-[370px]:text-[0.726rem] sm:text-[0.917rem]"
                      >
                        {label}
                        <span className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-gold-soft transition-transform duration-300 group-hover:scale-x-100" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>
      </div>

      <div className="relative border-t border-white/15 bg-forest-950/40">
        <div className="mx-auto flex max-w-[1320px] flex-wrap items-center justify-between gap-x-3 gap-y-1 px-5 py-[clamp(0.6rem,1.6svh,1rem)] text-[0.771rem] text-white/85 md:px-8 md:text-[0.861rem]">
          <p className="whitespace-nowrap">&copy; 2026 Naadu Nalam<span className="max-sm:hidden">. All Rights Reserved.</span></p>
          <p lang="ta" className="whitespace-nowrap font-tamil text-[0.749rem] text-white sm:text-[0.827rem] md:text-[0.939rem]">
            நாடு நலம் • இயற்கையின் நலம்
          </p>
        </div>
      </div>
    </footer>
  );
}
