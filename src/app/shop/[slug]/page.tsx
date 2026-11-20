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

  // Product structured data (price, stock) for search results. Image/URL paths
  // become absolute once NEXT_PUBLIC_SITE_URL is set for the deployed domain.
  const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.ta ? `${product.name} (${product.ta})` : product.name,
    image: `${site}${product.img}`,
    description: product.summary,
    sku: product.sku,
    brand: { "@type": "Brand", name: "Naadu Nalam" },
    offers: {
      "@type": "Offer",
      url: `${site}/shop/${product.slug}`,
      price: product.price.toFixed(2),
      priceCurrency: "INR",
      availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  return (
    <main id="main" className="pt-[96px] md:pt-[104px]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <ProductView product={product} detail={PRODUCT_DETAILS[slug]} />
      <Recommendations exclude={[product.id]} title="You may also like" sub="" />
      <Perks />
    </main>
  );
}
