import { useState } from "react";
import { Plus, X, Trash2, Star, Landmark } from "lucide-react";
import Button from "../../../components/ui/Button";
import {
  createBankAccountApi,
  deleteBankAccountApi,
  setDefaultBankAccountApi,
} from "../../../api/settings.api";

const formatINR = (value) => `₹${Number(value ?? 0).toLocaleString("en-IN")}`;

const EMPTY_FORM = {
  bankName: "",
  accountNumber: "",
  accountHolderName: "",
  ifscCode: "",
  branchName: "",
  accountType: "CURRENT",
  currentBalance: "",
  isDefault: false,
};

export default function BankAccountsView({ banks, onSaved }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError("");
    setSaving(true);
    try {
      await createBankAccountApi({ ...form, currentBalance: Number(form.currentBalance || 0) });
      setForm(EMPTY_FORM);
      setShowForm(false);
      onSaved();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this bank account?")) return;
    await deleteBankAccountApi(id);
    onSaved();
  };

  const handleSetDefault = async (id) => {
    await setDefaultBankAccountApi(id);
    onSaved();
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink">Bank Accounts</h1>
          <p className="mt-1 text-sm text-gray-500">Manage the bank accounts used for payments and reconciliation.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          {showForm ? <X size={16} /> : <Plus size={16} />} {showForm ? "Cancel" : "Add Account"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input required placeholder="Bank Name" className="rounded-lg border border-gray-200 px-2.5 py-2 text-sm" value={form.bankName} onChange={(e) => setForm({ ...form, bankName: e.target.value })} />
            <input required placeholder="Account Holder Name" className="rounded-lg border border-gray-200 px-2.5 py-2 text-sm" value={form.accountHolderName} onChange={(e) => setForm({ ...form, accountHolderName: e.target.value })} />
            <input required placeholder="Account Number" className="rounded-lg border border-gray-200 px-2.5 py-2 text-sm" value={form.accountNumber} onChange={(e) => setForm({ ...form, accountNumber: e.target.value })} />
            <input required placeholder="IFSC Code" className="rounded-lg border border-gray-200 px-2.5 py-2 text-sm uppercase" value={form.ifscCode} onChange={(e) => setForm({ ...form, ifscCode: e.target.value.toUpperCase() })} />
            <input placeholder="Branch Name" className="rounded-lg border border-gray-200 px-2.5 py-2 text-sm" value={form.branchName} onChange={(e) => setForm({ ...form, branchName: e.target.value })} />
            <select className="rounded-lg border border-gray-200 px-2.5 py-2 text-sm" value={form.accountType} onChange={(e) => setForm({ ...form, accountType: e.target.value })}>
              <option value="CURRENT">Current</option>
              <option value="SAVINGS">Savings</option>
            </select>
            <input type="number" min="0" placeholder="Current Balance" className="rounded-lg border border-gray-200 px-2.5 py-2 text-sm" value={form.currentBalance} onChange={(e) => setForm({ ...form, currentBalance: e.target.value })} />
            <label className="flex items-center gap-2 rounded-lg border border-gray-200 px-2.5 py-2 text-sm text-ink">
              <input type="checkbox" className="h-4 w-4 accent-brand-600" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} />
              Set as default account
            </label>
          </div>
          {formError && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{formError}</p>}
          <div className="mt-3 w-40">
            <Button type="submit" loading={saving}>
              Save Account
            </Button>
          </div>
        </form>
      )}

      {!banks ? (
        <div className="h-32 animate-pulse rounded-2xl border border-gray-100 bg-gray-50" />
      ) : banks.length === 0 ? (
        <p className="rounded-2xl border border-gray-100 bg-white py-10 text-center text-sm text-gray-400">
          No bank accounts added yet.
        </p>
      ) : (
        <div className="space-y-3">
          {banks.map((b) => (
            <div key={b._id} className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Landmark size={18} />
                </span>
                <div>
                  <p className="flex items-center gap-1.5 text-sm font-medium text-ink">
                    {b.bankName}
                    {b.isDefault && <span className="rounded-full bg-brand-100 px-1.5 py-0.5 text-[10px] font-medium text-brand-700">Default</span>}
                  </p>
                  <p className="text-xs text-gray-400">
                    {b.accountHolderName} · ****{String(b.accountNumber).slice(-4)} · {b.ifscCode}
                    {b.branchName ? ` · ${b.branchName}` : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-sm font-medium text-ink">{formatINR(b.currentBalance)}</p>
                {!b.isDefault && (
                  <button type="button" onClick={() => handleSetDefault(b._id)} title="Set as default" className="text-gray-400 hover:text-brand-600">
                    <Star size={15} />
                  </button>
                )}
                {!b.isDefault && (
                  <button type="button" onClick={() => handleDelete(b._id)} title="Delete" className="text-gray-400 hover:text-red-600">
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
