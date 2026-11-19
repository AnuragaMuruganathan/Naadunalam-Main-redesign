const inr = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

/** ₹1,234 — every price in the catalog is a whole number of rupees. */
export function rupees(n: number) {
  return `₹${inr.format(n)}`;
}

export function plural(n: number, one: string, many = `${one}s`) {
  return `${n} ${n === 1 ? one : many}`;
}
