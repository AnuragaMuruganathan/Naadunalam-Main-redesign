import type { Metadata } from "next";
import ShopView from "./ShopView";
import Perks from "@/components/shop/Perks";
import { SORTS, type SortValue } from "@/lib/shop";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Traditional rice, aval, millets, cold-pressed oils, health mixes and natural sweeteners — sourced close to home, flat ₹50 delivery across Tamil Nadu.",
};

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const sortRaw = one(sp.sort);
  const initial = {
    categories: one(sp.category).split(",").filter(Boolean),
    q: one(sp.q),
    sort: (SORTS.some((s) => s.value === sortRaw) ? sortRaw : "default") as SortValue,
    page: Math.max(1, parseInt(one(sp.page), 10) || 1),
  };

  return (
    <main id="main" className="pt-[112px] md:pt-[122px]">
      {/* Remount when a menu link changes the filters, so the view starts from the new URL */}
      <ShopView key={`${initial.categories.join(",")}|${initial.q}`} initial={initial} />
      <Perks />
    </main>
  );
}
