"use client";

import { FormEvent, useEffect, useState } from "react";
import { Eye, EyeOff, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

type PaypalSettings = {
  environment: string;
  clientId: string;
  secretKey: string;
  webhookId: string;
};

const defaults: PaypalSettings = {
  environment: "sandbox",
  clientId: "",
  secretKey: "",
  webhookId: "",
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<PaypalSettings>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showClientId, setShowClientId] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await fetch("/api/backend/payment/api/settings/paypal");
        if (!response.ok) throw new Error("load failed");
        setSettings({ ...defaults, ...(await response.json()) });
      } catch {
        toast.error("Could not load PayPal configuration");
      } finally {
        setLoading(false);
      }
    }

    void loadSettings();
  }, []);

  function updateField(field: keyof PaypalSettings, value: string) {
    setSettings((current) => ({ ...current, [field]: value }));
  }

  async function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await fetch("/api/backend/payment/api/settings/paypal", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!response.ok) throw new Error("save failed");
      setSettings({ ...defaults, ...(await response.json()) });
      toast.success("PayPal configuration saved");
    } catch {
      toast.error("Could not save PayPal configuration");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">Configure system integrations and payment gateways.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">PayPal Configuration</h2>
        <form onSubmit={saveSettings} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Environment</label>
            <select disabled={loading} value={settings.environment} onChange={(event) => updateField("environment", event.target.value)} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white disabled:bg-gray-100">
              <option value="sandbox">Sandbox (Testing)</option>
              <option value="live">Live (Production)</option>
            </select>
          </div>
          <SecretInput
            label="Client ID"
            value={settings.clientId}
            visible={showClientId}
            onToggle={() => setShowClientId((visible) => !visible)}
            onChange={(value) => updateField("clientId", value)}
          />
          <SecretInput
            label="Secret Key"
            value={settings.secretKey}
            visible={showSecret}
            onToggle={() => setShowSecret((visible) => !visible)}
            onChange={(value) => updateField("secretKey", value)}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Webhook ID</label>
            <input disabled={loading} value={settings.webhookId} onChange={(event) => updateField("webhookId", event.target.value)} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100" />
          </div>
          <div className="pt-4">
            <button disabled={loading || saving} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition disabled:opacity-60">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "Saving..." : "Save Configuration"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SecretInput({
  label,
  value,
  visible,
  onToggle,
  onChange,
}: {
  label: string;
  value: string;
  visible: boolean;
  onToggle: () => void;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex rounded-lg border border-gray-300 focus-within:ring-2 focus-within:ring-blue-500">
        <input type={visible ? "text" : "password"} value={value} onChange={(event) => onChange(event.target.value)} className="min-w-0 flex-1 rounded-l-lg p-2 outline-none" autoComplete="off" required />
        <button type="button" onClick={onToggle} title={visible ? `Hide ${label}` : `Show ${label}`} className="flex w-11 items-center justify-center rounded-r-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800">
          {visible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
}
