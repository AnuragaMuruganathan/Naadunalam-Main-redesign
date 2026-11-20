import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Perks from "@/components/shop/Perks";
import { VENDORS, vendorBySlug } from "@/lib/vendors";
import StoreView from "./StoreView";

/** One page per vendor, at the same path as on the original store. */
export const dynamicParams = false;

export function generateStaticParams() {
  return VENDORS.map((v) => ({ vendor: v.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ vendor: string }> }): Promise<Metadata> {
  const { vendor } = await params;
  const v = vendorBySlug(vendor);
  if (!v) return {};
  return { title: `${v.name} store`, description: `Shop everything ${v.name} sells on Naadu Nalam.` };
}

export default async function StorePage({ params }: { params: Promise<{ vendor: string }> }) {
  const { vendor } = await params;
  const v = vendorBySlug(vendor);
  if (!v) notFound();

  return (
    <main id="main" className="pt-[96px] md:pt-[104px]">
      <StoreView vendor={v} />
      <Perks />
    </main>
  );
}
