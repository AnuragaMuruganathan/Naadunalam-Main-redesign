import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PRODUCTS } from "@/lib/catalog";
import { PRODUCT_DETAILS } from "@/lib/productDetails";
import Perks from "@/components/shop/Perks";
import Recommendations from "@/components/shop/Recommendations";
import ProductView from "./ProductView";

const bySlug = (slug: string) => PRODUCTS.find((p) => p.slug === slug);

/** Every product page is prerendered; unknown slugs 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = bySlug(slug);
  if (!p) return {};
  return {
    title: p.name,
    description: p.summary,
    openGraph: { title: `${p.name} | Naadu Nalam`, description: p.summary, images: [p.img] },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = bySlug(slug);
  if (!product) notFound();

  return (
    <main id="main" className="pt-[112px] md:pt-[122px]">
      <ProductView product={product} detail={PRODUCT_DETAILS[slug]} />
      <Recommendations exclude={[product.id]} title="You may also like" sub="More from our shelves" />
      <Perks />
    </main>
  );
}
