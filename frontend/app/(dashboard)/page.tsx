"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Activity, CreditCard, DollarSign, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Client } from "@stomp/stompjs";

type SummaryData = {
  activeCampaigns: number;
  totalPaid: number;
  affiliateCount: number;
  systemUp: boolean;
};

const initialData: SummaryData = {
  activeCampaigns: 0,
  totalPaid: 0,
  affiliateCount: 0,
  systemUp: false,
};

type LiveEvent = {
  id: string;
  message: string;
  amount: number;
  status: string;
  timestamp: string;
};

export default function OverviewPage() {
  const [data, setData] = useState<SummaryData>(initialData);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<LiveEvent[]>([]);

  useEffect(() => {
    async function getSummaryData() {
      try {
        const [campaignResponse, paymentResponse, affiliateResponse] = await Promise.all([
          fetch("/api/backend/campaign/api/campaigns").catch(() => null),
          fetch("/api/backend/payment/api/payments").catch(() => null),
          fetch("/api/backend/affiliate/api/affiliate").catch(() => null),
        ]);

        const campaigns = campaignResponse?.ok ? await campaignResponse.json() : [];
        const payments = paymentResponse?.ok ? await paymentResponse.json() : [];
        const affiliates = affiliateResponse?.ok ? await affiliateResponse.json() : [];
        const totalPaid = payments.reduce((sum: number, payment: { amount?: number }) => sum + (payment.amount || 0), 0);

        setData({
          activeCampaigns: campaigns.filter((campaign: { active?: boolean }) => campaign.active).length,
          totalPaid,
          affiliateCount: affiliates.length,
          systemUp: Boolean(campaignResponse?.ok && affiliateResponse?.ok),
        });

        // Populate Live Feed with historical payments
        if (payments.length > 0) {
          const historicalEvents: LiveEvent[] = payments
            .slice(-10)
            .reverse()
            .map((p: any) => ({
              id: p.id.toString(),
              message: p.status === "COMPLETED" 
                ? `✅ Payment of $${p.amount.toFixed(2)} completed` 
                : p.status === "FAILED"
                ? `❌ Payment of $${p.amount.toFixed(2)} failed: ${p.failureReason || "Declined"}`
                : `📝 Payment update: ${p.status}`,
              amount: p.amount,
              status: p.status,
              timestamp: new Date(p.processedAt || p.createdAt).toLocaleTimeString(),
            }));
          setEvents(historicalEvents);
        }
      } finally {
        setLoading(false);
      }
    }

    void getSummaryData();

    const statusInterval = setInterval(async () => {
      try {
        const [campaignResponse, affiliateResponse] = await Promise.all([
          fetch("/api/backend/campaign/api/campaigns", { signal: AbortSignal.timeout(3000) }).catch(() => null),
          fetch("/api/backend/affiliate/api/affiliate", { signal: AbortSignal.timeout(3000) }).catch(() => null),
        ]);
        setData((prev) => ({
          ...prev,
          systemUp: Boolean(campaignResponse?.ok && affiliateResponse?.ok),
        }));
      } catch (e) {
        setData((prev) => ({ ...prev, systemUp: false }));
      }
    }, 10000);

    const client = new Client({
      brokerURL: "ws://localhost:8084/ws/notifications-native",
      onConnect: () => {
        console.log("Connected to STOMP WebSocket!");
        client.subscribe("/topic/payments", (message) => {
          if (message.body) {
            const parsedEvent = JSON.parse(message.body);
            const newEvent: LiveEvent = {
              id: parsedEvent.paymentId + "-" + Date.now(),
              message: parsedEvent.message,
              amount: parsedEvent.amount,
              status: parsedEvent.status,
              timestamp: new Date(parsedEvent.timestamp).toLocaleTimeString(),
            };
            setEvents((prev) => [newEvent, ...prev].slice(0, 10)); 
            
            if (parsedEvent.status === "COMPLETED") {
              setData((prev) => ({
                ...prev,
                totalPaid: prev.totalPaid + parsedEvent.amount,
              }));
            }
          }
        });
      },
      onStompError: (frame) => {
        console.error("Broker reported error: " + frame.headers["message"]);
      },
    });

    client.activate();

    return () => {
      clearInterval(statusInterval);
      void client.deactivate();
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500">Welcome to your affiliate platform.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <SummaryCard title="Affiliates" icon={<DollarSign className="w-5 h-5 text-gray-400" />} value={loading ? "..." : data.affiliateCount} note="Registered partners" />
        <SummaryCard title="Total Processed" icon={<CreditCard className="w-5 h-5 text-gray-400" />} value={loading ? "..." : `$${data.totalPaid.toFixed(2)}`} note="Through gateway" />
        <SummaryCard title="Active Campaigns" icon={<Activity className="w-5 h-5 text-gray-400" />} value={loading ? "..." : data.activeCampaigns} note="Running right now" />

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between pb-4">
            <h3 className="font-semibold text-gray-500">System Status</h3>
            {loading ? <Loader2 className="w-5 h-5 text-gray-400 animate-spin" /> : <Activity className="w-5 h-5 text-gray-400" />}
          </div>
          {data.systemUp ? (
            <>
              <div className="text-xl font-bold text-green-600 mt-1 flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
                </span>
                Connected
              </div>
              <p className="text-sm text-gray-500 mt-2">APIs reachable</p>
            </>
          ) : (
            <>
              <div className="text-xl font-bold text-red-600 mt-1 flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                </span>
                {loading ? "Checking" : "Disconnected"}
              </div>
              <p className="text-sm text-red-500 mt-2">Some services are unavailable</p>
            </>
          )}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="font-bold text-gray-800">Live Feed</h2>
        </div>
        
        {events.length === 0 ? (
          <div className="p-6 flex flex-col items-center justify-center text-gray-400 h-40">
            <Activity className="w-8 h-8 mb-2 opacity-50" />
            Waiting for live events... (WebSocket connected)
          </div>
        
        ) : (
          <div className="p-0">
            <ul className="divide-y divide-gray-100">
              {events.map((event) => (
                <li key={event.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition">
                  <div className="shrink-0">
                    {event.status === "COMPLETED" ? (
                      <div className="bg-green-100 p-2 rounded-full"><CheckCircle2 className="w-5 h-5 text-green-600" /></div>
                    ) : event.status === "FAILED" ? (
                      <div className="bg-red-100 p-2 rounded-full"><XCircle className="w-5 h-5 text-red-600" /></div>
                    ) : (
                      <div className="bg-blue-100 p-2 rounded-full"><Activity className="w-5 h-5 text-blue-600" /></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{event.message}</p>
                    <p className="text-xs text-gray-500">{event.timestamp}</p>
                  </div>
                  <div className="font-mono text-sm font-semibold text-gray-900">
                    ${event.amount.toFixed(2)}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ title, icon, value, note }: { title: string; icon: ReactNode; value: string | number; note: string }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between pb-4">
        <h3 className="font-semibold text-gray-500">{title}</h3>
        {icon}
      </div>
      <div className="text-3xl font-bold">{value}</div>
      <p className="text-sm text-gray-500 mt-2">{note}</p>
    </div>
  );
}
