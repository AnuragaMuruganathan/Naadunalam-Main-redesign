#!/usr/bin/env node
/**
 * Image pipeline: originals  ->  public/images (sized, compressed WebP).
 *
 * The site runs with `images.unoptimized: true`, so nothing is resized at
 * request time: every file in public/images is served exactly as written here.
 * Each output is therefore sized for the largest box it is ever drawn in
 * (at 2x density), encoded once, and deduplicated.
 *
 * Sources (both git- and vercel-ignored, they never ship):
 *   site asset/                 lossless PNG masters for the page artwork
 *   assets/originals/images/    snapshot of the product/category photos as
 *                               delivered, plus the two logo PNGs
 *
 * Usage:
 *   npm run images              regenerate public/images from the sources
 *   npm run images -- --init    first run only: snapshot public/images into
 *                               assets/originals/images, then regenerate
 *
 * The script always reads from the sources, never from its own output, so
 * running it again does not stack compression. It refuses to delete files in
 * public/images that it did not produce; add new images to the sources.
 */
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const ROOT = path.resolve(import.meta.dirname, "..");
const SITE = path.join(ROOT, "site asset");
const ORIG = path.join(ROOT, "assets", "originals", "images");
const OUT = path.join(ROOT, "public", "images");
const SRC = path.join(ROOT, "src");

/** Page artwork: lossless master -> served file. Widths match the largest render. */
const SCENES = [
  // Full-bleed hero, LCP. Mobile crops a tall slice, so it needs the full width there too.
  { from: "83ea6a70-0294-44a4-8ab5-a7249496feaf.png", to: "hero-family-home.webp", width: 1983, quality: 76 },
  { from: "Ivory Garden Arch in Sunlit Forest.png", to: "generations-arch.webp", width: 1672, quality: 76 },
  // Transparent cut-out drawn inside the SVG arch.
  { from: "Smiling Tamil Family Portrait in Traditional Attire.png", to: "generations-family.webp", width: 1974, quality: 78 },
  // xl-only, mostly under a gradient: fills the column height, so keep the height.
  { from: "Golden Sunset in Tamil Nadu Village.png", to: "footer-village.webp", width: 1774, quality: 72 },
  // Shop page banner: full-bleed, at most ~250 CSS px tall. Phones get the right-hand
  // (kitchen) part only, sized for a ~240 px tall band at 2x.
  { from: "Shop Banner Village Kitchen.png", to: "shop-banner.webp", width: 2172, quality: 72 },
  { from: "Shop Banner Village Kitchen.png", to: "shop-banner-m.webp", extract: { left: 700, top: 0, width: 1472, height: 724 }, height: 480, quality: 70 },
  // Home "Shop by Category" cards, at most 470 CSS px wide.
  { from: "Golden Millet in Rustic Clay Bowl.png", to: "cat-millets.webp", width: 1000, quality: 76 },
  { from: "Rustic Grain and Golden Oil Still Life.png", to: "cat-oils.webp", width: 1000, quality: 76 },
  { from: "Traditional Jaggery Fudge Pyramid.png", to: "cat-sweets.webp", width: 1000, quality: 76 },
  { from: "Rustic Herbal Still Life with Tulsi and Turmeric-2.png", to: "cat-herbal.webp", width: 1000, quality: 76 },
  { from: "Creamy Botanical Wellness Still Life.png", to: "cat-wellness.webp", width: 1000, quality: 76 },
  { from: "Rustic Kitchen Spice Still Life.png", to: "cat-kitchen.webp", width: 1000, quality: 76 },
  // Panchabhootham arch cards: at most ~300 CSS px wide once scaled to cover.
  { from: "Dewy Green Seedling in Rich Soil.png", to: "element-earth.webp", width: 720, quality: 76 },
  { from: "Mossy Multi-Tier Waterfall Stream.png", to: "element-water.webp", width: 720, quality: 76 },
  { from: "Golden Archway Tropical Sunset-2.png", to: "element-fire.webp", width: 720, quality: 76 },
  { from: "Golden Misty Meadow at Sunrise-1.png", to: "element-air.webp", width: 720, quality: 76 },
  { from: "Cosmic Milky Way Over Misty Mountains.png", to: "element-space.webp", width: 720, quality: 76 },
];

const PRODUCT_THUMB = { width: 600, quality: 78 }; // product cards (<=300 CSS px) and cart/wishlist minis
const PRODUCT_FULL = { width: 1024, quality: 78 }; // product page gallery (<=640 CSS px)
const CATEGORY_THUMB = { size: 144, quality: 80 }; // shop filters and mega-menu chips (<=44 CSS px)
const KEEP_IF_SAVING_UNDER = 0.1; // same-size WebP re-encodes must save 10%, else copy the original bytes

/* ------------------------------------------------------------------ helpers */

const rel = (p) => path.relative(ROOT, p).split(path.sep).join("/");
const kb = (n) => `${(n / 1024).toFixed(0)} KB`;
const hash = (buf) => crypto.createHash("sha1").update(buf).digest("hex");
const walk = (dir) =>
  fs.existsSync(dir)
    ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
        e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)],
      )
    : [];
const isImage = (f) => /\.(png|jpe?g|webp|avif)$/i.test(f);
const stem = (f) => path.basename(f).replace(/\.[^.]+$/, "");

/** Planned outputs: Map<outPath, () => Promise<Buffer>> */
const plan = new Map();
const notes = [];
let bytesIn = 0;

function add(outRel, srcPath, build) {
  const out = path.join(OUT, outRel);
  if (plan.has(out)) throw new Error(`Two sources map to ${rel(out)}`);
  plan.set(out, { src: srcPath, build });
}

async function webp(srcPath, { width, height, fit = "inside", quality, alphaQuality = 90, extract }) {
  const input = fs.readFileSync(srcPath);
  bytesIn += input.length;
  const meta = await sharp(input).metadata();
  const resized = Boolean(extract) || (width && meta.width > width) || (height && meta.height > height);
  let img = sharp(input).rotate();
  if (extract) img = sharp(await img.extract(extract).toBuffer());
  const out = await img
    .resize({ width, height, fit, withoutEnlargement: true })
    .webp({ quality, alphaQuality, effort: 6, smartSubsample: true })
    .toBuffer();
  // Re-encoding an already-lossy WebP at the same size costs quality; only do it when it pays.
  if (!resized && meta.format === "webp" && out.length > input.length * (1 - KEEP_IF_SAVING_UNDER)) return input;
  return out;
}

/* ---------------------------------------------------------------- the plan */

function planScenes() {
  for (const s of SCENES) {
    const master = path.join(SITE, s.from);
    if (fs.existsSync(master)) add(s.to, master, () => webp(master, s));
    else {
      const fallback = path.join(ORIG, s.to);
      if (!fs.existsSync(fallback)) throw new Error(`No master or original for ${s.to}`);
      notes.push(`master missing for ${s.to}, re-using the delivered copy`);
      add(s.to, fallback, () => webp(fallback, s));
    }
  }
}

function planLogos() {
  const mark = path.join(ORIG, "logo-mark.png");
  add("logo-mark.webp", mark, () => webp(mark, { width: 280, height: 280, quality: 88, alphaQuality: 100 }));

  const icon = path.join(ORIG, "logo.png");
  add("favicon.png", icon, async () => {
    bytesIn += fs.statSync(icon).size;
    return sharp(icon).resize(192, 192).png({ palette: true, quality: 90, effort: 10 }).toBuffer();
  });
}

function planShop() {
  const thumbsDir = path.join(ORIG, "shop", "products");
  const fullDir = path.join(thumbsDir, "full");
  const fullByStem = new Map(walk(fullDir).filter(isImage).map((f) => [stem(f), f]));
  const seen = new Map(); // content hash -> output rel path (dedupe identical sources)

  for (const f of fs.readdirSync(thumbsDir).map((n) => path.join(thumbsDir, n))) {
    if (!fs.statSync(f).isFile() || !isImage(f)) continue;
    const outRel = `shop/products/${stem(f)}.webp`;
    // Prefer the larger gallery photo as the source for the card thumbnail.
    const big = fullByStem.get(stem(f).replace(/-600x600$/, ""));
    const source = big ?? f;
    seen.set(hash(fs.readFileSync(f)), outRel);
    add(outRel, source, () => webp(source, PRODUCT_THUMB));
  }

  for (const f of [...fullByStem.values()].sort()) {
    const h = hash(fs.readFileSync(f));
    const outRel = `shop/products/full/${stem(f)}.webp`;
    if (seen.has(h)) {
      notes.push(`duplicate: ${rel(f)} is identical to the source of ${seen.get(h)}; not written`);
      continue;
    }
    seen.set(h, outRel);
    add(outRel, f, () => webp(f, PRODUCT_FULL));
  }

  for (const f of walk(path.join(ORIG, "shop", "categories")).filter(isImage)) {
    const outRel = `shop/categories/${stem(f)}.webp`;
    const { size, quality } = CATEGORY_THUMB;
    add(outRel, f, () => webp(f, { width: size, height: size, fit: "cover", quality }));
  }
}

/* --------------------------------------------------------------------- run */

async function main() {
  if (!fs.existsSync(ORIG)) {
    if (!process.argv.includes("--init")) {
      console.error(
        `Missing ${rel(ORIG)}.\nOn the first run use \`npm run images -- --init\` to snapshot public/images as the originals.\n` +
          "Without the originals, re-running would compress already-compressed files.",
      );
      process.exit(1);
    }
    fs.cpSync(OUT, ORIG, { recursive: true });
    console.log(`Snapshot: ${rel(OUT)} -> ${rel(ORIG)}`);
  }

  planScenes();
  planLogos();
  planShop();

  // Never silently delete something we do not know how to rebuild.
  const strays = walk(OUT).filter((f) => !plan.has(f) && !fs.existsSync(path.join(ORIG, path.relative(OUT, f))));
  if (strays.length) {
    console.error("These files in public/images have no source; move them into assets/originals/images first:");
    for (const f of strays) console.error(`  ${rel(f)}`);
    process.exit(1);
  }

  const built = new Map();
  const jobs = [...plan.entries()];
  const CONCURRENCY = 4;
  for (let i = 0; i < jobs.length; i += CONCURRENCY) {
    await Promise.all(
      jobs.slice(i, i + CONCURRENCY).map(async ([out, job]) => built.set(out, await job.build())),
    );
  }

  fs.rmSync(OUT, { recursive: true, force: true });
  let bytesOut = 0;
  for (const [out, buf] of built) {
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, buf);
    bytesOut += buf.length;
  }

  for (const n of notes) console.log(`note: ${n}`);
  console.log(`\n${built.size} files written to ${rel(OUT)}: ${kb(bytesOut)} (sources read: ${kb(bytesIn)})`);

  // Every /images/... path in the source must exist; flag outputs nothing uses.
  const refs = new Set(
    walk(SRC)
      .filter((f) => /\.(tsx?|css|mdx?)$/.test(f))
      .flatMap((f) => fs.readFileSync(f, "utf8").match(/\/images\/[\w./-]+\.(?:webp|png|jpe?g|avif|svg)/g) ?? []),
  );
  const missing = [...refs].filter((r) => !fs.existsSync(path.join(ROOT, "public", r)));
  const unused = [...built.keys()].map((f) => "/" + path.relative(path.join(ROOT, "public"), f).split(path.sep).join("/")).filter((r) => !refs.has(r));
  for (const r of unused) console.warn(`unused: ${r}`);
  if (missing.length) {
    console.error(`\n${missing.length} referenced image(s) missing from public/:`);
    for (const r of missing) console.error(`  ${r}`);
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
