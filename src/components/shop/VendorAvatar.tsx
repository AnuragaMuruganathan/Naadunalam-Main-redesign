import Image from "next/image";
import type { Vendor } from "@/lib/vendors";

const SIZES = {
  xs: "size-6 text-[0.7rem]",
  sm: "size-10 text-[0.95rem]",
  md: "size-14 text-[1.3rem]",
  lg: "size-20 text-[2rem] md:size-24 md:text-[2.4rem]",
} as const;

/** Store logo on a white disc, or a forest monogram for vendors without a logo. */
export default function VendorAvatar({ vendor, size = "md" }: { vendor: Vendor; size?: keyof typeof SIZES }) {
  return (
    <span
      aria-hidden
      className={`relative grid shrink-0 place-items-center overflow-hidden rounded-full font-bold ring-1 ${SIZES[size]} ${
        vendor.logo ? "bg-white ring-forest-600/15" : "bg-forest-700 text-white ring-gold/50"
      }`}
    >
      {vendor.logo ? (
        <Image src={vendor.logo} alt="" fill sizes="96px" className="object-contain p-[8%]" />
      ) : (
        vendor.name.charAt(0)
      )}
    </span>
  );
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** "2026-09-22" → "Sep 2026" (no Intl, so server and client render the same) */
export const monthYear = (iso: string) => `${MONTHS[Number(iso.slice(5, 7)) - 1]} ${iso.slice(0, 4)}`;
