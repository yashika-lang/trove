import { useEffect, useState } from "react";
import Button from "../../../components/ui/Button";
import { updateCompanyInfoApi } from "../../../api/settings.api";

const BUSINESS_TYPES = [
  { value: "sole-proprietorship", label: "Sole Proprietorship" },
  { value: "partnership", label: "Partnership" },
  { value: "llp", label: "LLP" },
  { value: "private-ltd", label: "Private Ltd" },
  { value: "public-ltd", label: "Public Ltd" },
  { value: "other", label: "Other" },
];

const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];

const fromCompany = (company) => ({
  gstNumber: company?.gstNumber || "",
  panNumber: company?.panNumber || "",
  businessType: company?.businessType || "private-ltd",
  state: company?.state || "",
  currency: company?.currency || "INR",
  timezone: company?.timezone || "Asia/Kolkata",
  financialYearStart: company?.financialYearStart || "april",
});

export default function CompanyInfoView({ company, onSaved }) {
  const [form, setForm] = useState(fromCompany(company));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm(fromCompany(company));
  }, [company]);

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSaved(false);
    setSaving(true);
    try {
      await updateCompanyInfoApi(form);
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
        <h1 className="text-xl font-semibold text-ink">Company Information</h1>
        <p className="mt-1 text-sm text-gray-500">Manage legal details and business information.</p>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="GSTIN">
            <input maxLength={15} className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm uppercase" value={form.gstNumber} onChange={(e) => setForm({ ...form, gstNumber: e.target.value.toUpperCase() })} />
          </Field>
          <Field label="PAN">
            <input maxLength={10} className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm uppercase" value={form.panNumber} onChange={(e) => setForm({ ...form, panNumber: e.target.value.toUpperCase() })} />
          </Field>
          <Field label="Business Type">
            <select className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm" value={form.businessType} onChange={(e) => setForm({ ...form, businessType: e.target.value })}>
              {BUSINESS_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </Field>
          <Field label="State">
            <input required className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
          </Field>
          <Field label="Currency">
            <input maxLength={3} className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm uppercase" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })} />
          </Field>
          <Field label="Time Zone">
            <input className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm" value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })} />
          </Field>
          <Field label="Financial Year Start">
            <select className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm" value={form.financialYearStart} onChange={(e) => setForm({ ...form, financialYearStart: e.target.value })}>
              {MONTHS.map((m) => (
                <option key={m} value={m}>{m[0].toUpperCase() + m.slice(1)}</option>
              ))}
            </select>
          </Field>
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
