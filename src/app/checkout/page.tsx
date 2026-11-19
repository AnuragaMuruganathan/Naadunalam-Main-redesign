import type { Metadata } from "next";
import CheckoutView from "./CheckoutView";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Billing and delivery details. Cash on delivery, flat ₹50 delivery.",
};

export default function CheckoutPage() {
  return (
    <main id="main" className="pt-[112px] md:pt-[122px]">
      <CheckoutView />
    </main>
  );
}
