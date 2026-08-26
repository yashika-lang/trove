import { useEffect, useState } from "react";
import Button from "../../../components/ui/Button";
import { updatePaymentPreferencesApi } from "../../../api/settings.api";

const METHODS = [
  { key: "cash", label: "Cash" },
  { key: "upi", label: "UPI" },
  { key: "bankTransfer", label: "Bank Transfer" },
  { key: "creditCard", label: "Credit Card" },
  { key: "debitCard", label: "Debit Card" },
  { key: "digitalWallet", label: "Digital Wallet" },
];

const PAYMENT_TERMS = ["DUE_ON_RECEIPT", "NET_7", "NET_15", "NET_30", "NET_45", "NET_60"];

const fromSettings = (s) => ({
  methods: {
    cash: s?.paymentPreferences?.methods?.cash ?? true,
    upi: s?.paymentPreferences?.methods?.upi ?? true,
    bankTransfer: s?.paymentPreferences?.methods?.bankTransfer ?? true,
    creditCard: s?.paymentPreferences?.methods?.creditCard ?? true,
    debitCard: s?.paymentPreferences?.methods?.debitCard ?? true,
    digitalWallet: s?.paymentPreferences?.methods?.digitalWallet ?? false,
  },
  defaultPaymentMethod: s?.paymentPreferences?.defaultPaymentMethod ?? "bankTransfer",
  defaultPaymentTerms: s?.paymentPreferences?.defaultPaymentTerms ?? "NET_30",
});

export default function PaymentPreferencesView({ settings, onSaved }) {
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
      await updatePaymentPreferencesApi(form);
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
        <h1 className="text-xl font-semibold text-ink">Payment Preferences</h1>
        <p className="mt-1 text-sm text-gray-500">Accepted payment methods and default terms.</p>
      </div>

      <p className="rounded-lg bg-amber-50 px-4 py-2.5 text-xs text-amber-700">
        These save for reference, but the Record Payment form doesn't read this list to filter its method options yet.
      </p>

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <p className="mb-2 text-sm font-medium text-ink">Accepted Methods</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {METHODS.map((m) => (
            <label key={m.key} className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-ink">
              <input
                type="checkbox"
                className="h-4 w-4 accent-brand-600"
                checked={form.methods[m.key]}
                onChange={(e) => setForm({ ...form, methods: { ...form.methods, [m.key]: e.target.checked } })}
              />
              {m.label}
            </label>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Default Payment Method">
            <select className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm" value={form.defaultPaymentMethod} onChange={(e) => setForm({ ...form, defaultPaymentMethod: e.target.value })}>
              {METHODS.map((m) => (
                <option key={m.key} value={m.key}>{m.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Default Payment Terms">
            <select className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm" value={form.defaultPaymentTerms} onChange={(e) => setForm({ ...form, defaultPaymentTerms: e.target.value })}>
              {PAYMENT_TERMS.map((t) => (
                <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
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
