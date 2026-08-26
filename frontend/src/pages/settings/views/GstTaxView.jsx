import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../../components/ui/Button";
import { updateGstTaxApi } from "../../../api/settings.api";

const ROUND_OFF = ["NORMAL", "UP", "DOWN"];

const fromSettings = (s) => ({
  defaultGstRate: s?.gstTax?.defaultGstRate ?? 18,
  inclusiveTax: s?.gstTax?.inclusiveTax ?? false,
  reverseCharge: s?.gstTax?.reverseCharge ?? false,
  tds: s?.gstTax?.tds ?? false,
  tcs: s?.gstTax?.tcs ?? false,
  roundOffMethod: s?.gstTax?.roundOffMethod ?? "NORMAL",
  gstReminders: s?.gstTax?.gstReminders ?? true,
  gstReminderDays: s?.gstTax?.gstReminderDays ?? 5,
});

export default function GstTaxView({ settings, onSaved }) {
  const [form, setForm] = useState(fromSettings(settings));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm(fromSettings(settings));
  }, [settings]);

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSaved(false);
    setSaving(true);
    try {
      await updateGstTaxApi(form);
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
        <h1 className="text-xl font-semibold text-ink">GST & Tax</h1>
        <p className="mt-1 text-sm text-gray-500">Billing defaults applied to new invoices and quotations.</p>
      </div>

      <p className="rounded-lg bg-gray-50 px-4 py-2.5 text-xs text-gray-500">
        Your GSTIN, registration type and filing preferences live under{" "}
        <Link to="/gst/settings" className="font-medium text-brand-600 hover:underline">GST → GST Settings</Link> — this
        page only controls billing-time tax defaults.
      </p>

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Default GST Rate (%)">
            <input type="number" min="0" max="100" className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm" value={form.defaultGstRate} onChange={(e) => setForm({ ...form, defaultGstRate: e.target.value })} />
          </Field>
          <Field label="Round Off Method">
            <select className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm" value={form.roundOffMethod} onChange={(e) => setForm({ ...form, roundOffMethod: e.target.value })}>
              {ROUND_OFF.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </Field>
          <Field label="GST Reminder Days Before Due">
            <input type="number" min="0" className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm" value={form.gstReminderDays} onChange={(e) => setForm({ ...form, gstReminderDays: e.target.value })} />
          </Field>
        </div>

        <div className="mt-4 space-y-2">
          <Toggle label="Prices Inclusive of Tax" checked={form.inclusiveTax} onChange={(v) => setForm({ ...form, inclusiveTax: v })} />
          <Toggle label="Reverse Charge" checked={form.reverseCharge} onChange={(v) => setForm({ ...form, reverseCharge: v })} />
          <Toggle label="TDS" checked={form.tds} onChange={(v) => setForm({ ...form, tds: v })} />
          <Toggle label="TCS" checked={form.tcs} onChange={(v) => setForm({ ...form, tcs: v })} />
          <Toggle label="GST Filing Reminders" checked={form.gstReminders} onChange={(v) => setForm({ ...form, gstReminders: v })} />
        </div>
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

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-500">{label}</label>
      {children}
    </div>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
      <span className="text-sm text-ink">{label}</span>
      <input type="checkbox" className="h-4 w-4 accent-brand-600" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  );
}
