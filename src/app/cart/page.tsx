import type { Metadata } from "next";
import CartView from "./CartView";

export const metadata: Metadata = {
  title: "Your Cart",
  description: "Review your Naadu Nalam order. Flat ₹50 delivery, cash on delivery.",
};

export default function CartPage() {
  return (
    <main id="main" className="pt-[96px] md:pt-[104px]">
      <CartView />
    </main>
  );
}
