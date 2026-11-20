import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { LeafRule } from "../Leaf";

type Crumb = { label: string; href?: string };

/** Title band shared by the shop, wishlist, cart and checkout pages. */
export default function PageIntro({
  crumbs,
  eyebrow,
  title,
  ta,
  sub,
  ornament = true,
  compact = false,
  children,
}: {
  crumbs?: Crumb[];
  eyebrow?: string;
  title: string;
  ta?: string;
  sub?: React.ReactNode;
  /** Leaf-and-line flourish beside the title */
  ornament?: boolean;
  /** Shorter band: tighter padding and a smaller title */
  compact?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <section className="grain relative overflow-hidden border-b border-forest-600/10 bg-ivory">
      {/* Gold hairline, echoing the trust strip */}
      <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/45 to-transparent" />
      <div
        className={`mx-auto flex max-w-[1320px] px-5 md:px-8 ${
          compact
            ? "flex-row flex-wrap items-center justify-between gap-x-4 gap-y-1 py-3 md:py-5"
            : "flex-col gap-6 py-8 md:flex-row md:items-end md:justify-between md:py-11"
        }`}
      >
        <div className="min-w-0">
          {crumbs && crumbs.length > 0 && (
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1 text-[0.827rem] text-muted">
              {crumbs.map((c, i) => (
                <li key={c.label} className="flex items-center gap-1">
                  {i > 0 && <ChevronRight className="size-3.5 opacity-60" aria-hidden />}
                  {c.href ? (
                    <Link href={c.href} className="rounded transition-colors hover:text-forest-600">
                      {c.label}
                    </Link>
                  ) : (
                    <span aria-current="page" className="font-semibold text-forest-700">
                      {c.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
          )}
          {eyebrow && (
            <p className={`${crumbs?.length ? "mt-5" : ""} flex items-center gap-3 text-[0.704rem] font-bold uppercase tracking-[0.22em] text-gold`}>
              {eyebrow}
            </p>
          )}
          <div className={`${eyebrow ? "mt-2" : crumbs?.length ? "mt-5" : ""} flex items-center gap-3`}>
            <h1
              className={`font-serif font-bold leading-tight text-forest-600 ${
                compact ? "text-[1.713rem] md:text-[2.238rem]" : "text-[1.975rem] md:text-[2.763rem]"
              }`}
            >
              {title}
            </h1>
            {ornament && (
              <span className="hidden sm:block">
                <LeafRule flip />
              </span>
            )}
          </div>
          {ta && (
            <p lang="ta" className={`font-tamil text-forest-800 ${compact ? "mt-0.5 text-[0.939rem] md:text-[0.955rem]" : "mt-1.5 text-[0.955rem] md:text-[1.063rem]"}`}>
              {ta}
            </p>
          )}
          {sub && <p className="mt-3 max-w-[60ch] text-pretty text-[0.973rem] text-ink/80 md:text-[1.009rem]">{sub}</p>}
        </div>
        {children && <div className="shrink-0">{children}</div>}
      </div>
    </section>
  );
}
