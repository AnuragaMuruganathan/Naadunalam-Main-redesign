import type { CartLine } from "./store";

export const STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh",
  "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep",
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha",
  "Pondicherry (Puducherry)", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

export type Billing = {
  email: string;
  firstName: string;
  lastName: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postcode: string;
  phone: string;
  notes: string;
};

export type Field = keyof Billing;

export function validate(field: Field, v: string): string | null {
  const s = v.trim();
  switch (field) {
    case "email":
      if (!s) return "Enter your email address.";
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s) ? null : "That email doesn’t look right — check for a missing @ or dot.";
    case "firstName":
      return s ? null : "Enter your first name.";
    case "lastName":
      return s ? null : "Enter your last name.";
    case "address1":
      return s ? null : "Enter your street address.";
    case "city":
      return s ? null : "Enter your city or town.";
    case "state":
      return s ? null : "Choose your state.";
    case "postcode":
      if (!s) return "Enter your PIN code.";
      return /^[1-9]\d{5}$/.test(s.replace(/\s/g, "")) ? null : "PIN codes are 6 digits, e.g. 600001.";
    case "phone": {
      if (!s) return "Enter a phone number for delivery.";
      const d = s.replace(/[\s-]/g, "").replace(/^(\+91|0091|0)/, "");
      return /^[6-9]\d{9}$/.test(d) ? null : "Enter a 10-digit mobile number, e.g. 90921 14630.";
    }
    default:
      return null;
  }
}

export type PlacedOrder = {
  number: string;
  placedAt: string;
  billing: Billing;
  lines: CartLine[];
  subtotal: number;
  shipping: number;
  total: number;
};

/**
 * Places the order.
 *
 * This site has no backend yet, so the order is only confirmed in the
 * browser. To take real orders, replace the body with a call to the store's
 * order endpoint (e.g. WooCommerce Store API `POST /wp-json/wc/store/v1/checkout`
 * with `payment_method: "cod"`) and return its order number.
 */
export async function submitOrder(order: Omit<PlacedOrder, "number" | "placedAt">): Promise<PlacedOrder> {
  await new Promise((r) => setTimeout(r, 900));
  const number = `NN${String(Date.now()).slice(-6)}`;
  return { ...order, number, placedAt: new Date().toISOString() };
}
