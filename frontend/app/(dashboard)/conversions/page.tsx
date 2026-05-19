"use client";

import { useEffect, useState } from "react";
import { Activity, Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Conversion = {
  id: number;
  affiliateId?: number;
  campaignId?: number;
  saleAmount?: number;
  commission?: number;
  status?: string;
};

export default function ConversionsPage() {
  const [conversions, setConversions] = useState<Conversion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadConversions() {
      try {
        const response = await fetch("/api/backend/conversion/api/conversions");
        setConversions(response.ok ? await response.json() : []);
        if (!response.ok) toast.error("Conversion service is not reachable");
      } catch {
        setConversions([]);
        toast.error("Conversion service is not reachable");
      } finally {
        setLoading(false);
      }
    }

    void loadConversions();
  }, []);

  async function copyId(id: number) {
    await navigator.clipboard.writeText(String(id));
    toast.success("Conversion ID copied");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Conversions</h1>
        <p className="text-gray-500">Real-time sales ledger and commission tracking.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
              <th className="p-4 font-medium">ID</th>
              <th className="p-4 font-medium">Affiliate ID</th>
              <th className="p-4 font-medium">Campaign ID</th>
              <th className="p-4 font-medium">Amount</th>
              <th className="p-4 font-medium">Commission</th>
              <th className="p-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">
                  <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin" />
                  Loading conversions...
                </td>
              </tr>
            ) : conversions.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">
                  <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  No conversions found.
                </td>
              </tr>
            ) : (
              conversions.map((conv) => (
                <tr key={conv.id} className="hover:bg-gray-50 transition">
                  <td className="p-4">
                    <button onClick={() => copyId(conv.id)} className="inline-flex items-center gap-1 rounded-md px-2 py-1 font-mono text-sm text-gray-700 hover:bg-gray-100" title="Copy conversion ID">
                      #{conv.id}
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </td>
                  <td className="p-4 text-gray-600">Affiliate #{conv.affiliateId ?? "N/A"}</td>
                  <td className="p-4 text-gray-600">Campaign #{conv.campaignId ?? "N/A"}</td>
                  <td className="p-4 text-gray-900 font-medium">${(conv.saleAmount ?? 0).toFixed(2)}</td>
                  <td className="p-4 text-green-600 font-medium">${(conv.commission ?? 0).toFixed(2)}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center py-1 px-2.5 rounded-full text-xs font-medium ${conv.status === "COMPLETED" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                      {conv.status || "PENDING"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
