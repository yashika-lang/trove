import { useEffect, useState } from "react";
import SideDrawer from "../ui/SideDrawer";
import Button from "../ui/Button";
import { createGstLedgerEntryApi } from "../../api/gstLedger.api";

const todayISO = () => new Date().toISOString().slice(0, 10);

// Mirrors backend/src/services/gstLedger.service.js exactly — only these
// four types can be created manually (OUTPUT_* entries are auto-generated
// from invoices), each tied to a fixed account, and are always debit entries.
const ENTRY_TYPES = [
  { value: "INPUT_CGST", label: "Input CGST", account: "CGST" },
  { value: "INPUT_SGST", label: "Input SGST", account: "SGST" },
  { value: "INPUT_IGST", label: "Input IGST", account: "IGST" },
  { value: "GST_PAYMENT", label: "GST Payment", account: "ELECTRONIC_CASH" },
];

export default function GstEntryDrawer({ open, onClose, onCreated }) {
  const [type, setType] = useState("INPUT_CGST");
  const [particular, setParticular] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayISO());
  const [referenceNumber, setReferenceNumber] = useState("");
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setType("INPUT_CGST");
    setParticular("");
    setAmount("");
    setDate(todayISO());
    setReferenceNumber("");
    setRemarks("");
    setError("");
  }, [open]);

  const selectedType = ENTRY_TYPES.find((t) => t.value === type);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!particular.trim()) return setError("Particular is required.");
    if (!amount || Number(amount) <= 0) return setError("Enter a valid amount.");

    setSaving(true);
    try {
      await createGstLedgerEntryApi({
        type,
        account: selectedType.account,
        particular: particular.trim(),
        date,
        debit: Number(amount),
        referenceNumber: referenceNumber.trim() || undefined,
        remarks: remarks.trim() || undefined,
      });
      onCreated();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SideDrawer
      open={open}
      onClose={onClose}
      title="GST Ledger Entry"
      subtitle="Record input GST credit or a GST payment made to the department."
      footer={
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-ink hover:bg-gray-50"
          >
            Cancel
          </button>
          <div className="w-36">
            <Button type="submit" form="gst-entry-form" loading={saving}>
              Add Entry
            </Button>
          </div>
        </div>
      }
    >
      <form id="gst-entry-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Entry Type</label>
          <select
            className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            {ENTRY_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label} ({t.account})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Particular</label>
          <input
            className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm"
            placeholder="e.g. Input credit on office supplies"
            value={particular}
            onChange={(e) => setParticular(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Amount</label>
            <input
              type="number"
              min={0}
              step="0.01"
              className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Date</label>
            <input
              type="date"
              className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Reference Number</label>
          <input
            className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm"
            placeholder="Optional"
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Remarks</label>
          <textarea
            className="h-16 w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm"
            placeholder="Optional note"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </div>

        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
      </form>
    </SideDrawer>
  );
}
