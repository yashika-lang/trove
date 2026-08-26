import { useEffect, useState } from "react";
import Button from "../../../components/ui/Button";
import { updateInvoiceQuotationApi } from "../../../api/settings.api";

const PAYMENT_TERMS = ["DUE_ON_RECEIPT", "NET_7", "NET_15", "NET_30", "NET_45", "NET_60"];

const fromSettings = (s) => ({
  invoicePrefix: s?.invoiceQuotation?.invoicePrefix ?? "INV",
  quotationPrefix: s?.invoiceQuotation?.quotationPrefix ?? "QTN",
  creditNotePrefix: s?.invoiceQuotation?.creditNotePrefix ?? "CN",
  debitNotePrefix: s?.invoiceQuotation?.debitNotePrefix ?? "DN",
  autoNumbering: s?.invoiceQuotation?.autoNumbering ?? true,
  nextInvoiceNumber: s?.invoiceQuotation?.nextInvoiceNumber ?? 1,
  nextQuotationNumber: s?.invoiceQuotation?.nextQuotationNumber ?? 1,
  defaultPaymentTerms: s?.invoiceQuotation?.defaultPaymentTerms ?? "NET_30",
  dueDays: s?.invoiceQuotation?.dueDays ?? 30,
});

export default function InvoiceQuotationView({ settings, onSaved }) {
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
      await updateInvoiceQuotationApi(form);
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
        <h1 className="text-xl font-semibold text-ink">Invoice & Quotation</h1>
        <p className="mt-1 text-sm text-gray-500">Document numbering and default terms.</p>
      </div>

      <p className="rounded-lg bg-amber-50 px-4 py-2.5 text-xs text-amber-700">
        These values save, but invoice/quotation numbers are currently always generated as INV-/QTN- regardless of the prefixes below — number generation isn't wired to this setting yet.
      </p>

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Field label="Invoice Prefix">
            <input className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm" value={form.invoicePrefix} onChange={(e) => setForm({ ...form, invoicePrefix: e.target.value })} />
          </Field>
          <Field label="Quotation Prefix">
            <input className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm" value={form.quotationPrefix} onChange={(e) => setForm({ ...form, quotationPrefix: e.target.value })} />
          </Field>
          <Field label="Credit Note Prefix">
            <input className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm" value={form.creditNotePrefix} onChange={(e) => setForm({ ...form, creditNotePrefix: e.target.value })} />
          </Field>
          <Field label="Debit Note Prefix">
            <input className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm" value={form.debitNotePrefix} onChange={(e) => setForm({ ...form, debitNotePrefix: e.target.value })} />
          </Field>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Next Invoice Number">
            <input type="number" min="1" className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm" value={form.nextInvoiceNumber} onChange={(e) => setForm({ ...form, nextInvoiceNumber: e.target.value })} />
          </Field>
          <Field label="Next Quotation Number">
            <input type="number" min="1" className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm" value={form.nextQuotationNumber} onChange={(e) => setForm({ ...form, nextQuotationNumber: e.target.value })} />
          </Field>
          <Field label="Default Payment Terms">
            <select className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm" value={form.defaultPaymentTerms} onChange={(e) => setForm({ ...form, defaultPaymentTerms: e.target.value })}>
              {PAYMENT_TERMS.map((t) => (
                <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
              ))}
            </select>
          </Field>
          <Field label="Due Days">
            <input type="number" min="0" className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm" value={form.dueDays} onChange={(e) => setForm({ ...form, dueDays: e.target.value })} />
          </Field>
        </div>

        <label className="mt-4 flex cursor-pointer items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
          <span className="text-sm text-ink">Auto Numbering</span>
          <input type="checkbox" className="h-4 w-4 accent-brand-600" checked={form.autoNumbering} onChange={(e) => setForm({ ...form, autoNumbering: e.target.checked })} />
        </label>
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
