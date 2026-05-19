"use client";

import { FormEvent, useEffect, useState } from "react";
import { Copy, ExternalLink, Link as LinkIcon, Loader2, Package, Plus, X } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

type Product = {
  id: number;
  name: string;
  sku?: string;
  description?: string;
  price?: number;
  commissionPercentage?: number;
  category?: string;
  affiliateId?: number;
  campaignId?: number;
  active?: boolean;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);

  async function loadProducts() {
    setLoading(true);
    try {
      const response = await fetch("/api/backend/product/api/products");
      setProducts(response.ok ? await response.json() : []);
      if (!response.ok) toast.error("Product service is not reachable");
    } catch {
      setProducts([]);
      toast.error("Product service is not reachable");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadProducts();
  }, []);

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const body = {
      name: String(form.get("name")),
      description: String(form.get("description")),
      price: Number(form.get("price")),
      commissionPercentage: Number(form.get("commissionPercentage")),
      sku: String(form.get("sku")),
      category: String(form.get("category")),
      affiliateId: Number(form.get("affiliateId")),
      campaignId: Number(form.get("campaignId")) || null,
      active: form.get("active") === "on",
    };

    setSaving(true);
    try {
      const response = await fetch("/api/backend/product/api/products", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error("save failed");
      toast.success("Product added");
      setOpen(false);
      await loadProducts();
    } catch {
      toast.error("Could not add product. Check the product service.");
    } finally {
      setSaving(false);
    }
  }

  async function copyTrackingLink(product: Product) {
    const path = `/checkout?aff=${product.affiliateId ?? ""}&camp=${product.campaignId ?? ""}&prod=${product.id}`;
    await navigator.clipboard.writeText(`${window.location.origin}${path}`);
    toast.success("Tracking link copied");
  }

  async function copyId(id: number, label: string) {
    await navigator.clipboard.writeText(String(id));
    toast.success(`${label} ID copied`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500">Manage catalog and generate tracking URLs.</p>
        </div>
        <button onClick={() => setOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition">
          <Plus className="w-5 h-5" /> Add Product
        </button>
      </div>

      {loading ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 shadow-sm flex flex-col items-center justify-center text-gray-500">
          <Loader2 className="w-12 h-12 mb-3 animate-spin" />
          <p>Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 shadow-sm flex flex-col items-center justify-center text-gray-500">
          <Package className="w-12 h-12 mb-3 opacity-50" />
          <p>No products found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((prod) => (
            <div key={prod.id} className="group relative bg-white border border-gray-200/60 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
              {/* Premium Background Accent */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative z-10 flex justify-between items-start gap-4 mb-5">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">{prod.name}</h3>
                  <p className="text-gray-400 text-xs font-mono tracking-wide">SKU: {prod.sku || `PRD-${prod.id}`}</p>
                </div>
                <div className="bg-blue-600/10 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-100 backdrop-blur-sm">
                  <span className="text-sm font-bold">${(prod.price ?? 0).toFixed(2)}</span>
                </div>
              </div>

              <div className="relative z-10 bg-gray-50/80 rounded-xl p-4 mb-5 space-y-3 text-sm text-gray-600 border border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-500">Product ID</span>
                  <button onClick={() => copyId(prod.id, "Product")} className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-sm font-semibold text-gray-800 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition cursor-pointer shadow-sm" title="Copy product ID">
                    #{prod.id}
                    <Copy className="h-3 w-3 text-gray-400" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-500">Campaign ID</span>
                  {prod.campaignId ? (
                    <button onClick={() => copyId(prod.campaignId as number, "Campaign")} className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-sm font-semibold text-gray-800 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition cursor-pointer shadow-sm" title="Copy campaign ID">
                      #{prod.campaignId}
                      <Copy className="h-3 w-3 text-gray-400" />
                    </button>
                  ) : (
                    <span className="font-medium text-gray-400 px-2">N/A</span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-500">Affiliate ID</span>
                  {prod.affiliateId ? (
                    <button onClick={() => copyId(prod.affiliateId as number, "Affiliate")} className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-sm font-semibold text-gray-800 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition cursor-pointer shadow-sm" title="Copy affiliate ID">
                      #{prod.affiliateId}
                      <Copy className="h-3 w-3 text-gray-400" />
                    </button>
                  ) : (
                    <span className="font-medium text-gray-400 px-2">N/A</span>
                  )}
                </div>
              </div>

              <div className="relative z-10 flex flex-col gap-2.5">
                <button onClick={() => copyTrackingLink(prod)} className="w-full flex items-center justify-center gap-2 border border-gray-200 bg-white text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900 text-sm font-semibold transition-all cursor-pointer shadow-sm group/btn">
                  <LinkIcon className="w-4 h-4 text-gray-400 group-hover/btn:text-gray-600" /> Copy Tracking Link
                </button>
                <Link href={`/checkout?aff=${prod.affiliateId ?? ""}&camp=${prod.campaignId ?? ""}&prod=${prod.id}`} target="_blank" className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-gray-900 to-gray-800 text-white px-4 py-2.5 rounded-xl hover:from-black hover:to-gray-900 text-sm font-semibold transition-all shadow-md hover:shadow-lg cursor-pointer">
                  <ExternalLink className="w-4 h-4 text-gray-300" /> Simulate Checkout
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={saveProduct} className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Add Product</h2>
              <button type="button" onClick={() => setOpen(false)} className="rounded-md p-2 text-gray-500 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="space-y-1 text-sm font-medium text-gray-700 sm:col-span-2">
                Name
                <input name="name" required minLength={3} maxLength={150} className="w-full rounded-lg border border-gray-300 p-2 outline-none focus:ring-2 focus:ring-blue-500" />
              </label>
              <label className="space-y-1 text-sm font-medium text-gray-700">
                Price
                <input name="price" required type="number" min={0.01} step="0.01" defaultValue="49.00" className="w-full rounded-lg border border-gray-300 p-2 outline-none focus:ring-2 focus:ring-blue-500" />
              </label>
              <label className="space-y-1 text-sm font-medium text-gray-700">
                Commission %
                <input name="commissionPercentage" type="number" min={0} max={100} step="0.01" defaultValue="10" className="w-full rounded-lg border border-gray-300 p-2 outline-none focus:ring-2 focus:ring-blue-500" />
              </label>
              <label className="space-y-1 text-sm font-medium text-gray-700">
                SKU
                <input name="sku" className="w-full rounded-lg border border-gray-300 p-2 outline-none focus:ring-2 focus:ring-blue-500" />
              </label>
              <label className="space-y-1 text-sm font-medium text-gray-700">
                Category
                <input name="category" className="w-full rounded-lg border border-gray-300 p-2 outline-none focus:ring-2 focus:ring-blue-500" />
              </label>
              <label className="space-y-1 text-sm font-medium text-gray-700">
                Affiliate ID
                <input name="affiliateId" required type="number" min={1} defaultValue="1" className="w-full rounded-lg border border-gray-300 p-2 outline-none focus:ring-2 focus:ring-blue-500" />
              </label>
              <label className="space-y-1 text-sm font-medium text-gray-700">
                Campaign ID
                <input name="campaignId" type="number" min={1} className="w-full rounded-lg border border-gray-300 p-2 outline-none focus:ring-2 focus:ring-blue-500" />
              </label>
              <label className="space-y-1 text-sm font-medium text-gray-700 sm:col-span-2">
                Description
                <textarea name="description" maxLength={1000} rows={3} className="w-full rounded-lg border border-gray-300 p-2 outline-none focus:ring-2 focus:ring-blue-500" />
              </label>
            </div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input name="active" type="checkbox" defaultChecked className="h-4 w-4 rounded border-gray-300" />
              Active product
            </label>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50">Cancel</button>
              <button disabled={saving} className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60">
                {saving ? "Saving..." : "Save Product"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
