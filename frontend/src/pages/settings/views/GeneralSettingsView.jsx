import { useEffect, useState } from "react";
import Button from "../../../components/ui/Button";
import { updateGeneralSettingsApi } from "../../../api/settings.api";

const fromCompany = (company) => ({
  logo: company?.logo || "",
  companyName: company?.companyName || "",
  email: company?.email || "",
  phone: company?.phone || "",
  website: company?.website || "",
  address: company?.address || "",
  city: company?.city || "",
  state: company?.state || "",
  zipCode: company?.zipCode || "",
  country: company?.country || "India",
});

export default function GeneralSettingsView({ company, onSaved }) {
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
      await updateGeneralSettingsApi(form);
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
        <h1 className="text-xl font-semibold text-ink">General Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your company's basic information.</p>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <Field label="Company Logo URL">
          <input
            placeholder="https://…/logo.png"
            className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm"
            value={form.logo}
            onChange={(e) => setForm({ ...form, logo: e.target.value })}
          />
          <p className="mt-1 text-xs text-gray-400">
            Paste a hosted image URL — file upload isn't available yet.
          </p>
        </Field>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Company Name">
            <input required className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
          </Field>
          <Field label="Email">
            <input type="email" className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
          <Field label="Phone">
            <input className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </Field>
          <Field label="Website">
            <input className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
          </Field>
        </div>

        <div className="mt-4">
          <Field label="Address">
            <textarea rows={2} className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </Field>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="City">
            <input className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </Field>
          <Field label="State">
            <input required className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
          </Field>
          <Field label="ZIP Code">
            <input className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm" value={form.zipCode} onChange={(e) => setForm({ ...form, zipCode: e.target.value })} />
          </Field>
        </div>

        <div className="mt-4 w-64">
          <Field label="Country">
            <input className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
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
