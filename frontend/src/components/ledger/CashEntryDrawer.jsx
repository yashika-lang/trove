import { useEffect, useState } from "react";
import SideDrawer from "../ui/SideDrawer";
import Button from "../ui/Button";
import { createCashLedgerEntryApi } from "../../api/cashLedger.api";

const todayISO = () => new Date().toISOString().slice(0, 10);

// Mirrors backend/src/services/cashLedger.service.js CASH_ENTRY_TYPES /
// CREDIT_TYPES / DEBIT_TYPES exactly — the backend derives debit/credit
// from the type, so the frontend must offer the same fixed set.
const ENTRY_TYPES = [
  { value: "CASH_RECEIPT", label: "Cash Receipt", direction: "Credit" },
  { value: "CASH_SALE", label: "Cash Sale", direction: "Credit" },
  { value: "CASH_WITHDRAWAL", label: "Cash Withdrawal (from bank)", direction: "Credit" },
  { value: "CASH_EXPENSE", label: "Cash Expense", direction: "Debit" },
  { value: "CASH_PAYMENT", label: "Cash Payment", direction: "Debit" },
  { value: "CASH_DEPOSIT", label: "Cash Deposit (to bank)", direction: "Debit" },
  { value: "OPENING_BALANCE", label: "Opening Balance (one-time)", direction: "Credit" },
];

export default function CashEntryDrawer({ open, onClose, onCreated }) {
  const [type, setType] = useState("CASH_RECEIPT");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [transactionDate, setTransactionDate] = useState(todayISO());
  const [referenceNumber, setReferenceNumber] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setType("CASH_RECEIPT");
    setDescription("");
    setAmount("");
    setTransactionDate(todayISO());
    setReferenceNumber("");
    setError("");
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!description.trim()) return setError("Description is required.");
    if (!amount || Number(amount) <= 0) return setError("Enter a valid amount.");

    setSaving(true);
    try {
      await createCashLedgerEntryApi({
        type,
        description: description.trim(),
        amount: Number(amount),
        transactionDate,
        referenceNumber: referenceNumber.trim() || undefined,
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
      title="Cash Ledger Entry"
      subtitle="Record a cash receipt, sale, expense or transfer to/from bank."
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
            <Button type="submit" form="cash-entry-form" loading={saving}>
              Add Entry
            </Button>
          </div>
        </div>
      }
    >
      <form id="cash-entry-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Entry Type</label>
          <select
            className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            {ENTRY_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label} ({t.direction})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Description</label>
          <input
            className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm"
            placeholder="e.g. Cash sale — walk-in customer"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
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

        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
      </form>
    </SideDrawer>
  );
}
