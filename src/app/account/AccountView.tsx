"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertCircle,
  ArrowRight,
  ExternalLink,
  Eye,
  EyeOff,
  Globe,
  Lock,
  LogIn,
  Mail,
  Phone,
  Store,
  User,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import PageStage from "@/components/shop/PageStage";
import { Leaf } from "@/components/Leaf";

export type Role = "customer" | "vendor";

/** The original Naadu Nalam store, where accounts actually live for now. */
const ORIGIN = "https://naadunalam.fastfilings.in";
const ORIGIN_ACCOUNT: Record<Role, string> = {
  customer: `${ORIGIN}/my-account/`,
  vendor: `${ORIGIN}/vendor-login/`,
};

const EASE = [0.22, 1, 0.36, 1] as const;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

/**
 * Account page: Customer / Vendor switch, then Login and Register side by
 * side. Fields follow the original store's WooCommerce + Dokan forms.
 *
 * This site has no account backend yet, so a valid submit says so plainly and
 * hands over to the matching page on the original store; nothing pretends to
 * sign in or create an account.
 */
export default function AccountView({ initialRole }: { initialRole: Role }) {
  const [role, setRole] = useState<Role>(initialRole);

  const pick = (r: Role) => {
    setRole(r);
    const url = r === "vendor" ? "/account?role=vendor" : "/account";
    window.history.replaceState(window.history.state, "", url);
  };

  return (
    <PageStage id="account-title" title="My Account" compact fill aside={<RoleSwitch role={role} onPick={pick} />}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={role}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }}
          transition={{ duration: 0.4, ease: EASE }}
          className="grid grid-cols-[minmax(0,1fr)] items-start gap-5 lg:grid-cols-2 lg:gap-6"
        >
          {role === "customer" ? (
            <>
              <LoginCard role="customer" />
              <CustomerRegister onVendor={() => pick("vendor")} />
            </>
          ) : (
            <>
              <LoginCard role="vendor" />
              <VendorRegister />
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </PageStage>
  );
}

/* ---------------------------------------------------------------- Role switch */

function RoleSwitch({ role, onPick }: { role: Role; onPick: (r: Role) => void }) {
  const opts: { r: Role; label: string; icon: LucideIcon }[] = [
    { r: "customer", label: "Customer", icon: User },
    { r: "vendor", label: "Vendor", icon: Store },
  ];
  return (
    <div
      role="tablist"
      aria-label="Account type"
      className="relative inline-flex rounded-full bg-white/90 p-1.5 shadow-[0_14px_30px_-20px_rgba(60,40,10,0.5)] ring-1 ring-forest-600/10 backdrop-blur-sm"
    >
      {opts.map(({ r, label, icon: Icon }) => {
        const on = role === r;
        return (
          <button
            key={r}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onPick(r)}
            className={`relative inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full px-5 text-[0.95rem] font-semibold transition-colors sm:px-6 ${
              on ? "text-white" : "text-forest-800 hover:text-forest-600"
            }`}
          >
            {on && (
              <motion.span
                layoutId="role-pill"
                className="absolute inset-0 rounded-full bg-forest-700 shadow-[0_10px_20px_-12px_rgba(10,57,25,0.8)]"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            <Icon className="relative size-[18px]" strokeWidth={1.9} aria-hidden />
            <span className="relative">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ---------------------------------------------------------------- Cards */

function Card({
  icon: Icon,
  title,
  sub,
  children,
  decor,
}: {
  icon: LucideIcon;
  title: string;
  sub: string;
  children: React.ReactNode;
  decor?: boolean;
}) {
  return (
    <section className="relative overflow-hidden rounded-[1.6rem] bg-white/92 p-5 shadow-[0_20px_44px_-30px_rgba(60,40,10,0.5)] ring-1 ring-forest-600/8 md:px-7 md:py-6">
      {decor && (
        <span aria-hidden className="pointer-events-none absolute -right-2 -top-2 opacity-80 max-sm:hidden">
          <Leaf className="absolute right-6 top-6 h-[30px] w-[40px] -rotate-[28deg]" />
          <Leaf className="absolute right-14 top-12 h-[22px] w-[30px] rotate-[150deg] opacity-70" />
        </span>
      )}
      <div className="relative flex items-start gap-3.5">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-leaf/12 text-forest-700">
          <Icon className="size-[22px]" strokeWidth={1.8} aria-hidden />
        </span>
        <div>
          <h2 className="text-[1.3rem] font-bold leading-tight text-forest-800">{title}</h2>
          <p className="mt-0.5 text-[0.92rem] text-muted">{sub}</p>
        </div>
      </div>
      <div className="relative mt-5">{children}</div>
    </section>
  );
}

/** Shown after a valid submit: accounts live on the original store for now. */
function Handover({ role, action, onBack }: { role: Role; action: "sign in" | "register"; onBack: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE }}
      role="status"
      className="rounded-2xl bg-[#f1f7e8] p-5 ring-1 ring-leaf/25"
    >
      <p className="font-bold text-forest-800">Almost there</p>
      <p className="mt-1.5 text-[0.92rem] leading-relaxed text-ink/80">
        Accounts aren&rsquo;t connected on this site yet. To {action}
        {role === "vendor" ? " as a vendor" : ""}, continue on the Naadu Nalam store.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <a
          href={ORIGIN_ACCOUNT[role]}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-forest-700 px-6 font-semibold text-white transition-colors hover:bg-forest-800"
        >
          Continue on the store
          <ExternalLink className="size-4" aria-hidden />
        </a>
        <button type="button" onClick={onBack} className="min-h-11 cursor-pointer px-2 font-semibold text-forest-700 underline decoration-gold-soft underline-offset-4 hover:text-forest-500">
          Back
        </button>
      </div>
    </motion.div>
  );
}

/* ---------------------------------------------------------------- Login */

function LoginCard({ role }: { role: Role }) {
  const [v, setV] = useState({ user: "", pass: "", remember: true });
  const [err, setErr] = useState<{ user?: string; pass?: string }>({});
  const [done, setDone] = useState(false);
  const vendor = role === "vendor";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = {
      user: v.user.trim() ? undefined : "Enter your username or email address.",
      pass: v.pass ? undefined : "Enter your password.",
    };
    setErr(next);
    if (!next.user && !next.pass) setDone(true);
  };

  return (
    <Card
      icon={LogIn}
      title={vendor ? "Vendor login" : "Welcome back"}
      sub={vendor ? "Manage your store, products and orders." : "Sign in to track orders and check out faster."}
    >
      {done ? (
        <Handover role={role} action="sign in" onBack={() => setDone(false)} />
      ) : (
        <form onSubmit={submit} noValidate className="space-y-3.5">
          <Field
            label="Username or email address"
            icon={User}
            value={v.user}
            onChange={(user) => setV({ ...v, user })}
            error={err.user}
            autoComplete="username"
            placeholder="you@example.com"
          />
          <PasswordField value={v.pass} onChange={(pass) => setV({ ...v, pass })} error={err.pass} />

          <div className="flex flex-wrap items-center justify-between gap-3 text-[0.9rem]">
            <label className="inline-flex min-h-11 cursor-pointer items-center gap-2.5 text-ink">
              <input
                type="checkbox"
                checked={v.remember}
                onChange={(e) => setV({ ...v, remember: e.target.checked })}
                className="size-[18px] cursor-pointer accent-forest-700"
              />
              Remember me
            </label>
            <a href={`${ORIGIN}/my-account/lost-password/`} className="font-semibold text-forest-700 underline decoration-gold-soft underline-offset-4 hover:text-forest-500">
              Forgot password?
            </a>
          </div>

          <SubmitButton icon={LogIn}>{vendor ? "Log in to your store" : "Log in"}</SubmitButton>
        </form>
      )}
    </Card>
  );
}

/* ---------------------------------------------------------------- Register */

function CustomerRegister({ onVendor }: { onVendor: () => void }) {
  const [email, setEmail] = useState("");
  const [err, setErr] = useState<string>();
  const [done, setDone] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = !email.trim() ? "Enter your email address." : !EMAIL.test(email.trim()) ? "Enter a valid email address." : undefined;
    setErr(msg);
    if (!msg) setDone(true);
  };

  return (
    <Card icon={UserPlus} title="Create an account" sub="Save your details, follow your orders and keep a wishlist." decor>
      {done ? (
        <Handover role="customer" action="register" onBack={() => setDone(false)} />
      ) : (
        <form onSubmit={submit} noValidate className="space-y-3.5">
          <Field
            label="Email address"
            icon={Mail}
            type="email"
            inputMode="email"
            value={email}
            onChange={setEmail}
            error={err}
            autoComplete="email"
            placeholder="you@example.com"
          />
          <p className="rounded-xl bg-cream px-4 py-3 text-[0.86rem] leading-relaxed text-ink/80">
            A link to set a new password will be sent to your email address.
          </p>
          <PrivacyNote />
          <SubmitButton icon={UserPlus}>Register</SubmitButton>
          <p className="text-center text-[0.9rem] text-muted">
            Selling on Naadu Nalam?{" "}
            <button type="button" onClick={onVendor} className="cursor-pointer font-semibold text-forest-700 underline decoration-gold-soft underline-offset-4 hover:text-forest-500">
              Register as a vendor
            </button>
          </p>
        </form>
      )}
    </Card>
  );
}

type VendorForm = { fname: string; lname: string; email: string; phone: string; shop: string; url: string };
type VendorErr = Partial<Record<keyof VendorForm, string>>;

function VendorRegister() {
  const [v, setV] = useState<VendorForm>({ fname: "", lname: "", email: "", phone: "", shop: "", url: "" });
  const [urlTouched, setUrlTouched] = useState(false);
  const [err, setErr] = useState<VendorErr>({});
  const [done, setDone] = useState(false);
  const set = (k: keyof VendorForm) => (val: string) =>
    setV((prev) => ({ ...prev, [k]: val, ...(k === "shop" && !urlTouched ? { url: slugify(val) } : {}) }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const phone = v.phone.replace(/\D/g, "");
    const next: VendorErr = {
      fname: v.fname.trim() ? undefined : "Enter your first name.",
      lname: v.lname.trim() ? undefined : "Enter your last name.",
      email: !v.email.trim() ? "Enter your email address." : !EMAIL.test(v.email.trim()) ? "Enter a valid email address." : undefined,
      phone: !phone ? "Enter your phone number." : phone.length < 10 ? "Enter a 10-digit phone number." : undefined,
      shop: v.shop.trim() ? undefined : "Enter a name for your shop.",
      url: v.url ? undefined : "Choose a shop URL.",
    };
    setErr(next);
    if (Object.values(next).every((m) => !m)) setDone(true);
  };

  return (
    <Card icon={Store} title="Become a vendor" sub="Open your own store page and sell to families across Tamil Nadu." decor>
      {done ? (
        <Handover role="vendor" action="register" onBack={() => setDone(false)} />
      ) : (
        <form onSubmit={submit} noValidate className="space-y-3.5">
          <div className="grid gap-x-4 gap-y-3 sm:grid-cols-2">
            <Field label="First name" icon={User} value={v.fname} onChange={set("fname")} error={err.fname} autoComplete="given-name" />
            <Field label="Last name" icon={User} value={v.lname} onChange={set("lname")} error={err.lname} autoComplete="family-name" />
            <Field label="Email address" icon={Mail} type="email" inputMode="email" value={v.email} onChange={set("email")} error={err.email} autoComplete="email" />
            <Field label="Phone number" icon={Phone} type="tel" inputMode="tel" value={v.phone} onChange={set("phone")} error={err.phone} autoComplete="tel" placeholder="10-digit mobile" />
            <Field label="Shop name" icon={Store} value={v.shop} onChange={set("shop")} error={err.shop} autoComplete="organization" placeholder="e.g. Thaayanbu" />
            <Field
              label="Shop URL"
              icon={Globe}
              value={v.url}
              onChange={(val) => {
                setUrlTouched(true);
                setV((prev) => ({ ...prev, url: slugify(val) }));
              }}
              error={err.url}
              prefix="/store/"
              placeholder="your-shop"
            />
          </div>
          <PrivacyNote />
          <SubmitButton icon={Store}>Register as a vendor</SubmitButton>
          <p className="text-center text-[0.9rem] text-muted">
            See who sells with us:{" "}
            <Link href="/store" className="font-semibold text-forest-700 underline decoration-gold-soft underline-offset-4 hover:text-forest-500">
              Our vendors
            </Link>
          </p>
        </form>
      )}
    </Card>
  );
}

/* ---------------------------------------------------------------- Form pieces */

const inputCls = (err: boolean) =>
  `block min-h-11 w-full rounded-xl border bg-white px-4 text-[0.98rem] text-ink outline-none! transition-[border-color,box-shadow] placeholder:text-muted/70 focus:border-forest-600 focus:ring-4 focus:ring-forest-600/12 ${
    err ? "border-[#b3261e] ring-4 ring-[#b3261e]/10" : "border-forest-600/20"
  }`;

function Label({ htmlFor, icon: Icon, children }: { htmlFor: string; icon: LucideIcon; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-1 flex items-center gap-2 text-[0.9rem] font-semibold text-ink">
      <Icon className="size-4 shrink-0 text-forest-700" strokeWidth={1.9} aria-hidden />
      <span>
        {children} <span className="text-[#b3261e]" aria-hidden>*</span>
      </span>
    </label>
  );
}

function ErrorText({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <p id={id} className="mt-1.5 flex items-center gap-1.5 text-sm font-semibold text-[#b3261e]">
      <AlertCircle className="size-4 shrink-0" aria-hidden />
      {children}
    </p>
  );
}

function Field({
  label,
  icon,
  value,
  onChange,
  error,
  prefix,
  type = "text",
  ...rest
}: {
  label: string;
  icon: LucideIcon;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  prefix?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "prefix">) {
  const id = useId();
  const input = (
    <input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-err` : undefined}
      className={prefix ? "h-11 min-w-0 flex-1 bg-transparent pr-4 text-[0.98rem] text-ink outline-none! placeholder:text-muted/70" : inputCls(!!error)}
      {...rest}
    />
  );
  return (
    <div>
      <Label htmlFor={id} icon={icon}>{label}</Label>
      {prefix ? (
        <div
          className={`flex items-center overflow-hidden rounded-xl border bg-white transition-[border-color,box-shadow] focus-within:border-forest-600 focus-within:ring-4 focus-within:ring-forest-600/12 ${
            error ? "border-[#b3261e] ring-4 ring-[#b3261e]/10" : "border-forest-600/20"
          }`}
        >
          <span className="flex h-11 items-center border-r border-forest-600/12 bg-cream px-3 text-[0.9rem] text-muted">{prefix}</span>
          <span className="w-3" />
          {input}
        </div>
      ) : (
        input
      )}
      {error && <ErrorText id={`${id}-err`}>{error}</ErrorText>}
    </div>
  );
}

function PasswordField({ value, onChange, error }: { value: string; onChange: (v: string) => void; error?: string }) {
  const id = useId();
  const [show, setShow] = useState(false);
  return (
    <div>
      <Label htmlFor={id} icon={Lock}>Password</Label>
      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          autoComplete="current-password"
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-err` : undefined}
          className={`${inputCls(!!error)} pr-12`}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          aria-pressed={show}
          className="absolute right-1 top-1/2 grid size-10 -translate-y-1/2 cursor-pointer place-items-center rounded-full text-forest-700/70 transition-colors hover:bg-cream hover:text-forest-800"
        >
          {show ? <EyeOff className="size-[18px]" aria-hidden /> : <Eye className="size-[18px]" aria-hidden />}
        </button>
      </div>
      {error && <ErrorText id={`${id}-err`}>{error}</ErrorText>}
    </div>
  );
}

function SubmitButton({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <motion.button
      type="submit"
      whileTap={{ scale: 0.98 }}
      className="group inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2.5 rounded-full bg-forest-700 px-6 text-[1.02rem] font-bold text-white shadow-[0_14px_26px_-14px_rgba(10,57,25,0.8)] transition-colors hover:bg-forest-800"
    >
      <Icon className="size-[19px]" aria-hidden />
      {children}
      <ArrowRight className="size-[18px] transition-transform group-hover:translate-x-0.5" aria-hidden />
    </motion.button>
  );
}

function PrivacyNote() {
  return (
    <p className="text-[0.78rem] leading-relaxed text-muted">
      Your personal data will be used to support your experience throughout this website, to manage access to your
      account, and for other purposes described in our privacy policy.
    </p>
  );
}
