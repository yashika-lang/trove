import { useEffect, useState } from "react";
import { getQuotationsApi } from "../../api/quotation.api";
import { createInvoiceFromQuotationApi } from "../../api/invoice.api";

const todayPlus = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

const formatINR = (value) => `₹${Number(value ?? 0).toLocaleString("en-IN")}`;

export default function FromQuotationModal({ open, onClose, onCreated }) {
  const [quotations, setQuotations] = useState([]);
  const [quotationId, setQuotationId] = useState("");
  const [dueDate, setDueDate] = useState(todayPlus(30));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError("");
    setQuotationId("");
    setDueDate(todayPlus(30));
    // Only APPROVED quotations without an existing convertedInvoice can be
    // converted (backend/src/services/invoice.service.js createInvoiceFromQuotation).
    getQuotationsApi({ status: "APPROVED", limit: 50 })
      .then((result) => setQuotations(result.quotations.filter((q) => !q.convertedInvoice)))
      .catch(() => setQuotations([]));
  }, [open]);

  if (!open) return null;

  const selected = quotations.find((q) => q._id === quotationId);

  const handleGenerate = async () => {
    if (!quotationId) return setError("Select a quotation.");
    setError("");
    setSaving(true);
    try {
      await createInvoiceFromQuotationApi(quotationId, dueDate);
      onCreated();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-base font-semibold text-ink">Generate Invoice from Quotation</h3>
            <p className="mt-1 text-xs text-gray-500">
              Select an approved quotation to convert into a tax invoice.
            </p>
          </div>
        </div>

        <label className="mb-1 mt-4 block text-xs font-medium text-gray-500">Quotation</label>
        <select
          id="from-quotation-select"
          className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm"
          value={quotationId}
          onChange={(e) => setQuotationId(e.target.value)}
        >
          <option value="">Select quotation</option>
          {quotations.map((q) => (
            <option key={q._id} value={q._id}>
              {q.quotationNumber} — {q.customer?.customerName}
            </option>
          ))}
        </select>
        {quotations.length === 0 && (
          <p className="mt-1 text-xs text-gray-400">No approved quotations available to convert.</p>
        )}

        {selected && (
          <div className="mt-3 space-y-1 rounded-lg border border-gray-100 px-3 py-2 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Customer</span>
              <span className="text-ink">{selected.customer?.customerName}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Items</span>
              <span className="text-ink">{selected.items?.length ?? 0}</span>
            </div>
            <div className="flex justify-between font-medium text-ink">
              <span>Invoice Total</span>
              <span>{formatINR(selected.total)}</span>
            </div>
          </div>
        )}

        <label className="mb-1 mt-3 block text-xs font-medium text-gray-500">Due Date</label>
        <input
          type="date"
          className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />

        {error && <p className="mt-2 text-xs text-red-500">{error}</p>}

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-ink hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={saving}
            className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700 disabled:bg-brand-300"
          >
            {saving ? "Generating…" : "Generate Invoice"}
          </button>
        </div>
      </div>
    </div>
  );
}
