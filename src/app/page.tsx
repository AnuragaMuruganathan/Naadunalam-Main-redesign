import Hero from "@/components/Hero";
import HeritageJourney from "@/components/HeritageJourney";
import ShopByCategory from "@/components/ShopByCategory";

export default function Home() {
  return (
    <main id="main" className="pt-[112px] md:pt-[122px]">
      <Hero />
      <HeritageJourney />
      <ShopByCategory />
    </main>
  );
}
