"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export { gsap, ScrollTrigger, useGSAP };

/** Smooth-scroll to an in-page anchor, through Lenis when it is active. */
export function scrollToHash(hash: string) {
  const lenis = (window as unknown as { __lenis?: { scrollTo: (t: Element | number, o?: object) => void } })
    .__lenis;
  if (hash === "#top") {
    if (lenis) lenis.scrollTo(0, { duration: 1.2 });
    else window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  const el = document.querySelector(hash);
  if (!el) return;
  const offset = window.innerWidth >= 768 ? 86 : 76;
  if (lenis) lenis.scrollTo(el, { offset: -offset, duration: 1.2 });
  else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - offset, behavior: "smooth" });
}
