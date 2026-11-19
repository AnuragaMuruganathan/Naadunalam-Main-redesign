"use client";

import { Minus, Plus } from "lucide-react";

/** − qty + control. 44px hit areas; the value is announced on change. */
export default function QtyStepper({
  value,
  max,
  onChange,
  label,
  size = "md",
  min = 1,
}: {
  value: number;
  max: number;
  onChange: (n: number) => void;
  label: string;
  size?: "sm" | "md";
  min?: number;
}) {
  const btn =
    "grid cursor-pointer place-items-center rounded-full text-forest-700 transition-colors hover:bg-forest-600/10 disabled:cursor-not-allowed disabled:opacity-35 " +
    (size === "sm" ? "size-9" : "size-11");
  return (
    <div
      role="group"
      aria-label={`Quantity for ${label}`}
      className="inline-flex items-center rounded-full border border-forest-600/20 bg-white p-0.5"
    >
      <button
        type="button"
        className={btn}
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label={`Decrease quantity of ${label}`}
      >
        <Minus className="size-4" aria-hidden />
      </button>
      <span aria-live="polite" className={`text-center font-bold tabular-nums text-ink ${size === "sm" ? "w-7 text-sm" : "w-9"}`}>
        {value}
      </span>
      <button
        type="button"
        className={btn}
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label={`Increase quantity of ${label}`}
      >
        <Plus className="size-4" aria-hidden />
      </button>
    </div>
  );
}
