import { useEffect, useState } from "react";
import Button from "../../../components/ui/Button";
import { updateNotificationSettingsApi } from "../../../api/settings.api";

const CHANNELS = [
  { key: "email", label: "Email" },
  { key: "sms", label: "SMS" },
  { key: "whatsapp", label: "WhatsApp" },
  { key: "desktop", label: "Desktop" },
];

const EVENTS = [
  { key: "invoiceCreated", label: "Invoice Created" },
  { key: "paymentReceived", label: "Payment Received" },
  { key: "quotationSent", label: "Quotation Sent" },
  { key: "gstReminders", label: "GST Reminders" },
  { key: "lowStockAlerts", label: "Low Stock Alerts" },
];

const fromSettings = (s) => ({
  channels: {
    email: s?.notifications?.channels?.email ?? true,
    sms: s?.notifications?.channels?.sms ?? true,
    whatsapp: s?.notifications?.channels?.whatsapp ?? false,
    desktop: s?.notifications?.channels?.desktop ?? true,
  },
  events: EVENTS.reduce((acc, evt) => {
    acc[evt.key] = {
      email: s?.notifications?.events?.[evt.key]?.email ?? true,
      sms: s?.notifications?.events?.[evt.key]?.sms ?? false,
      whatsapp: s?.notifications?.events?.[evt.key]?.whatsapp ?? false,
      desktop: s?.notifications?.events?.[evt.key]?.desktop ?? true,
    };
    return acc;
  }, {}),
});

export default function NotificationsSettingsView({ settings, onSaved }) {
  const [form, setForm] = useState(fromSettings(settings));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm(fromSettings(settings));
  }, [settings]);

  const toggleChannel = (key) => setForm({ ...form, channels: { ...form.channels, [key]: !form.channels[key] } });
  const toggleEventChannel = (event, channel) =>
    setForm({ ...form, events: { ...form.events, [event]: { ...form.events[event], [channel]: !form.events[event][channel] } } });

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSaved(false);
    setSaving(true);
    try {
      await updateNotificationSettingsApi(form);
      onSaved();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink">Notifications</h1>
        <p className="mt-1 text-sm text-gray-500">Alert channels and per-event reminder settings.</p>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <p className="mb-2 text-sm font-medium text-ink">Global Channels</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {CHANNELS.map((c) => (
            <label key={c.key} className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-ink">
              <input type="checkbox" className="h-4 w-4 accent-brand-600" checked={form.channels[c.key]} onChange={() => toggleChannel(c.key)} />
              {c.label}
            </label>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="border-b border-gray-100 text-xs uppercase text-gray-400">
            <tr>
              <th className="px-4 py-3 font-medium">Event</th>
              {CHANNELS.map((c) => (
                <th key={c.key} className="px-4 py-3 text-center font-medium">{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {EVENTS.map((evt) => (
              <tr key={evt.key}>
                <td className="px-4 py-3 font-medium text-ink">{evt.label}</td>
                {CHANNELS.map((c) => (
                  <td key={c.key} className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-brand-600"
                      checked={form.events[evt.key][c.key]}
                      onChange={() => toggleEventChannel(evt.key, c.key)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
      {saved && <p className="rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-700">Saved.</p>}

      <div className="w-48">
        <Button type="submit" loading={saving}>
          Save Changes
        </Button>
      </div>
    </form>
  );
}
