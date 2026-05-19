"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { CheckCircle, Copy, Loader2, Megaphone, Pencil, Plus, X, XCircle } from "lucide-react";
import { toast } from "sonner";

type Campaign = {
  id: number;
  name: string;
  affiliateId?: number;
  description?: string;
  commissionRate?: number;
  startDate?: string;
  endDate?: string;
  active?: boolean;
};

const emptyCampaign = {
  name: "",
  affiliateId: "1",
  description: "",
  commissionRate: "10",
  startDate: new Date().toISOString().slice(0, 10),
  endDate: "",
  active: true,
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [open, setOpen] = useState(false);

  async function loadCampaigns() {
    setLoading(true);
    try {
      const response = await fetch("/api/backend/campaign/api/campaigns");
      setCampaigns(response.ok ? await response.json() : []);
      if (!response.ok) toast.error("Campaign service is not reachable");
    } catch {
      setCampaigns([]);
      toast.error("Campaign service is not reachable");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadCampaigns();
  }, []);

  const formDefaults = useMemo(() => {
    if (!editing) return emptyCampaign;
    return {
      name: editing.name ?? "",
      affiliateId: String(editing.affiliateId ?? 1),
      description: editing.description ?? "",
      commissionRate: String(editing.commissionRate ?? 10),
      startDate: editing.startDate ?? emptyCampaign.startDate,
      endDate: editing.endDate ?? "",
      active: editing.active ?? true,
    };
  }, [editing]);

  async function saveCampaign(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const body = {
      name: String(form.get("name")),
      affiliateId: Number(form.get("affiliateId")),
      description: String(form.get("description")),
      commissionRate: Number(form.get("commissionRate")),
      startDate: String(form.get("startDate")),
      endDate: String(form.get("endDate")) || null,
      active: form.get("active") === "on",
    };

    setSaving(true);
    try {
      const response = await fetch(
        editing ? `/api/backend/campaign/api/campaigns/${editing.id}` : "/api/backend/campaign/api/campaigns",
        {
          method: editing ? "PUT" : "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        },
      );

      if (!response.ok) throw new Error("save failed");

      toast.success(editing ? "Campaign updated" : "Campaign created");
      setOpen(false);
      setEditing(null);
      await loadCampaigns();
    } catch {
      toast.error("Could not save campaign. Check the campaign service.");
    } finally {
      setSaving(false);
    }
  }

  function startCreate() {
    setEditing(null);
    setOpen(true);
  }

  function startEdit(campaign: Campaign) {
    setEditing(campaign);
    setOpen(true);
  }

  async function copyId(id: number, label: string) {
    await navigator.clipboard.writeText(String(id));
    toast.success(`${label} ID copied`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
          <p className="text-gray-500">Manage your promotional campaigns and commission structures.</p>
        </div>
        <button onClick={startCreate} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition">
          <Plus className="w-5 h-5" /> Create Campaign
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
              <th className="p-4 font-medium">ID</th>
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Commission %</th>
              <th className="p-4 font-medium">Dates</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">
                  <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin" />
                  Loading campaigns...
                </td>
              </tr>
            ) : campaigns.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">
                  <Megaphone className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  No campaigns found.
                </td>
              </tr>
            ) : (
              campaigns.map((camp) => (
                <tr key={camp.id} className="hover:bg-gray-50 transition">
                  <td className="p-4">
                    <button onClick={() => copyId(camp.id, "Campaign")} className="inline-flex items-center gap-1 rounded-md px-2 py-1 font-mono text-sm text-gray-700 hover:bg-gray-100" title="Copy campaign ID">
                      #{camp.id}
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </td>
                  <td className="p-4 font-medium text-gray-900">{camp.name}</td>
                  <td className="p-4 text-gray-600">{camp.commissionRate ?? 0}%</td>
                  <td className="p-4 text-gray-600">
                    {camp.startDate || "Not set"} - {camp.endDate || "Ongoing"}
                  </td>
                  <td className="p-4">
                    {camp.active ? (
                      <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3.5 h-3.5" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <XCircle className="w-3.5 h-3.5" /> Paused
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => startEdit(camp)} className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium text-sm">
                      <Pencil className="w-4 h-4" /> Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={saveCampaign} className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">{editing ? "Edit Campaign" : "Create Campaign"}</h2>
              <button type="button" onClick={() => setOpen(false)} className="rounded-md p-2 text-gray-500 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="space-y-1 text-sm font-medium text-gray-700 sm:col-span-2">
                Name
                <input name="name" required minLength={3} maxLength={20} defaultValue={formDefaults.name} className="w-full rounded-lg border border-gray-300 p-2 outline-none focus:ring-2 focus:ring-blue-500" />
              </label>
              <label className="space-y-1 text-sm font-medium text-gray-700">
                Affiliate ID
                <input name="affiliateId" type="number" min={1} defaultValue={formDefaults.affiliateId} className="w-full rounded-lg border border-gray-300 p-2 outline-none focus:ring-2 focus:ring-blue-500" />
              </label>
              <label className="space-y-1 text-sm font-medium text-gray-700">
                Commission %
                <input name="commissionRate" type="number" min={0.01} max={99.99} step="0.01" defaultValue={formDefaults.commissionRate} className="w-full rounded-lg border border-gray-300 p-2 outline-none focus:ring-2 focus:ring-blue-500" />
              </label>
              <label className="space-y-1 text-sm font-medium text-gray-700">
                Start Date
                <input name="startDate" type="date" defaultValue={formDefaults.startDate} className="w-full rounded-lg border border-gray-300 p-2 outline-none focus:ring-2 focus:ring-blue-500" />
              </label>
              <label className="space-y-1 text-sm font-medium text-gray-700">
                End Date
                <input name="endDate" type="date" defaultValue={formDefaults.endDate} className="w-full rounded-lg border border-gray-300 p-2 outline-none focus:ring-2 focus:ring-blue-500" />
              </label>
              <label className="space-y-1 text-sm font-medium text-gray-700 sm:col-span-2">
                Description
                <textarea name="description" maxLength={300} defaultValue={formDefaults.description} rows={3} className="w-full rounded-lg border border-gray-300 p-2 outline-none focus:ring-2 focus:ring-blue-500" />
              </label>
            </div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input name="active" type="checkbox" defaultChecked={formDefaults.active} className="h-4 w-4 rounded border-gray-300" />
              Active campaign
            </label>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50">Cancel</button>
              <button disabled={saving} className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60">
                {saving ? "Saving..." : "Save Campaign"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
