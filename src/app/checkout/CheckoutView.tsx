"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { AlertCircle, Check, CircleCheckBig, Loader2, Lock, ShoppingBasket } from "lucide-react";
import PageIntro from "@/components/shop/PageIntro";
import Totals from "@/components/shop/OrderSummary";
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
const REQUIRED: Field[] = ["email", "firstName", "lastName", "address1", "city", "state", "postcode", "phone"];
const LABELS: Record<Field, string> = {
  email: "Email address",
  firstName: "First name",
  lastName: "Last name",
  address1: "Street address",
  address2: "Apartment, suite, etc.",
  city: "City / Town",
  state: "State",
  postcode: "PIN code",
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

  return (
    <>
      <PageIntro title="Checkout" ornament={false} compact>
        <Steps />
      </PageIntro>

      <section aria-label="Checkout" className="mx-auto max-w-[1320px] px-5 pb-8 pt-5 md:px-8 md:pb-12 md:pt-6">
        {!hydrated ? (
          <div className="grid gap-8 lg:grid-cols-[1fr_420px]" aria-hidden>
            <div className="h-[560px] animate-pulse rounded-3xl bg-sand/60" />
            <div className="h-96 animate-pulse rounded-3xl bg-sand/60" />
          </div>
        ) : summary.lines.length === 0 ? (
          <div className="grain relative overflow-hidden rounded-3xl bg-ivory px-6 py-16 text-center ring-1 ring-forest-600/10">
            <span className="mx-auto grid size-20 place-items-center rounded-full bg-white text-forest-600 ring-1 ring-forest-600/10">
              <ShoppingBasket className="size-9" strokeWidth={1.5} aria-hidden />
            </span>
            <h2 className="mt-6 font-serif text-[1.75rem] font-bold text-forest-700">Your cart is empty</h2>
            <p className="mx-auto mt-2 max-w-[44ch] text-ink/75">Add a few products before checking out.</p>
            <Link href="/shop" className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-full bg-forest-600 px-7 font-bold text-white hover:bg-forest-700">
              Start shopping <span aria-hidden>→</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="grid items-start gap-8 lg:grid-cols-[1fr_420px] lg:gap-10">
            <div className="space-y-6">
              {showSummary && errorList.length > 0 && (
                <div
                  ref={errorBox}
                  tabIndex={-1}
                  role="alert"
                  className="rounded-2xl border border-[#b3261e]/30 bg-[#b3261e]/6 p-4 text-[#8c1d17]"
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

              <Card title="Contact" n={1}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input k="email" type="email" autoComplete="email" inputMode="email" className="sm:col-span-2" {...{ form, errors, set, blur }} />
                  <Input k="phone" type="tel" autoComplete="tel" inputMode="tel" hint="For delivery updates" className="sm:col-span-2" {...{ form, errors, set, blur }} />
                </div>
              </Card>

              <Card title="Delivery address" n={2}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input k="firstName" autoComplete="given-name" {...{ form, errors, set, blur }} />
                  <Input k="lastName" autoComplete="family-name" {...{ form, errors, set, blur }} />
                  <div className="sm:col-span-2">
                    <span className="mb-1.5 block text-sm font-bold text-ink">Country / Region</span>
                    <p className="flex min-h-12 items-center rounded-xl border border-forest-600/15 bg-cream px-4 text-ink/80">India</p>
                  </div>
                  <Input k="address1" autoComplete="address-line1" placeholder="House number and street name" className="sm:col-span-2" {...{ form, errors, set, blur }} />
                  <Input k="address2" autoComplete="address-line2" optional placeholder="Apartment, suite, unit, etc." className="sm:col-span-2" {...{ form, errors, set, blur }} />
                  <Input k="city" autoComplete="address-level2" {...{ form, errors, set, blur }} />
                  <Input k="postcode" autoComplete="postal-code" inputMode="numeric" maxLength={7} {...{ form, errors, set, blur }} />
                  <div className="sm:col-span-2">
                    <label htmlFor="co-state" className="mb-1.5 block text-sm font-bold text-ink">
                      State <span className="text-[#b3261e]" aria-hidden>*</span>
                    </label>
                    <select
                      id="co-state"
                      autoComplete="address-level1"
                      value={form.state}
                      onChange={(e) => set("state", e.target.value)}
                      onBlur={() => blur("state")}
                      aria-invalid={!!errors.state}
                      className={field(!!errors.state)}
                    >
                      <option value="">Select a state…</option>
                      {STATES.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                    {errors.state && <Err id="co-state-err">{errors.state}</Err>}
                  </div>
                </div>
              </Card>

              <Card title="Order notes" n={3} optional>
                <label htmlFor="co-notes" className="sr-only">Order notes</label>
                <textarea
                  id="co-notes"
                  rows={3}
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  placeholder="Notes about your order, e.g. special notes for delivery."
                  className={`${field(false)} min-h-24 py-3`}
                />
              </Card>
            </div>

            {/*
              Pinned beside the form on desktop. Its height is capped to the space it has
              when the page first opens (header + checkout band + gap ≈ 232px), so the
              whole panel, "Place order" included, is on screen from the start and while
              pinned. The item list absorbs the difference and scrolls inside.
              Too-short screens don't pin.
            */}
            <aside aria-labelledby="your-order" className="lg:top-[108px] [@media(min-height:700px)]:lg:sticky">
              <div className="rounded-3xl bg-white p-6 shadow-[0_24px_50px_-30px_rgba(60,40,10,0.55)] ring-1 ring-forest-600/10 lg:flex lg:max-h-[calc(100svh-248px)] lg:flex-col lg:p-5">
                <div className="flex shrink-0 items-baseline justify-between">
                  <h2 id="your-order" className="font-serif text-[1.4rem] font-bold text-forest-700">Your order</h2>
                  <Link href="/cart" className="text-sm font-bold text-forest-600 underline-offset-4 hover:underline">Edit cart</Link>
                </div>
                <ul data-lenis-prevent className="mt-3 max-h-[300px] min-h-12 space-y-2 overflow-y-auto pr-1">
                  {summary.lines.map(({ id, qty, product: p }) => (
                    <li key={id} className="flex items-center gap-3">
                      <span className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-sand">
                        <Image src={p.img} alt="" fill sizes="48px" className="object-cover" />
                        <span className="absolute right-0.5 top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-forest-900 px-1 text-[0.66rem] font-bold text-white">
                          {qty}
                        </span>
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-ink">{p.name}</span>
                        <span className="block text-xs text-muted">{p.pack} × {qty} · Vendor: Naadu Nalam</span>
                      </span>
                      <span className="text-sm font-bold tabular-nums text-ink">{rupees(p.price * qty)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 shrink-0 border-t border-forest-600/10 pt-3">
                  <Totals {...summary} compact />
                </div>

                <fieldset className="mt-3 shrink-0">
                  <legend className="mb-1.5 text-[0.78rem] font-bold uppercase tracking-[0.16em] text-forest-800">Payment</legend>
                  <label className="flex cursor-pointer items-start gap-3 rounded-2xl border-2 border-forest-600 bg-forest-600/5 px-3.5 py-2.5">
                    <input type="radio" name="payment" value="cod" defaultChecked className="mt-1 size-4 accent-forest-600" />
                    <span>
                      <span className="block font-bold text-ink">Cash on delivery</span>
                      <span className="block text-sm text-muted">Pay with cash upon delivery.</span>
                    </span>
                  </label>
                </fieldset>

                <p className="mt-3 shrink-0 text-[0.72rem] leading-snug text-muted">
                  Your personal data will be used to process your order, support your experience throughout this website, and for other purposes described in our privacy policy.
                </p>

                <motion.button
                  type="submit"
                  disabled={busy}
                  whileTap={{ scale: 0.98 }}
                  className="mt-3 inline-flex min-h-12 w-full shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full bg-forest-600 px-6 py-3.5 text-[1.02rem] font-bold text-white transition-colors hover:bg-forest-700 disabled:cursor-wait disabled:opacity-80"
                >
                  {busy ? (
                    <>
                      <Loader2 className="size-5 animate-spin" aria-hidden /> Placing order…
                    </>
                  ) : (
                    <>
                      <Lock className="size-[18px]" aria-hidden /> Place order · {rupees(summary.total)}
                    </>
                  )}
                </motion.button>
              </div>
            </aside>
          </form>
        )}
      </section>
    </>
  );
}

/* ---------------------------------------------------------------- */

const field = (err: boolean) =>
  `block min-h-12 w-full rounded-xl border bg-white px-4 text-base text-ink outline-none transition-[border-color,box-shadow] placeholder:text-muted/60 focus:border-forest-600 focus:ring-4 focus:ring-forest-600/12 ${
    err ? "border-[#b3261e] ring-4 ring-[#b3261e]/10" : "border-forest-600/20"
  }`;

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
      <label htmlFor={id} className="mb-1.5 block text-sm font-bold text-ink">
        {LABELS[k]}{" "}
        {optional ? (
          <span className="font-normal text-muted">(optional)</span>
        ) : (
          <span className="text-[#b3261e]" aria-hidden>*</span>
        )}
      </label>
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
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-muted">{hint}</p>
      )}
      {err && <Err id={`${id}-err`}>{err}</Err>}
    </div>
  );
}

function Card({ title, n, optional, children }: { title: string; n: number; optional?: boolean; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl bg-white p-5 ring-1 ring-forest-600/10 md:p-7">
      <h2 className="mb-5 flex items-center gap-3 font-serif text-[1.25rem] font-bold text-forest-700">
        <span className="grid size-8 place-items-center rounded-full bg-forest-600 font-sans text-sm text-white">{n}</span>
        {title}
        {optional && <span className="font-sans text-sm font-normal text-muted">(optional)</span>}
      </h2>
      {children}
    </section>
  );
}

function Steps({ done = false }: { done?: boolean }) {
  const steps = ["Cart", "Details", "Confirmation"];
  const at = done ? 2 : 1;
  return (
    <ol className="flex items-center gap-2 text-sm font-semibold" aria-label="Checkout progress">
      {steps.map((s, i) => (
        <li key={s} className="flex items-center gap-2" aria-current={i === at ? "step" : undefined}>
          {i > 0 && <span aria-hidden className={`h-px w-5 sm:w-8 ${i <= at ? "bg-forest-600" : "bg-forest-600/25"}`} />}
          <span
            className={`grid size-7 place-items-center rounded-full text-xs font-bold ${
              i < at ? "bg-forest-600 text-white" : i === at ? "bg-gold-soft text-forest-950" : "bg-forest-600/10 text-muted"
            }`}
          >
            {i < at ? <Check className="size-3.5" aria-hidden /> : i + 1}
          </span>
          <span className={i === at ? "text-forest-700" : "text-muted max-sm:sr-only"}>{s}</span>
        </li>
      ))}
    </ol>
  );
}

function Confirmation({ order }: { order: PlacedOrder }) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => heading.current?.focus(), []);
  const b = order.billing;
  return (
    <>
      <PageIntro title="Order received" ornament={false} compact>
        <Steps done />
      </PageIntro>
      <section className="mx-auto max-w-[920px] px-5 py-10 md:px-8 md:py-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden rounded-3xl bg-white ring-1 ring-forest-600/10"
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
            <h2 ref={heading} tabIndex={-1} className="mt-5 font-serif text-[1.9rem] font-bold outline-none">
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
              <h3 className="font-serif text-lg font-bold text-forest-700">Order details</h3>
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
              <h3 className="font-serif text-lg font-bold text-forest-700">Delivering to</h3>
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
          <Link href="/shop" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-forest-600 px-7 font-bold text-white transition-colors hover:bg-forest-700">
            Continue shopping <span aria-hidden>→</span>
          </Link>
        </div>
      </section>
    </>
  );
}
