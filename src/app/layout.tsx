import type { Metadata, Viewport } from "next";
import { Albert_Sans, Noto_Sans_Tamil } from "next/font/google";
import SmoothScroll from "@/components/SmoothScroll";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Toaster from "@/components/shop/Toaster";
import "./globals.css";

/** Albert Sans for all Latin text. It has no Tamil glyphs, so Tamil falls back to Noto Sans Tamil. */
const albert = Albert_Sans({
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
  variable: "--font-albert",
  display: "swap",
});

const tamil = Noto_Sans_Tamil({
  subsets: ["tamil"],
  variable: "--font-noto-tamil",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Naadu Nalam | நாட்டு நலம் — From Our Land to Your Family",
    template: "%s | Naadu Nalam",
  },
  description:
    "Time-tested, naturally sourced millets, oils, sweets, herbal and wellness products rooted in seven generations of Tamil heritage.",
  icons: { icon: { url: "/images/favicon.png", sizes: "192x192", type: "image/png" } },
};

export const viewport: Viewport = {
  themeColor: "#0f4819",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${albert.variable} ${tamil.variable}`}
    >
      <body>
        <SmoothScroll>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:font-semibold"
          >
            Skip to content
          </a>
          <Header />
          {children}
          <Footer />
          <Toaster />
        </SmoothScroll>
      </body>
    </html>
  );
}
