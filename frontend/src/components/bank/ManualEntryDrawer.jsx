import { useEffect, useState } from "react";
import SideDrawer from "../ui/SideDrawer";
import Button from "../ui/Button";
import { createBankTransactionApi } from "../../api/bankTransaction.api";
import { maskAccountNumber } from "../../utils/maskAccountNumber";

const todayISO = () => new Date().toISOString().slice(0, 10);

export default function ManualEntryDrawer({ open, onClose, onCreated, accounts, defaultBankAccount }) {
  const [bankAccount, setBankAccount] = useState("");
  const [type, setType] = useState("CREDIT");
  const [narration, setNarration] = useState("");
  const [amount, setAmount] = useState("");
  const [transactionDate, setTransactionDate] = useState(todayISO());
  const [referenceNumber, setReferenceNumber] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Only reset on the closed->open transition — see ImportCsvModal for
    // why `accounts` must not be a dependency here (it would wipe
    // in-progress input whenever the parent's data refreshes).
    if (!open) return;
    setBankAccount(defaultBankAccount ?? accounts?.[0]?._id ?? "");
    setType("CREDIT");
    setNarration("");
    setAmount("");
    setTransactionDate(todayISO());
    setReferenceNumber("");
    setError("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!bankAccount) return setError("Select a bank account.");
    if (!narration.trim()) return setError("Narration is required.");
    if (!amount || Number(amount) <= 0) return setError("Enter a valid amount.");

    setSaving(true);
    try {
      await createBankTransactionApi({
        bankAccount,
        type,
        narration: narration.trim(),
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
      title="Manual Entry"
      subtitle="Record a bank credit or debit that didn't come from an import."
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
            <Button type="submit" form="manual-entry-form" loading={saving}>
              Add Entry
            </Button>
          </div>
        </div>
      }
    >
      <form id="manual-entry-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Bank Account</label>
          <select
            className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm"
            value={bankAccount}
            onChange={(e) => setBankAccount(e.target.value)}
          >
            <option value="">Select bank account</option>
            {(accounts ?? []).map((acc) => (
              <option key={acc._id} value={acc._id}>
                {acc.bankName} — {maskAccountNumber(acc.accountNumber)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Type</label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setType("CREDIT")}
              className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                type === "CREDIT"
                  ? "border-brand-600 bg-brand-50 text-brand-700"
                  : "border-gray-200 text-gray-500 hover:bg-gray-50"
              }`}
            >
              Credit
            </button>
            <button
              type="button"
              onClick={() => setType("DEBIT")}
              className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                type === "DEBIT"
                  ? "border-red-500 bg-red-50 text-red-600"
                  : "border-gray-200 text-gray-500 hover:bg-gray-50"
              }`}
            >
              Debit
            </button>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Narration</label>
          <input
            className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm"
            placeholder="e.g. Office rent, Cash deposit…"
            value={narration}
            onChange={(e) => setNarration(e.target.value)}
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
            placeholder="Optional — e.g. cheque or UTR number"
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
          />
        </div>

        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
      </form>
    </SideDrawer>
  );
}
