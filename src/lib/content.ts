/**
 * Primary menu. `section` is the homepage anchor an item tracks while you
 * scroll the homepage; items without one are their own pages.
 */
export const NAV = [
  { label: "Home", href: "/", section: "#top" },
  { label: "Shop", href: "/shop", section: "#shop", dropdown: true },
  { label: "Wishlist", href: "/wishlist" },
  { label: "About Us", href: "/#about", section: "#about" },
] as const;

/**
 * "Others" menu, as on the original site. These pages live on the original
 * store (naadunalam.fastfilings.in) and are not part of this site yet.
 */
const ORIGIN = "https://naadunalam.fastfilings.in";
export type OtherLink = { label: string; href: string; children?: OtherLink[] };
export const OTHERS: OtherLink[] = [
  {
    label: "Collaborators",
    href: `${ORIGIN}/collaborators/`,
    children: [
      { label: "TST Music & Dance Academy", href: `${ORIGIN}/collaborators/tst-music-dance-academy/` },
      { label: "TST Event Mgt", href: `${ORIGIN}/collaborators/tst-event-mgt/` },
      { label: "Ignite Our Tharas Kids Kondaatam", href: `${ORIGIN}/collaborators/ignite-our-tharas-kids-kondaatam/` },
      { label: "Queen Bee’s Math Tutoring", href: `${ORIGIN}/collaborators/queen-bees-math-tutoring/` },
      { label: "Bharathanaatiyam", href: `${ORIGIN}/collaborators/bharathanaatiyam/` },
    ],
  },
  { label: "Events", href: `${ORIGIN}/events/` },
  { label: "Calendar", href: `${ORIGIN}/calendar/` },
  { label: "Research Articles", href: `${ORIGIN}/research-articles/` },
  { label: "Blog", href: `${ORIGIN}/blog/` },
];

/** Store contact details, from the original site. */
export const STORE = {
  phone: "+91 90921 14630",
  tel: "+919092114630",
  delivery: "Flat ₹50 delivery across Tamil Nadu",
} as const;

export const CATEGORIES = [
  { name: "Millets & Grains", ta: "சிறுதானியங்கள்", img: "/images/cat-millets.webp", alt: "Golden millet in a rustic clay bowl", slug: "siruthaniyam" },
  { name: "Natural Oils", ta: "இயற்கை எண்ணெய்", img: "/images/cat-oils.webp", alt: "Cold-pressed golden oil beside a bowl of grain", slug: "oil-vinegers" },
  { name: "Traditional Sweets", ta: "பாரம்பரிய இனிப்பு", img: "/images/cat-sweets.webp", alt: "Stacked squares of jaggery fudge on a wooden plate", slug: "natural-sweeteners" },
  { name: "Herbal Products", ta: "மூலிகைகள்", img: "/images/cat-herbal.webp", alt: "Tulsi, turmeric and fresh herbs in a wooden bowl", slug: "herbal-wellness" },
  { name: "Wellness & Care", ta: "நல்வாழ்வு", img: "/images/cat-wellness.webp", alt: "Creamy botanical balm with jasmine flowers", slug: "personal-care" },
  { name: "Kitchen Essentials", ta: "சமையல் அவசியம்", img: "/images/cat-kitchen.webp", alt: "Jute sack of spices with garlic, ginger and chillies", slug: "masala-podi" },
] as const;

/**
 * The five elements. Earth, water and air are cut-outs that sit on a soft
 * wash; fire and space are full scenes that fill their arch window.
 */
export const ELEMENTS = [
  { ta: "நிலம்", en: "Earth", img: "/images/element-earth.webp", icon: "earth", wash: "from-[#f3f0dc] to-[#e4e2c2]", fit: "contain", desc: "Living soil that roots every seed we sow." },
  { ta: "நீர்", en: "Water", img: "/images/element-water.webp", icon: "water", wash: "from-[#eef3e6] to-[#d6e6d6]", fit: "contain", desc: "Clear water that carries life to each root." },
  { ta: "அக்கினி", en: "Fire", img: "/images/element-fire.webp", icon: "fire", wash: "from-[#f4a63e] to-[#9a4a12]", fit: "cover", desc: "Warm sun that ripens grain the slow way." },
  { ta: "காற்று", en: "Air", img: "/images/element-air.webp", icon: "air", wash: "from-[#e7eef0] via-[#f1eedf] to-[#f1dfba]", fit: "contain", desc: "Open breeze that keeps the fields breathing." },
  { ta: "ஆகாசம்", en: "Space", img: "/images/element-space.webp", icon: "space", wash: "from-[#1d2a55] to-[#16263a]", fit: "cover", desc: "The wide sky that holds the seasons in balance." },
] as const;

/** Seven generations — from self (1st, right) back to the ancestor (7th, left). */
export const GENERATIONS = [
  { n: 1, ord: "1st", ta: ["நான்"], en: "Self" },
  { n: 2, ord: "2nd", ta: ["தந்தை", "தாய்"], en: "Parents" },
  { n: 3, ord: "3rd", ta: ["பாட்டன்", "பாட்டி"], en: "Grandparents" },
  { n: 4, ord: "4th", ta: ["பூட்டன்", "பூட்டி"], en: "Great-grandparents" },
  { n: 5, ord: "5th", ta: ["ஓட்டன்", "ஓட்டி"], en: "3× great" },
  { n: 6, ord: "6th", ta: ["சேயோன்", "சேயோள்"], en: "4× great" },
  { n: 7, ord: "7th", ta: ["பரன்", "பரை"], en: "Ancestors" },
] as const;

export const FOOTER_LINKS = {
  Explore: [
    ["Home", "/"],
    ["Panchabhootham", "/#panchabhootham"],
    ["7 Generations", "/#generations"],
    ["About Us", "/#about"],
  ],
  Shop: [
    ["All Products", "/shop"],
    ["Traditional Rice", "/shop?category=rice-grains"],
    ["Millets", "/shop?category=siruthaniyam"],
    ["Ghee & Oil", "/shop?category=oil-vinegers"],
    ["Health Mixes", "/shop?category=health-mixes"],
  ],
  Support: [
    ["Call Us", "tel:+919092114630"],
    ["Wishlist", "/wishlist"],
    ["Your Cart", "/cart"],
    ["Checkout", "/checkout"],
  ],
} as const;
