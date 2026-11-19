import type { Metadata } from "next";
import WishlistView from "./WishlistView";
import Perks from "@/components/shop/Perks";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "Your favourite Naadu Nalam products, all in one place.",
};

export default async function WishlistPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const raw = (await searchParams).items;
  const shared = (Array.isArray(raw) ? raw[0] : raw ?? "")
    .split(",")
    .map(Number)
    .filter((n) => Number.isInteger(n) && n > 0);

  return (
    <main id="main" className="pt-[112px] md:pt-[122px]">
      <WishlistView shared={shared} />
      <Perks />
    </main>
  );
}
