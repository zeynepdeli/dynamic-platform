import "server-only";

import { adminFetch } from "@/lib/api";
import type { CategoryFormValues, ProductFormValues } from "@/lib/validations/shop.schema";

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  active: boolean;
  order: number;
  metaTitle: string | null;
  metaDescription: string | null;
  productCount: number;
};

export type ProductListItem = {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  price: string;
  compareAtPrice: string | null;
  unit: string | null;
  stock: number;
  trackStock: boolean;
  active: boolean;
  featured: boolean;
  lowStock: boolean;
  image: { url: string; alt: string | null } | null;
  category: { id: string; name: string } | null;
};

export type ProductPage = { items: ProductListItem[]; total: number; page: number; limit: number; pages: number };

export type Product = Omit<ProductListItem, "lowStock" | "image"> & {
  summary: string | null;
  description: string | null;
  categoryId: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  images: { url: string; alt: string | null }[];
  tabs: { title: string; body: string }[];
};

async function getJson<T>(path: string, what: string): Promise<T | null> {
  const response = await adminFetch(path);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`${what} yüklenemedi (HTTP ${response.status}).`);
  return (await response.json()) as T;
}

export async function getAdminCategories(): Promise<Category[]> {
  return (await getJson<Category[]>("/admin/shop/categories", "Kategoriler")) ?? [];
}

export async function getAdminProducts(params: { q?: string; category?: string; status?: string; page?: number }) {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q.slice(0, 100));
  if (params.category) search.set("category", params.category);
  if (params.status) search.set("status", params.status);
  if (params.page && params.page > 1) search.set("page", String(params.page));
  const qs = search.toString();
  return (
    (await getJson<ProductPage>(`/admin/shop/products${qs ? `?${qs}` : ""}`, "Ürünler")) ?? {
      items: [],
      total: 0,
      page: 1,
      limit: 25,
      pages: 1,
    }
  );
}

export async function getAdminProduct(id: string): Promise<Product | null> {
  return getJson<Product>(`/admin/shop/products/${encodeURIComponent(id)}`, "Ürün");
}

export function toCategoryFormValues(c: Category): CategoryFormValues {
  return {
    name: c.name,
    slug: c.slug,
    description: c.description ?? "",
    imageUrl: c.imageUrl ?? "",
    active: c.active,
    metaTitle: c.metaTitle ?? "",
    metaDescription: c.metaDescription ?? "",
  };
}

const priceInput = (v: string | null) => (v == null ? "" : v.replace(/\.00$/, "").replace(".", ","));

export function toProductFormValues(p: Product): ProductFormValues {
  return {
    name: p.name,
    slug: p.slug,
    sku: p.sku ?? "",
    summary: p.summary ?? "",
    description: p.description ?? "",
    price: priceInput(p.price),
    compareAtPrice: priceInput(p.compareAtPrice),
    unit: p.unit ?? "",
    stock: String(p.stock),
    trackStock: p.trackStock,
    active: p.active,
    featured: p.featured,
    categoryId: p.categoryId ?? "",
    metaTitle: p.metaTitle ?? "",
    metaDescription: p.metaDescription ?? "",
    images: p.images.map((i) => ({ url: i.url, alt: i.alt ?? "" })),
    tabs: p.tabs,
  };
}

/** 1249.9 → "1.249,90 ₺" */
export function formatPrice(value: string | null): string {
  if (value == null) return "";
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(Number(value));
}
