import type { Metadata, Viewport } from "next";
import { Lora, Nunito_Sans, Noto_Serif_Tamil, Noto_Sans_Tamil } from "next/font/google";
import SmoothScroll from "@/components/SmoothScroll";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Toaster from "@/components/shop/Toaster";
import "./globals.css";

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-lora",
  display: "swap",
});

const nunito = Nunito_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700", "800"],
  variable: "--font-nunito",
  display: "swap",
});

const tamilSerif = Noto_Serif_Tamil({
  subsets: ["tamil"],
  weight: ["500", "600", "700"],
  variable: "--font-tamil-serif",
  display: "swap",
});

const tamilSans = Noto_Sans_Tamil({
  subsets: ["tamil"],
  weight: ["400", "500", "600"],
  variable: "--font-tamil-sans",
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
      className={`${lora.variable} ${nunito.variable} ${tamilSerif.variable} ${tamilSans.variable}`}
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
