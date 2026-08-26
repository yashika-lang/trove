import { useEffect, useState } from "react";
import Button from "../../../components/ui/Button";
import { getGSTSettingsApi, saveGSTSettingsApi } from "../../../api/gst.api";

const EMPTY_FORM = {
  legalName: "",
  gstin: "",
  stateCode: "",
  state: "",
  registrationType: "REGULAR",
  filingFrequency: "MONTHLY",
  compositionScheme: false,
  eInvoicing: false,
  reverseCharge: false,
  autoReconcile2B: false,
  eInvoiceThreshold: "",
  eWayBillThreshold: "",
};

export default function GSTSettingsView() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getGSTSettingsApi()
      .then((data) => {
        if (data) {
          setForm({
            legalName: data.legalName || "",
            gstin: data.gstin || "",
            stateCode: data.stateCode || "",
            state: data.state || "",
            registrationType: data.registrationType || "REGULAR",
            filingFrequency: data.filingFrequency || "MONTHLY",
            compositionScheme: Boolean(data.compositionScheme),
            eInvoicing: Boolean(data.eInvoicing),
            reverseCharge: Boolean(data.reverseCharge),
            autoReconcile2B: Boolean(data.autoReconcile2B),
            eInvoiceThreshold: data.eInvoiceThreshold ?? "",
            eWayBillThreshold: data.eWayBillThreshold ?? "",
          });
        }
        setLoaded(true);
      })
      .catch((err) => {
        setError(err.message);
        setLoaded(true);
      });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSaved(false);
    setSaving(true);
    try {
      await saveGSTSettingsApi(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!loaded) {
    return <div className="h-64 animate-pulse rounded-2xl border border-gray-100 bg-gray-50" />;
  }

  return (
    <form onSubmit={handleSave} className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-ink">GST Settings</h2>
        <p className="mt-1 text-sm text-gray-500">Registration details and compliance preferences.</p>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <h3 className="text-base font-semibold text-ink">Registration Information</h3>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Legal Name">
            <input required className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm" value={form.legalName} onChange={(e) => setForm({ ...form, legalName: e.target.value })} />
          </Field>
          <Field label="GSTIN">
            <input required maxLength={15} className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm uppercase" value={form.gstin} onChange={(e) => setForm({ ...form, gstin: e.target.value.toUpperCase() })} />
          </Field>
          <Field label="State Code">
            <input required className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm" value={form.stateCode} onChange={(e) => setForm({ ...form, stateCode: e.target.value })} />
          </Field>
          <Field label="State">
            <input required className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
          </Field>
          <Field label="Registration Type">
            <select className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm" value={form.registrationType} onChange={(e) => setForm({ ...form, registrationType: e.target.value })}>
              <option value="REGULAR">Regular</option>
              <option value="COMPOSITION">Composition</option>
              <option value="CASUAL">Casual</option>
              <option value="SEZ">SEZ</option>
            </select>
          </Field>
          <Field label="Filing Frequency">
            <select className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm" value={form.filingFrequency} onChange={(e) => setForm({ ...form, filingFrequency: e.target.value })}>
              <option value="MONTHLY">Monthly</option>
              <option value="QUARTERLY">Quarterly</option>
            </select>
          </Field>
          <Field label="E-Invoice Threshold (₹)">
            <input type="number" min="0" className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm" value={form.eInvoiceThreshold} onChange={(e) => setForm({ ...form, eInvoiceThreshold: e.target.value })} />
          </Field>
          <Field label="E-Way Bill Threshold (₹)">
            <input type="number" min="0" className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm" value={form.eWayBillThreshold} onChange={(e) => setForm({ ...form, eWayBillThreshold: e.target.value })} />
          </Field>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <h3 className="text-base font-semibold text-ink">Preferences</h3>
        <div className="mt-4 space-y-3">
          <Toggle label="Composition Scheme" checked={form.compositionScheme} onChange={(v) => setForm({ ...form, compositionScheme: v })} />
          <Toggle label="E-Invoicing" checked={form.eInvoicing} onChange={(v) => setForm({ ...form, eInvoicing: v })} />
          <Toggle label="Reverse Charge" checked={form.reverseCharge} onChange={(v) => setForm({ ...form, reverseCharge: v })} />
          <Toggle label="Auto Reconcile 2B" checked={form.autoReconcile2B} onChange={(v) => setForm({ ...form, autoReconcile2B: v })} />
        </div>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
      {saved && <p className="rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-700">Settings saved.</p>}

      <div className="w-48">
        <Button type="submit" loading={saving}>
          Save Settings
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
