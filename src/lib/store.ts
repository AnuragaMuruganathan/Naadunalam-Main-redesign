"use client";

import { useSyncExternalStore } from "react";
import { PRODUCTS, type Product } from "./catalog";

/*
 * Cart and wishlist live in localStorage so they survive reloads and stay in
 * sync across tabs. The server (and the first client render) always sees an
 * empty, un-hydrated state, so markup never mismatches; components can read
 * `hydrated` to avoid flashing an empty cart before storage is read.
 */

export type CartLine = { id: number; qty: number };
type State = { cart: CartLine[]; wishlist: number[]; hydrated: boolean };

const CART_KEY = "nn-cart-v1";
const WISH_KEY = "nn-wishlist-v1";
const BY_ID = new Map(PRODUCTS.map((p) => [p.id, p]));

const SERVER_STATE: State = { cart: [], wishlist: [], hydrated: false };
let state: State = SERVER_STATE;
let loaded = false;
const listeners = new Set<() => void>();

export const getProduct = (id: number) => BY_ID.get(id);
export const maxQty = (p: Product) => Math.max(1, Math.min(p.stock ?? 99, 99));

function readJSON(key: string): unknown {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function sanitize(cartRaw: unknown, wishRaw: unknown): State {
  const cart: CartLine[] = [];
  if (Array.isArray(cartRaw)) {
    for (const l of cartRaw) {
      const p = BY_ID.get(Number(l?.id));
      const qty = Math.floor(Number(l?.qty));
      if (p && p.inStock && qty > 0 && !cart.some((c) => c.id === p.id)) cart.push({ id: p.id, qty: Math.min(qty, maxQty(p)) });
    }
  }
  const wishlist = Array.isArray(wishRaw) ? [...new Set(wishRaw.map(Number).filter((id) => BY_ID.has(id)))] : [];
  return { cart, wishlist, hydrated: true };
}

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  state = sanitize(readJSON(CART_KEY), readJSON(WISH_KEY));
}

function commit(next: Omit<State, "hydrated">) {
  state = { ...next, hydrated: true };
  try {
    window.localStorage.setItem(CART_KEY, JSON.stringify(state.cart));
    window.localStorage.setItem(WISH_KEY, JSON.stringify(state.wishlist));
  } catch {
    /* storage unavailable (private mode) — keep the in-memory state */
  }
  listeners.forEach((l) => l());
}

function onStorage(e: StorageEvent) {
  if (e.key !== CART_KEY && e.key !== WISH_KEY) return;
  state = sanitize(readJSON(CART_KEY), readJSON(WISH_KEY));
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  load();
  if (!listeners.size) window.addEventListener("storage", onStorage);
  listeners.add(l);
  return () => {
    listeners.delete(l);
    if (!listeners.size) window.removeEventListener("storage", onStorage);
  };
}

export function useShop() {
  return useSyncExternalStore(
    subscribe,
    () => (load(), state),
    () => SERVER_STATE
  );
}

/* ---------- Cart ---------- */

export function addToCart(id: number, qty = 1) {
  load();
  const p = BY_ID.get(id);
  if (!p || !p.inStock) return;
  const existing = state.cart.find((l) => l.id === id);
  const cart = existing
    ? state.cart.map((l) => (l.id === id ? { ...l, qty: Math.min(l.qty + qty, maxQty(p)) } : l))
    : [...state.cart, { id, qty: Math.min(qty, maxQty(p)) }];
  commit({ ...state, cart });
  notify({ kind: "cart", product: p });
}

/** Adds one of each product not already in the cart; returns how many were added. */
export function addManyToCart(ids: number[]) {
  load();
  const fresh = ids.filter((id) => {
    const p = BY_ID.get(id);
    return p && p.inStock && !state.cart.some((l) => l.id === id);
  });
  if (fresh.length) commit({ ...state, cart: [...state.cart, ...fresh.map((id) => ({ id, qty: 1 }))] });
  return fresh.length;
}

/** Puts back a snapshot (used by "Undo" after clearing). */
export function restore(snapshot: { cart?: CartLine[]; wishlist?: number[] }) {
  load();
  commit({ cart: snapshot.cart ?? state.cart, wishlist: snapshot.wishlist ?? state.wishlist });
}

export function setQty(id: number, qty: number) {
  load();
  const p = BY_ID.get(id);
  if (!p) return;
  if (qty <= 0) return removeFromCart(id);
  commit({ ...state, cart: state.cart.map((l) => (l.id === id ? { ...l, qty: Math.min(qty, maxQty(p)) } : l)) });
}

export function removeFromCart(id: number) {
  load();
  commit({ ...state, cart: state.cart.filter((l) => l.id !== id) });
}

export function clearCart() {
  load();
  commit({ ...state, cart: [] });
}

/* ---------- Wishlist ---------- */

export function toggleWishlist(id: number) {
  load();
  const p = BY_ID.get(id);
  if (!p) return;
  const has = state.wishlist.includes(id);
  // No toast: the filled heart (and the header count) is the confirmation.
  commit({ ...state, wishlist: has ? state.wishlist.filter((w) => w !== id) : [...state.wishlist, id] });
}

export function addManyToWishlist(ids: number[]) {
  load();
  commit({ ...state, wishlist: [...new Set([...state.wishlist, ...ids.filter((id) => BY_ID.has(id))])] });
}

export function clearWishlist() {
  load();
  commit({ ...state, wishlist: [] });
}

/* ---------- Totals ---------- */

/** Flat delivery charge per order, as on the original store. */
export const SHIPPING_FLAT = 50;

export function cartSummary(cart: CartLine[]) {
  const lines = cart
    .map((l) => ({ ...l, product: BY_ID.get(l.id)! }))
    .filter((l) => l.product);
  const items = lines.reduce((n, l) => n + l.qty, 0);
  const subtotal = lines.reduce((n, l) => n + l.qty * l.product.price, 0);
  const shipping = items ? SHIPPING_FLAT : 0;
  return { lines, items, subtotal, shipping, total: subtotal + shipping };
}

/* ---------- Toasts ---------- */

export type Toast = { key: number; kind: "cart" | "wishlist"; product: Product };
let toast: Toast | null = null;
const toastListeners = new Set<() => void>();

function notify(t: Omit<Toast, "key">) {
  toast = { ...t, key: Date.now() };
  toastListeners.forEach((l) => l());
}

export function dismissToast() {
  toast = null;
  toastListeners.forEach((l) => l());
}

export function useToast() {
  return useSyncExternalStore(
    (l) => (toastListeners.add(l), () => toastListeners.delete(l)),
    () => toast,
    () => null
  );
}
