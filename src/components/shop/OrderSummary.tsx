import { Banknote } from "lucide-react";
import { rupees } from "@/lib/format";

/** Subtotal / delivery / total block, shared by cart and checkout. */
export default function Totals({
  subtotal,
  shipping,
  total,
  items,
  compact = false,
}: {
  subtotal: number;
  shipping: number;
  total: number;
  items: number;
  /** Tighter spacing, for the checkout side panel */
  compact?: boolean;
}) {
  return (
    <dl className={`text-[0.939rem] ${compact ? "space-y-2" : "space-y-3"}`}>
      <div className="flex justify-between gap-4">
        <dt className="text-muted">Subtotal ({items} {items === 1 ? "item" : "items"})</dt>
        <dd className="font-semibold tabular-nums text-ink">{rupees(subtotal)}</dd>
      </div>
      <div className="flex justify-between gap-4">
        <dt className="text-muted">
          Delivery
          <span className="block text-xs">Flat rate, per order</span>
        </dt>
        <dd className="font-semibold tabular-nums text-ink">{shipping ? rupees(shipping) : "—"}</dd>
      </div>
      <div className={`flex items-baseline justify-between gap-4 border-t border-dashed border-forest-600/25 ${compact ? "pt-2.5" : "pt-4"}`}>
        <dt className="font-serif text-lg font-bold text-forest-700">Total</dt>
        <dd className={`font-serif font-bold tabular-nums text-forest-700 ${compact ? "text-[1.441rem]" : "text-[1.555rem]"}`}>{rupees(total)}</dd>
      </div>
    </dl>
  );
}

export function CodNote() {
  return (
    <p className="flex items-start gap-3 rounded-2xl bg-sage px-4 py-3 text-sm text-forest-800">
      <Banknote className="mt-0.5 size-5 shrink-0" aria-hidden />
      <span>
        <b>Cash on Delivery</b> — pay when your order arrives.
      </span>
    </p>
  );
}
