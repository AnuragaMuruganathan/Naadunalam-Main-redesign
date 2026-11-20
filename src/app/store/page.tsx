import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Package } from "lucide-react";
import PageStage from "@/components/shop/PageStage";
import Perks from "@/components/shop/Perks";
import VendorAvatar, { monthYear } from "@/components/shop/VendorAvatar";
import { PRODUCTS } from "@/lib/catalog";
import { categoryOf } from "@/lib/shop";
import { VENDORS, PRODUCT_VENDOR } from "@/lib/vendors";
import { plural } from "@/lib/format";

export const metadata: Metadata = {
  title: "Our Vendors",
  description: "The stores that sell on Naadu Nalam: traditional grains from Naadu Nalam, health mixes, oils and more from Thaayanbu.",
};

export default function VendorsPage() {
  const stores = VENDORS.map((v) => {
    const products = PRODUCTS.filter((p) => PRODUCT_VENDOR[p.slug] === v.slug);
    const cats = [...new Set(products.map((p) => p.category))]
      .map((c) => ({ slug: c, name: categoryOf(c)?.name ?? c, n: products.filter((p) => p.category === c).length }))
      .sort((a, b) => b.n - a.n);
    return { v, products, cats };
  });

  return (
    <main id="main" className="pt-[96px] md:pt-[104px]">
      <PageStage id="vendors-title" title="Our Vendors">
        <ul className="grid gap-5 md:grid-cols-2">
          {stores.map(({ v, products, cats }) => (
            <li key={v.slug}>
              <article className="flex h-full flex-col rounded-[1.6rem] bg-white p-5 shadow-[0_18px_40px_-28px_rgba(60,40,10,0.55)] ring-1 ring-forest-600/10 md:p-7">
                <div className="flex items-center gap-4">
                  <VendorAvatar vendor={v} size="md" />
                  <div className="min-w-0">
                    <h2 className="text-[1.5rem] font-bold leading-tight text-forest-700">
                      <Link href={`/store/${v.slug}`} className="hover:text-forest-500">
                        {v.name}
                      </Link>
                    </h2>
                  </div>
                </div>

                <p className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-[0.9rem] text-muted">
                  <span className="inline-flex items-center gap-1.5">
                    <Package className="size-4 text-forest-600" aria-hidden /> {plural(products.length, "product")}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="size-4 text-forest-600" aria-hidden /> Since {monthYear(v.since)}
                  </span>
                </p>

                <ul className="mt-4 flex flex-wrap gap-2" aria-label={`${v.name} sells`}>
                  {cats.map((c) => (
                    <li key={c.slug} className="rounded-full bg-leaf/12 px-3 py-1 text-[0.82rem] font-semibold text-forest-800">
                      {c.name} <span className="text-muted">· {c.n}</span>
                    </li>
                  ))}
                </ul>

                <ul className="mb-6 mt-5 grid grid-cols-4 gap-2" aria-hidden>
                  {products.slice(0, 4).map((p) => (
                    <li key={p.id} className="relative aspect-square overflow-hidden rounded-xl bg-sand">
                      <Image src={p.img} alt="" fill sizes="120px" className="object-cover" />
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/store/${v.slug}`}
                  className="group mt-auto inline-flex min-h-12 items-center justify-center gap-2 self-start rounded-full bg-forest-700 px-7 font-semibold text-white transition-colors hover:bg-forest-800"
                >
                  Visit store
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
                </Link>
              </article>
            </li>
          ))}
        </ul>
      </PageStage>
      <Perks />
    </main>
  );
}
