import { useEffect, useState } from "react";
import SideDrawer from "../ui/SideDrawer";
import Button from "../ui/Button";
import { createBankApi } from "../../api/bank.api";

const ACCOUNT_TYPES = [
  { value: "CURRENT", label: "Current" },
  { value: "SAVINGS", label: "Savings" },
];

export default function AddBankDrawer({ open, onClose, onCreated }) {
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [branchName, setBranchName] = useState("");
  const [accountType, setAccountType] = useState("CURRENT");
  const [openingBalance, setOpeningBalance] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setBankName("");
    setAccountNumber("");
    setAccountHolderName("");
    setIfscCode("");
    setBranchName("");
    setAccountType("CURRENT");
    setOpeningBalance("");
    setError("");
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!bankName.trim()) return setError("Bank name is required.");
    if (!accountNumber.trim()) return setError("Account number is required.");
    if (!accountHolderName.trim()) return setError("Account holder name is required.");
    if (!ifscCode.trim()) return setError("IFSC code is required.");

    setSaving(true);
    try {
      await createBankApi({
        bankName: bankName.trim(),
        accountNumber: accountNumber.trim(),
        accountHolderName: accountHolderName.trim(),
        ifscCode: ifscCode.trim(),
        branchName: branchName.trim() || undefined,
        accountType,
        openingBalance: openingBalance ? Number(openingBalance) : undefined,
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
      title="Add Bank Account"
      subtitle="Connect a new bank account to track its balance and transactions."
      footer={
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-ink hover:bg-gray-50"
          >
            Cancel
          </button>
          <div className="w-40">
            <Button type="submit" form="add-bank-form" loading={saving}>
              Add Bank
            </Button>
          </div>
        </div>
      }
    >
      <form id="add-bank-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Bank Name</label>
          <input
            className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm"
            placeholder="e.g. State Bank of India"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Account Number</label>
          <input
            className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm"
            placeholder="e.g. 000123456789"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Account Holder Name</label>
          <input
            className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm"
            placeholder="e.g. Trove Traders Pvt Ltd"
            value={accountHolderName}
            onChange={(e) => setAccountHolderName(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">IFSC Code</label>
            <input
              className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm uppercase"
              placeholder="e.g. SBIN0001234"
              value={ifscCode}
              onChange={(e) => setIfscCode(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Account Type</label>
            <select
              className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm"
              value={accountType}
              onChange={(e) => setAccountType(e.target.value)}
            >
              {ACCOUNT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Branch Name</label>
            <input
              className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm"
              placeholder="Optional"
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Opening Balance</label>
            <input
              type="number"
              min={0}
              step="0.01"
              className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm"
              placeholder="0"
              value={openingBalance}
              onChange={(e) => setOpeningBalance(e.target.value)}
            />
          </div>
        </div>

        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
      </form>
    </SideDrawer>
  );
}
