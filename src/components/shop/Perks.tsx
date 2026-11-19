import { Banknote, HandHeart, Sprout, Truck } from "lucide-react";

/** Store promises, worded as on the original site's wishlist and cart pages. */
const PERKS = [
  { icon: Sprout, title: "Sourced Close to Home", body: "Fewer hands between farm and kitchen" },
  { icon: Truck, title: "Flat ₹50 Delivery", body: "Chennai & Tamil Nadu, per order" },
  { icon: Banknote, title: "Cash on Delivery", body: "Pay when your order arrives" },
  { icon: HandHeart, title: "100% Natural", body: "Farm direct, for healthy living" },
];

export default function Perks() {
  return (
    <section aria-label="Why shop with Naadu Nalam" className="grain border-y border-forest-600/10 bg-sage">
      <ul className="mx-auto grid max-w-[1320px] grid-cols-1 gap-x-6 gap-y-6 min-[480px]:grid-cols-2 px-5 py-9 md:px-8 lg:grid-cols-4">
        {PERKS.map(({ icon: Icon, title, body }) => (
          <li key={title} className="flex items-start gap-3.5">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-ivory text-forest-600 shadow-[0_8px_18px_-10px_rgba(60,40,10,0.45)] ring-1 ring-forest-600/10">
              <Icon className="size-[22px]" strokeWidth={1.6} aria-hidden />
            </span>
            <span className="min-w-0 pt-0.5">
              <span className="block font-serif text-[1rem] font-bold leading-snug text-forest-700">{title}</span>
              <span className="mt-0.5 block text-[0.86rem] leading-snug text-muted">{body}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
