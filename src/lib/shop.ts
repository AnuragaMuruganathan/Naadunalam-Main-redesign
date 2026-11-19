import { PRODUCTS, SHOP_CATEGORIES, type Product } from "./catalog";

const CAT_BY_SLUG = new Map(SHOP_CATEGORIES.map((c) => [c.slug, c]));
export const categoryOf = (slug: string) => CAT_BY_SLUG.get(slug);

export const SORTS = [
  { value: "default", label: "Default sorting" },
  { value: "name", label: "Name: A to Z" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
] as const;
export type SortValue = (typeof SORTS)[number]["value"];

/** Pack sizes in the catalog, smallest first. */
const packWeight = (pack: string) => {
  const m = pack.match(/([\d.]+)\s*(kg|g|ml|l)/i);
  if (!m) return 0;
  const n = parseFloat(m[1]);
  return /kg|^l$/i.test(m[2]) ? n * 1000 : n;
};
export const PACKS = [...new Set(PRODUCTS.map((p) => p.pack).filter(Boolean))].sort(
  (a, b) => packWeight(a) - packWeight(b) || a.localeCompare(b)
);

export const PRICE_MIN = Math.floor(Math.min(...PRODUCTS.map((p) => p.price)));
export const PRICE_MAX = Math.ceil(Math.max(...PRODUCTS.map((p) => p.price)));

/**
 * "You may also like": items from the same categories first, then the rest,
 * never anything already excluded (in the cart / wishlist).
 */
export function recommend(exclude: number[], n = 4): Product[] {
  const ex = new Set(exclude);
  const cats = new Set(PRODUCTS.filter((p) => ex.has(p.id)).map((p) => p.category));
  const pool = PRODUCTS.filter((p) => !ex.has(p.id) && p.inStock);
  const same = pool.filter((p) => cats.has(p.category));
  const rest = pool.filter((p) => !cats.has(p.category));
  // Spread picks across categories so the row isn't four varieties of one rice.
  const picked: Product[] = [];
  const seen = new Set<string>();
  for (const p of [...same, ...rest]) {
    if (picked.length >= n) break;
    if (seen.has(p.category)) continue;
    seen.add(p.category);
    picked.push(p);
  }
  for (const p of [...same, ...rest]) {
    if (picked.length >= n) break;
    if (!picked.includes(p)) picked.push(p);
  }
  return picked;
}
