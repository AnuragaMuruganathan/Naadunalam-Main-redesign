"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import {
  AlertCircle,
  Building2,
  Check,
  ChevronDown,
  CircleCheckBig,
  Globe,
  Loader2,
  Lock,
  Mail,
  Map as MapIcon,
  MapPin,
  NotebookPen,
  Pencil,
  Phone,
  ShoppingBasket,
  Truck,
  User,
  type LucideIcon,
} from "lucide-react";
import Totals from "@/components/shop/OrderSummary";
import PageStage from "@/components/shop/PageStage";
import { rupees } from "@/lib/format";
import { cartSummary, clearCart, getProduct, useShop } from "@/lib/store";
import { STATES, submitOrder, validate, type Billing, type Field, type PlacedOrder } from "@/lib/order";
import { STORE } from "@/lib/content";

const EMPTY: Billing = {
  email: "",
  firstName: "",
  lastName: "",
  address1: "",
  address2: "",
  city: "",
  state: "Tamil Nadu",
  postcode: "",
  phone: "",
  notes: "",
};
const REQUIRED: Field[] = ["email", "phone", "firstName", "lastName", "address1", "city", "postcode", "state"];
const LABELS: Record<Field, string> = {
  email: "Email address",
  firstName: "First name",
  lastName: "Last name",
  address1: "Address",
  address2: "Apartment, suite, etc.",
  city: "City / Town",
  state: "State",
  postcode: "Pincode",
  phone: "Phone",
  notes: "Order notes",
};

export default function CheckoutView() {
  const { cart, hydrated } = useShop();
  const summary = cartSummary(cart);
  const [form, setForm] = useState<Billing>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [busy, setBusy] = useState(false);
  const [order, setOrder] = useState<PlacedOrder | null>(null);
  const errorBox = useRef<HTMLDivElement>(null);
  const [showSummary, setShowSummary] = useState(false);

  const set = (k: Field, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    // Once a field has been left with an error, re-check it as the user fixes it
    if (touched[k]) setErrors((e) => ({ ...e, [k]: validate(k, v) ?? undefined }));
  };
  const blur = (k: Field) => {
    setTouched((t) => ({ ...t, [k]: true }));
    setErrors((e) => ({ ...e, [k]: validate(k, form[k]) ?? undefined }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const next: Partial<Record<Field, string>> = {};
    for (const k of REQUIRED) {
      const msg = validate(k, form[k]);
      if (msg) next[k] = msg;
    }
    setErrors(next);
    setTouched(Object.fromEntries(REQUIRED.map((k) => [k, true])));
    if (Object.keys(next).length) {
      setShowSummary(true);
      requestAnimationFrame(() => errorBox.current?.focus());
      return;
    }
    setShowSummary(false);
    setBusy(true);
    try {
      const placed = await submitOrder({
        billing: form,
        lines: cart,
        subtotal: summary.subtotal,
        shipping: summary.shipping,
        total: summary.total,
      });
      setOrder(placed);
      clearCart();
      window.scrollTo({ top: 0 });
      (window as unknown as { __lenis?: { scrollTo: (n: number, o: object) => void } }).__lenis?.scrollTo(0, { immediate: true });
    } finally {
      setBusy(false);
    }
  };

  if (order) return <Confirmation order={order} />;

  const errorList = REQUIRED.filter((k) => errors[k]);
  const io = { form, errors, set, blur };

  return (
    <PageStage id="co-title" title="Checkout">
      {!hydrated ? (
        <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-8" aria-hidden>
          <div className="h-[560px] animate-pulse rounded-[1.6rem] bg-sand/60" />
          <div className="h-96 animate-pulse rounded-[1.6rem] bg-sand/60" />
        </div>
      ) : summary.lines.length === 0 ? (
        <div className="relative overflow-hidden rounded-[1.6rem] bg-white/90 px-6 py-16 text-center shadow-[0_20px_44px_-30px_rgba(60,40,10,0.5)] ring-1 ring-forest-600/8">
          <span className="mx-auto grid size-20 place-items-center rounded-full bg-cream text-forest-600 ring-1 ring-forest-600/10">
            <ShoppingBasket className="size-9" strokeWidth={1.5} aria-hidden />
          </span>
          <h2 className="mt-6 text-[1.713rem] font-bold text-forest-700">Your cart is empty</h2>
          <p className="mx-auto mt-2 max-w-[44ch] text-ink/75">Add a few products before checking out.</p>
          <Link href="/shop" className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-full bg-forest-700 px-7 font-bold text-white hover:bg-forest-800">
            Start shopping <span aria-hidden>→</span>
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-8">
          {/* Progress, centred over the form column */}
          <div className="flex justify-center lg:col-start-1 lg:row-start-1">
            <Steps />
          </div>

          <div className="space-y-5 lg:col-start-1 lg:row-start-2">
            {showSummary && errorList.length > 0 && (
              <div
                ref={errorBox}
                tabIndex={-1}
                role="alert"
                className="rounded-2xl border border-[#b3261e]/30 bg-[#fdf1ef] p-4 text-[#8c1d17]"
              >
                <p className="flex items-center gap-2 font-bold">
                  <AlertCircle className="size-5" aria-hidden />
                  Please fix {errorList.length === 1 ? "this field" : `these ${errorList.length} fields`}:
                </p>
                <ul className="mt-2 list-disc space-y-0.5 pl-9 text-sm">
                  {errorList.map((k) => (
                    <li key={k}>
                      <a href={`#co-${k}`} className="underline underline-offset-2" onClick={(e) => { e.preventDefault(); document.getElementById(`co-${k}`)?.focus(); }}>
                        {LABELS[k]}
                      </a>
                      : {errors[k]}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Card title="Contact Details" n={1} decor={<Sprig className="h-[52px] w-[60px]" />}>
              <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
                <Input k="email" icon={Mail} type="email" autoComplete="email" inputMode="email" placeholder="Enter your email" hint="For order updates and delivery notifications" {...io} />
                <Input k="phone" icon={Phone} type="tel" autoComplete="tel" inputMode="tel" placeholder="Enter your phone number" {...io} />
              </div>
            </Card>

            <Card title="Delivery Address" n={2} decor={<VillageSketch className="h-[54px] w-[170px]" />}>
              <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
                <Input k="firstName" icon={User} autoComplete="given-name" placeholder="Enter first name" {...io} />
                <Input k="lastName" icon={User} autoComplete="family-name" placeholder="Enter last name" {...io} />
                <Input k="address1" icon={MapPin} autoComplete="street-address" placeholder="House no., Street, Area" className="sm:col-span-2" {...io} />
                <Input k="city" icon={Building2} autoComplete="address-level2" placeholder="Enter city or town" {...io} />
                <Input k="postcode" icon={MapPin} autoComplete="postal-code" inputMode="numeric" maxLength={7} placeholder="Enter pincode" {...io} />
                <SelectField id="co-state" icon={MapIcon} label="State" error={errors.state}>
                  <select
                    id="co-state"
                    autoComplete="address-level1"
                    value={form.state}
                    onChange={(e) => set("state", e.target.value)}
                    onBlur={() => blur("state")}
                    aria-invalid={!!errors.state}
                    aria-describedby={errors.state ? "co-state-err" : undefined}
                    className={`${field(!!errors.state)} cursor-pointer appearance-none pr-11`}
                  >
                    <option value="">Select a state…</option>
                    {STATES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </SelectField>
                <SelectField id="co-country" icon={Globe} label="Country / Region">
                  <select id="co-country" autoComplete="country-name" defaultValue="India" className={`${field(false)} cursor-pointer appearance-none pr-11`}>
                    <option>India</option>
                  </select>
                </SelectField>
              </div>
            </Card>

            <Card title="Order Notes" n={3} optional>
              <label htmlFor="co-notes" className="sr-only">Order notes</label>
              <div className="relative">
                <NotebookPen className="pointer-events-none absolute left-4 top-3.5 size-[18px] text-forest-600/70" aria-hidden />
                <textarea
                  id="co-notes"
                  rows={2}
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  placeholder="Notes about your order, e.g. special notes for delivery."
                  className={`${field(false)} min-h-[4.5rem] py-3 pl-11`}
                />
              </div>
            </Card>
          </div>

          {/*
            Pinned beside the form on desktop, capped to the screen height so
            "Place order" is always on screen; the item list scrolls inside.
            Too-short screens don't pin.
          */}
          <aside aria-labelledby="your-order" className="lg:col-start-2 lg:row-start-2 lg:top-[120px] [@media(min-height:700px)]:lg:sticky">
            <div className="relative overflow-hidden rounded-[1.6rem] bg-white/95 p-5 shadow-[0_24px_50px_-30px_rgba(60,40,10,0.55)] ring-1 ring-forest-600/8 md:p-6 lg:flex lg:max-h-[calc(100svh-140px)] lg:flex-col">
              <div className="flex shrink-0 items-center justify-between gap-3">
                <h2 id="your-order" className="text-[1.35rem] font-bold text-forest-800">Your Order</h2>
                <Link href="/cart" className="inline-flex min-h-10 items-center gap-1.5 rounded-full px-2 text-[0.9rem] font-semibold text-forest-700 transition-colors hover:bg-forest-600/8">
                  <Pencil className="size-4" aria-hidden />
                  Edit cart
                </Link>
              </div>

              <ul data-lenis-prevent className="mt-3 min-h-16 space-y-3 overflow-y-auto pr-1 lg:max-h-[260px]">
                {summary.lines.map(({ id, qty, product: p }) => (
                  <li key={id} className="flex items-center gap-3.5">
                    <span className="relative shrink-0">
                      <span className="relative block size-14 overflow-hidden rounded-xl bg-sand">
                        <Image src={p.img} alt="" fill sizes="56px" className="object-cover" />
                      </span>
                      <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-forest-700 px-1 text-[0.7rem] font-bold text-white ring-2 ring-white">
                        {qty}
                      </span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[0.98rem] font-bold text-ink">{p.name}</span>
                      <span className="block truncate text-[0.8rem] text-muted">
                        {p.pack}
                        {qty > 1 && ` × ${qty}`} <span aria-hidden>•</span> Vendor: Naadu Nalam
                      </span>
                    </span>
                    <span className="text-[0.98rem] font-bold tabular-nums text-ink">{rupees(p.price * qty)}</span>
                  </li>
                ))}
              </ul>

              <dl className="mt-4 shrink-0 space-y-2.5 border-t border-forest-600/10 pt-4 text-[0.95rem]">
                <div className="flex justify-between gap-4">
                  <dt className="text-ink/85">Subtotal ({summary.items} {summary.items === 1 ? "item" : "items"})</dt>
                  <dd className="font-bold tabular-nums text-ink">{rupees(summary.subtotal)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-ink/85">
                    Delivery
                    <span className="block text-[0.8rem] text-muted">Flat rate, per order</span>
                  </dt>
                  <dd className="font-bold tabular-nums text-ink">{summary.shipping ? rupees(summary.shipping) : "—"}</dd>
                </div>
                <div className="relative flex items-center justify-between gap-4 overflow-hidden rounded-xl bg-[#e9f2da] px-3.5 py-2.5 ring-1 ring-leaf/20">
                  <span aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 -translate-y-1/2 opacity-25">
                    <Sprig className="h-[46px] w-[54px]" />
                  </span>
                  <dt className="relative text-[1.35rem] font-bold text-forest-900">Total</dt>
                  <dd className="relative text-[1.75rem] font-bold leading-none tabular-nums text-forest-900">{rupees(summary.total)}</dd>
                </div>
              </dl>

              <fieldset className="mt-5 shrink-0">
                <legend className="mb-2.5 text-[1.2rem] font-bold text-forest-800">Payment Method</legend>
                <label className="flex cursor-pointer items-center gap-3.5 rounded-2xl border-[1.5px] border-forest-600 bg-[#f1f7e8] px-4 py-3 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-gold">
                  <input type="radio" name="payment" value="cod" defaultChecked className="peer sr-only" />
                  <span aria-hidden className="grid size-5 shrink-0 place-items-center rounded-full border-2 border-forest-700">
                    <span className="size-2.5 rounded-full bg-forest-700" />
                  </span>
                  <Truck className="size-6 shrink-0 text-forest-700" strokeWidth={1.7} aria-hidden />
                  <span>
                    <span className="block font-bold text-ink">Cash on Delivery</span>
                    <span className="block text-[0.85rem] text-muted">Pay with cash upon delivery.</span>
                  </span>
                </label>
              </fieldset>

              <motion.button
                type="submit"
                disabled={busy}
                whileTap={{ scale: 0.98 }}
                className="mt-5 inline-flex min-h-[3.25rem] w-full shrink-0 cursor-pointer items-center justify-center gap-2.5 rounded-full bg-forest-700 px-6 text-[1.08rem] font-bold text-white shadow-[0_14px_26px_-14px_rgba(10,57,25,0.8)] transition-colors hover:bg-forest-800 disabled:cursor-wait disabled:opacity-80"
              >
                {busy ? (
                  <>
                    <Loader2 className="size-5 animate-spin" aria-hidden /> Placing order…
                  </>
                ) : (
                  <>
                    <Lock className="size-[19px]" aria-hidden /> Place Order · {rupees(summary.total)}
                  </>
                )}
              </motion.button>

              <p className="mt-3 shrink-0 text-center text-[0.72rem] leading-snug text-muted">
                Your details are used only to process and deliver this order.
              </p>
            </div>
          </aside>
        </form>
      )}
    </PageStage>
  );
}

/* ---------------------------------------------------------------- Form pieces */

const field = (err: boolean) =>
  `block min-h-11 w-full rounded-xl border bg-white px-4 text-[0.98rem] text-ink outline-none transition-[border-color,box-shadow] placeholder:text-muted/70 focus:border-forest-600 focus:ring-4 focus:ring-forest-600/12 ${
    err ? "border-[#b3261e] ring-4 ring-[#b3261e]/10" : "border-forest-600/20"
  }`;

function Label({ htmlFor, icon: Icon, children, optional }: { htmlFor: string; icon: LucideIcon; children: React.ReactNode; optional?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 flex items-center gap-2 text-[0.9rem] font-semibold text-ink">
      <Icon className="size-4 shrink-0 text-forest-700" strokeWidth={1.9} aria-hidden />
      <span>
        {children}{" "}
        {optional ? (
          <span className="font-normal text-muted">(optional)</span>
        ) : (
          <span className="text-[#b3261e]" aria-hidden>*</span>
        )}
      </span>
    </label>
  );
}

function Err({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <p id={id} className="mt-1.5 flex items-center gap-1.5 text-sm font-semibold text-[#b3261e]">
      <AlertCircle className="size-4 shrink-0" aria-hidden />
      {children}
    </p>
  );
}

function Input({
  k,
  icon,
  form,
  errors,
  set,
  blur,
  optional,
  hint,
  className = "",
  ...rest
}: {
  k: Field;
  icon: LucideIcon;
  form: Billing;
  errors: Partial<Record<Field, string>>;
  set: (k: Field, v: string) => void;
  blur: (k: Field) => void;
  optional?: boolean;
  hint?: string;
  className?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "form">) {
  const id = `co-${k}`;
  const err = errors[k];
  const describedBy = [hint && `${id}-hint`, err && `${id}-err`].filter(Boolean).join(" ") || undefined;
  return (
    <div className={className}>
      <Label htmlFor={id} icon={icon} optional={optional}>{LABELS[k]}</Label>
      <input
        id={id}
        name={k}
        value={form[k]}
        onChange={(e) => set(k, e.target.value)}
        onBlur={() => !optional && blur(k)}
        required={!optional}
        aria-invalid={!!err}
        aria-describedby={describedBy}
        className={field(!!err)}
        {...rest}
      />
      {hint && !err && (
        <p id={`${id}-hint`} className="mt-1.5 text-[0.8rem] text-muted">{hint}</p>
      )}
      {err && <Err id={`${id}-err`}>{err}</Err>}
    </div>
  );
}

function SelectField({ id, icon, label, error, children }: { id: string; icon: LucideIcon; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <Label htmlFor={id} icon={icon}>{label}</Label>
      <div className="relative">
        {children}
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-ink/70" aria-hidden />
      </div>
      {error && <Err id={`${id}-err`}>{error}</Err>}
    </div>
  );
}

function Card({
  title,
  n,
  optional,
  decor,
  children,
}: {
  title: string;
  n: number;
  optional?: boolean;
  decor?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="relative rounded-[1.6rem] bg-white/92 p-5 shadow-[0_20px_44px_-30px_rgba(60,40,10,0.5)] ring-1 ring-forest-600/8 md:px-7 md:py-6">
      {decor && (
        <span aria-hidden className="pointer-events-none absolute right-5 top-3 max-sm:hidden">
          {decor}
        </span>
      )}
      <h2 className="relative mb-4 flex items-center gap-3 text-[1.3rem] font-bold text-forest-800">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-forest-700 text-[0.95rem] text-white">{n}</span>
        {title}
        {optional && <span className="text-[0.9rem] font-normal text-muted">(optional)</span>}
      </h2>
      {children}
    </section>
  );
}

function Steps({ done = false }: { done?: boolean }) {
  const steps = ["Cart", "Details", "Confirmation"];
  const at = done ? 2 : 1;
  return (
    <ol
      className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-white/92 px-2.5 py-2 text-[0.84rem] sm:text-[0.92rem] shadow-[0_14px_30px_-20px_rgba(60,40,10,0.5)] ring-1 ring-forest-600/8 backdrop-blur-sm sm:gap-3 sm:px-4"
      aria-label="Checkout progress"
    >
      {steps.map((s, i) => (
        <li key={s} className="flex items-center gap-1.5 sm:gap-3" aria-current={i === at ? "step" : undefined}>
          {i > 0 && <span aria-hidden className={`h-px w-3 sm:w-12 ${i <= at ? "bg-forest-700" : "bg-forest-600/25"}`} />}
          <span
            className={`grid size-7 shrink-0 place-items-center rounded-full text-[0.8rem] font-bold sm:size-8 sm:text-[0.85rem] ${
              i <= at ? "bg-forest-700 text-white" : "bg-forest-600/10 text-ink/70"
            }`}
          >
            {i < at ? <Check className="size-4" strokeWidth={2.6} aria-hidden /> : i + 1}
          </span>
          <span className={i === at ? "font-bold text-ink" : "font-medium text-ink/75"}>{s}</span>
        </li>
      ))}
    </ol>
  );
}

/* ---------------------------------------------------------------- Ornaments */

/** Small three-leaf sprig. */
function Sprig({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 52" className={className} aria-hidden>
      <path d="M8 50C20 38 30 26 44 6" stroke="#3d6b26" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M44 6C40 18 30 24 22 22C26 12 34 6 44 6Z" fill="#4f8a2a" />
      <path d="M30 28C42 22 54 24 58 30C48 38 36 36 30 28Z" fill="#6fa83a" />
      <path d="M18 38C12 28 4 26 0 28C2 38 10 42 18 38Z" fill="#2f6f2a" />
      <path d="M44 6C38 14 30 19 24 21M30 28C40 28 50 29 57 30M18 38C12 34 6 31 1 29" stroke="#e8f5d0" strokeOpacity=".6" strokeWidth=".8" fill="none" />
    </svg>
  );
}

/** Line sketch of a village house under palms. */
function VillageSketch({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 170 54" className={className} aria-hidden fill="none" stroke="#b8863b" strokeOpacity=".55" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 50C30 46 60 47 90 48S150 50 168 47" />
      <path d="M14 51c10-4 22-5 34-3M108 50c12-3 26-4 40-2" strokeOpacity=".35" />
      {/* house */}
      <path d="M70 48V30h40v18M64 31l26-15 26 15M76 48V37h8v11M94 36h9v6h-9z" />
      <path d="M68 30h44" strokeOpacity=".4" />
      {/* palms */}
      <path d="M134 48c1-12 3-22 8-32M142 16c-6-1-11 1-14 5M142 16c5-3 11-2 15 2M142 16c-2-5-7-7-11-7M142 16c3-5 8-6 12-4M142 16c0 4 2 8 5 10" />
      <path d="M150 48c0-8 1-14 4-20M154 28c-4 0-7 2-9 4M154 28c3-2 7-1 9 2M154 28c0-3-3-5-6-5" strokeOpacity=".7" />
      {/* bushes */}
      <path d="M40 48c2-5 8-6 11-2 2-3 7-3 8 2M118 48c2-4 6-5 9-2" strokeOpacity=".6" />
    </svg>
  );
}

/* ---------------------------------------------------------------- Confirmation */

function Confirmation({ order }: { order: PlacedOrder }) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => heading.current?.focus(), []);
  const b = order.billing;
  return (
    <PageStage id="co-title" title="Order received">
      <div className="flex justify-center">
        <Steps done />
      </div>
      <div className="mx-auto mt-6 max-w-[920px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden rounded-[1.6rem] bg-white shadow-[0_24px_50px_-30px_rgba(60,40,10,0.55)] ring-1 ring-forest-600/8"
        >
          <div className="grain relative bg-forest-900 px-6 py-10 text-center text-white md:px-10">
            <motion.span
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 16, delay: 0.15 }}
              className="mx-auto grid size-16 place-items-center rounded-full bg-gold-soft text-forest-950"
            >
              <CircleCheckBig className="size-8" aria-hidden />
            </motion.span>
            <h2 ref={heading} tabIndex={-1} className="mt-5 text-[1.87rem] font-bold outline-none">
              Thank you, {b.firstName}!
            </h2>
            <p className="mx-auto mt-2 max-w-[48ch] text-white/80">
              Your order has been received. We’ll call {b.phone} to confirm before dispatch — please keep {rupees(order.total)} ready in cash on delivery.
            </p>
          </div>

          <dl className="grid grid-cols-2 gap-px bg-forest-600/10 text-sm md:grid-cols-4">
            {[
              ["Order number", order.number],
              ["Date", new Date(order.placedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })],
              ["Total", rupees(order.total)],
              ["Payment", "Cash on delivery"],
            ].map(([k, v]) => (
              <div key={k} className="bg-white px-5 py-4">
                <dt className="text-muted">{k}</dt>
                <dd className="mt-0.5 font-bold text-ink">{v}</dd>
              </div>
            ))}
          </dl>

          <div className="grid gap-8 p-6 md:grid-cols-[1.3fr_1fr] md:p-8">
            <div>
              <h3 className="text-lg font-bold text-forest-700">Order details</h3>
              <ul className="mt-3 divide-y divide-forest-600/10">
                {order.lines.map((l) => {
                  const p = getProduct(l.id);
                  if (!p) return null;
                  return (
                    <li key={l.id} className="flex justify-between gap-3 py-2.5 text-sm">
                      <span className="min-w-0">
                        <span className="font-semibold text-ink">{p.name}</span>
                        <span className="text-muted"> × {l.qty}</span>
                      </span>
                      <span className="font-semibold tabular-nums">{rupees(p.price * l.qty)}</span>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-3 border-t border-forest-600/10 pt-4">
                <Totals subtotal={order.subtotal} shipping={order.shipping} total={order.total} items={order.lines.reduce((n, l) => n + l.qty, 0)} />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-forest-700">Delivering to</h3>
              <address className="mt-3 rounded-2xl bg-cream p-4 text-sm not-italic leading-relaxed text-ink">
                <b>{b.firstName} {b.lastName}</b>
                <br />
                {b.address1}
                {b.address2 && <><br />{b.address2}</>}
                <br />
                {b.city} – {b.postcode}
                <br />
                {b.state}, India
                <br />
                {b.phone}
                <br />
                {b.email}
              </address>
              <p className="mt-4 text-sm text-muted">
                Questions about your order? Call us on{" "}
                <a href={`tel:${STORE.tel}`} className="font-bold text-forest-700 underline underline-offset-4">{STORE.phone}</a>.
              </p>
            </div>
          </div>
        </motion.div>
        <div className="mt-8 text-center">
          <Link href="/shop" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-forest-700 px-7 font-bold text-white transition-colors hover:bg-forest-800">
            Continue shopping <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </PageStage>
  );
}
