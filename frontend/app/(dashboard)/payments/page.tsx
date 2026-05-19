"use client";

import { useEffect, useState } from "react";
import { Copy, CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Payment = {
  id: number;
  conversionId?: number;
  amount?: number;
  gatewayReference?: string;
  status?: string;
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPayments() {
      try {
        const response = await fetch("/api/backend/payment/api/payments");
        setPayments(response.ok ? await response.json() : []);
        if (!response.ok) toast.error("Payment service is not reachable");
      } catch {
        setPayments([]);
        toast.error("Payment service is not reachable");
      } finally {
        setLoading(false);
      }
    }

    void loadPayments();
  }, []);

  async function copyId(id: number) {
    await navigator.clipboard.writeText(String(id));
    toast.success("Payment ID copied");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <p className="text-gray-500">Financial tracking and gateway references.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
              <th className="p-4 font-medium">Payment ID</th>
              <th className="p-4 font-medium">Conversion ID</th>
              <th className="p-4 font-medium">Amount</th>
              <th className="p-4 font-medium">Gateway Ref</th>
              <th className="p-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin" />
                  Loading payments...
                </td>
              </tr>
            ) : payments.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  No payments found.
                </td>
              </tr>
            ) : (
              payments.map((pay) => (
                <tr key={pay.id} className="hover:bg-gray-50 transition">
                  <td className="p-4">
                    <button onClick={() => copyId(pay.id)} className="inline-flex items-center gap-1 rounded-md px-2 py-1 font-mono text-sm font-medium text-gray-900 hover:bg-gray-100" title="Copy payment ID">
                      #{pay.id}
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </td>
                  <td className="p-4 text-gray-600">CV-{pay.conversionId ?? "N/A"}</td>
                  <td className="p-4 text-gray-900 font-medium">${(pay.amount ?? 0).toFixed(2)}</td>
                  <td className="p-4 text-gray-500 font-mono text-sm">{pay.gatewayReference || "N/A"}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center py-1 px-2.5 rounded-full text-xs font-medium ${pay.status === "COMPLETED" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                      {pay.status || "PENDING"}
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
