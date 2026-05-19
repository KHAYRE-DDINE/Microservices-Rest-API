"use client";

import { FormEvent, useEffect, useState } from "react";
import { Copy, Loader2, Plus, Users, X } from "lucide-react";
import { toast } from "sonner";

type Affiliate = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  website?: string;
  active?: boolean;
};

export default function AffiliatesPage() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);

  async function loadAffiliates() {
    setLoading(true);
    try {
      const response = await fetch("/api/backend/affiliate/api/affiliate");
      setAffiliates(response.ok ? await response.json() : []);
      if (!response.ok) toast.error("Affiliate service is not reachable");
    } catch {
      setAffiliates([]);
      toast.error("Affiliate service is not reachable");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadAffiliates();
  }, []);

  async function saveAffiliate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const body = {
      name: String(form.get("name")),
      email: String(form.get("email")),
      phone: String(form.get("phone")),
      website: String(form.get("website")),
      active: form.get("active") === "on",
    };

    setSaving(true);
    try {
      const response = await fetch("/api/backend/affiliate/api/affiliate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error("save failed");
      toast.success("Affiliate added");
      setOpen(false);
      await loadAffiliates();
    } catch {
      toast.error("Could not add affiliate. Check the affiliate service.");
    } finally {
      setSaving(false);
    }
  }

  async function copyId(id: number) {
    await navigator.clipboard.writeText(String(id));
    toast.success("Affiliate ID copied");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Affiliates</h1>
          <p className="text-gray-500">Partner management and earnings overview.</p>
        </div>
        <button onClick={() => setOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition">
          <Plus className="w-5 h-5" /> Add Affiliate
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
              <th className="p-4 font-medium">ID</th>
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Email</th>
              <th className="p-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500">
                  <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin" />
                  Loading affiliates...
                </td>
              </tr>
            ) : affiliates.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  No affiliates found.
                </td>
              </tr>
            ) : (
              affiliates.map((affiliate) => (
                <tr key={affiliate.id} className="hover:bg-gray-50 transition">
                  <td className="p-4">
                    <button onClick={() => copyId(affiliate.id)} className="inline-flex items-center gap-1 rounded-md px-2 py-1 font-mono text-sm text-gray-700 hover:bg-gray-100" title="Copy affiliate ID">
                      #{affiliate.id}
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </td>
                  <td className="p-4 font-medium text-gray-900">{affiliate.name}</td>
                  <td className="p-4 text-gray-600">{affiliate.email}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center py-1 px-2.5 rounded-full text-xs font-medium ${affiliate.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                      {affiliate.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={saveAffiliate} className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Add Affiliate</h2>
              <button type="button" onClick={() => setOpen(false)} className="rounded-md p-2 text-gray-500 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <label className="block text-sm font-medium text-gray-700">
              Name
              <input name="name" required minLength={3} maxLength={20} className="mt-1 w-full rounded-lg border border-gray-300 p-2 outline-none focus:ring-2 focus:ring-blue-500" />
            </label>
            <label className="block text-sm font-medium text-gray-700">
              Email
              <input name="email" required type="email" className="mt-1 w-full rounded-lg border border-gray-300 p-2 outline-none focus:ring-2 focus:ring-blue-500" />
            </label>
            <label className="block text-sm font-medium text-gray-700">
              Phone
              <input name="phone" className="mt-1 w-full rounded-lg border border-gray-300 p-2 outline-none focus:ring-2 focus:ring-blue-500" />
            </label>
            <label className="block text-sm font-medium text-gray-700">
              Website
              <input name="website" className="mt-1 w-full rounded-lg border border-gray-300 p-2 outline-none focus:ring-2 focus:ring-blue-500" />
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input name="active" type="checkbox" defaultChecked className="h-4 w-4 rounded border-gray-300" />
              Active affiliate
            </label>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50">Cancel</button>
              <button disabled={saving} className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60">
                {saving ? "Saving..." : "Save Affiliate"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
