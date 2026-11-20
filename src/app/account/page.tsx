import type { Metadata } from "next";
import AccountView, { type Role } from "./AccountView";

export const metadata: Metadata = {
  title: "My Account",
  description: "Sign in or register as a Naadu Nalam customer or vendor.",
};

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const raw = (await searchParams).role;
  const role: Role = (Array.isArray(raw) ? raw[0] : raw) === "vendor" ? "vendor" : "customer";

  return (
    <main id="main" className="pt-[96px] md:pt-[104px]">
      {/* Remount when the URL's role changes so the view starts from it */}
      <AccountView key={role} initialRole={role} />
    </main>
  );
}
