import Hero from "@/components/Hero";
import HeritageJourney from "@/components/HeritageJourney";
import ShopByCategory from "@/components/ShopByCategory";

export default function Home() {
  return (
    <main id="main" className="pt-[96px] md:pt-[104px]">
      <Hero />
      <HeritageJourney />
      <ShopByCategory />
    </main>
  );
}
