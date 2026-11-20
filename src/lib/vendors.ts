/**
 * Vendors, from the original Naadu Nalam store's Dokan marketplace
 * (naadunalam.fastfilings.in/wp-json/dokan/v1/stores). Store slugs match the
 * original store URLs (/store/<slug>/). The original stores have no logo,
 * banner, address, bio or ratings set, so none are invented here.
 */

export type Vendor = {
  slug: string;
  name: string;
  ta: string;
  phone: string;
  tel: string;
  /** Date the store opened on the original site (YYYY-MM-DD) */
  since: string;
  /** Store logo; vendors without one get a monogram */
  logo?: string;
};

export const VENDORS: Vendor[] = [
  { slug: "naadunalam", name: "Naadu Nalam", ta: "நாடு நலம்", phone: "+91 81234 56456", tel: "+918123456456", since: "2026-09-22", logo: "/images/logo-mark.webp" },
  { slug: "thaayanbu", name: "Thaayanbu", ta: "தாயன்பு", phone: "+91 91764 82135", tel: "+919176482135", since: "2026-09-22" },
];

/** Product slug → vendor slug, for all 82 products. */
export const PRODUCT_VENDOR: Record<string, string> = {
  "aathur-kichadi-samba-aval": "naadunalam",
  "aathur-kichadi-samba-rice": "naadunalam",
  "arubathaam-kuruvai-aval": "naadunalam",
  "arubathaam-kuruvai-rice": "naadunalam",
  "bamboo-aval": "naadunalam",
  "barley-rice": "naadunalam",
  "barnyard-millet-kuthiraivali": "naadunalam",
  "black-kavuni-rice": "naadunalam",
  "cholam": "naadunalam",
  "cold-pressed-coconut-oil": "thaayanbu",
  "cold-pressed-sesame-oil": "thaayanbu",
  "country-sugar-nattu-sakkarai": "thaayanbu",
  "ellu": "thaayanbu",
  "foxtail-millet-thinai": "naadunalam",
  "groundnut-oil": "thaayanbu",
  "horse-gram-kollu": "thaayanbu",
  "idli-arisi": "naadunalam",
  "iluppai-poo-samba-aval": "naadunalam",
  "iluppai-poo-samba-rice": "naadunalam",
  "kaatuyanam-rice": "naadunalam",
  "kadalai-paruppu": "naadunalam",
  "kalanamak-aval": "naadunalam",
  "kalanamak-rice": "naadunalam",
  "kali-kanji-maavu": "thaayanbu",
  "kallundai-samba-aval": "naadunalam",
  "kallundai-samba-rice": "naadunalam",
  "kambu": "naadunalam",
  "kanjiyum-dosai-maavum": "thaayanbu",
  "karudan-samba-arisi": "naadunalam",
  "karudan-samba-aval": "naadunalam",
  "karunguruvai-aval": "naadunalam",
  "karunguruvai-rice": "naadunalam",
  "karuppu-kavuni-aval": "naadunalam",
  "karuppu-kondakadalai": "naadunalam",
  "karuppu-ulundhu": "naadunalam",
  "kattu-yanam-aval": "naadunalam",
  "kezhvaragu": "naadunalam",
  "kichadi-samba-aval": "naadunalam",
  "kichadi-samba-rice": "naadunalam",
  "kodo-millet-varagu": "naadunalam",
  "kollu-yennai-horse-gram-oil": "thaayanbu",
  "kudavaazhai-arisi": "naadunalam",
  "kudavaazhai-aval": "naadunalam",
  "kuliyal-podi": "thaayanbu",
  "kullakar-rice": "naadunalam",
  "kuzhakkan-kullakar-aval": "naadunalam",
  "kuzhambu-podi": "thaayanbu",
  "mappillai-samba": "naadunalam",
  "mappillai-samba-aval": "naadunalam",
  "milagai-podi": "thaayanbu",
  "moong-dal": "naadunalam",
  "moongil-arisi": "naadunalam",
  "nallamaattu-nei": "thaayanbu",
  "nilakadalai": "naadunalam",
  "oottachathu-paanam": "thaayanbu",
  "organic-turmeric-powder": "thaayanbu",
  "pachai-payaru": "naadunalam",
  "palm-jaggery-karupatti": "thaayanbu",
  "panangkarkandu": "thaayanbu",
  "panchakara-kudineer": "thaayanbu",
  "pengalukkaana-oottachathu-maavu": "thaayanbu",
  "ponni-arisi": "naadunalam",
  "poongar-aval": "naadunalam",
  "poongar-rice": "naadunalam",
  "protein-drink-mix": "thaayanbu",
  "rasam-podi": "thaayanbu",
  "ratha-sali-aval": "naadunalam",
  "ratha-sali-rice": "naadunalam",
  "samai-arisi": "naadunalam",
  "sambar-podi": "thaayanbu",
  "sarkkarai-noi-kkaana-kanji-dosai-maavu": "thaayanbu",
  "seekkai-podi": "thaayanbu",
  "siru-paruppu": "naadunalam",
  "thooyamalli-rice": "naadunalam",
  "thuya-malli-aval": "naadunalam",
  "toor-dal": "naadunalam",
  "tulsi-infused-honey": "thaayanbu",
  "udal-edai-kuraikkum-kanji-maavu": "thaayanbu",
  "udal-suththi-kudal-suththi-maavu": "thaayanbu",
  "urad-dal": "naadunalam",
  "urundai-vellam": "thaayanbu",
  "vellai-kondakadalai": "naadunalam"
};

const BY_SLUG = new Map(VENDORS.map((v) => [v.slug, v]));
export const vendorBySlug = (slug: string) => BY_SLUG.get(slug);
/** The vendor selling a product (every catalog product has one). */
export const vendorOf = (productSlug: string) => BY_SLUG.get(PRODUCT_VENDOR[productSlug] ?? "naadunalam")!;
