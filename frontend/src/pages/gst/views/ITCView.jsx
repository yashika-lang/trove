import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import Button from "../../../components/ui/Button";
import StatCard from "../../../components/ui/StatCard";
import { Wallet, CheckCircle2, RotateCcw, Scale } from "lucide-react";
import {
  getITCEntriesApi,
  getITCSummaryApi,
  createITCEntryApi,
  claimITCApi,
  reverseITCApi,
  getGSTTransactionsApi,
} from "../../../api/gst.api";

const formatINR = (value) => `₹${Number(value ?? 0).toLocaleString("en-IN")}`;

const ELIGIBILITY_COLOR = {
  ELIGIBLE: "bg-emerald-50 text-emerald-700",
  BLOCKED: "bg-red-50 text-red-600",
  PENDING: "bg-amber-50 text-amber-700",
};

export default function ITCView() {
  const [summary, setSummary] = useState(null);
  const [entries, setEntries] = useState(null);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [inwardTransactions, setInwardTransactions] = useState([]);
  const [form, setForm] = useState({ transaction: "", eligibility: "PENDING", eligibilityReason: "" });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const [amounts, setAmounts] = useState({});
  const [rowError, setRowError] = useState({});

  const refresh = () => {
    Promise.all([getITCSummaryApi(), getITCEntriesApi({ limit: 100 })])
      .then(([s, e]) => {
        setSummary(s);
        setEntries(e.entries);
      })
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    refresh();
  }, []);

  const openForm = () => {
    setShowForm(true);
    getGSTTransactionsApi({ type: "INWARD", limit: 100 }).then((r) => setInwardTransactions(r.entries));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError("");
    setSaving(true);
    try {
      await createITCEntryApi(form);
      setForm({ transaction: "", eligibility: "PENDING", eligibilityReason: "" });
      setShowForm(false);
      refresh();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleClaim = async (id) => {
    setRowError((p) => ({ ...p, [id]: "" }));
    try {
      await claimITCApi(id, Number(amounts[id]));
      setAmounts((p) => ({ ...p, [id]: "" }));
      refresh();
    } catch (err) {
      setRowError((p) => ({ ...p, [id]: err.message }));
    }
  };

  const handleReverse = async (id) => {
    setRowError((p) => ({ ...p, [id]: "" }));
    try {
      await reverseITCApi(id, Number(amounts[id]));
      setAmounts((p) => ({ ...p, [id]: "" }));
      refresh();
    } catch (err) {
      setRowError((p) => ({ ...p, [id]: err.message }));
    }
  };

  if (error) return <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-ink">Input Tax Credit</h2>
          <p className="mt-1 text-sm text-gray-500">Credit available, claimed and reversed against inward transactions.</p>
        </div>
        <button
          type="button"
          onClick={() => (showForm ? setShowForm(false) : openForm())}
          className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          {showForm ? <X size={16} /> : <Plus size={16} />} {showForm ? "Cancel" : "Add ITC Entry"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <select
              required
              className="rounded-lg border border-gray-200 px-2.5 py-2 text-sm sm:col-span-2"
              value={form.transaction}
              onChange={(e) => setForm({ ...form, transaction: e.target.value })}
            >
              <option value="">Select inward (purchase) transaction…</option>
              {inwardTransactions.map((tx) => (
                <option key={tx._id} value={tx._id}>
                  {tx.documentNumber} · {tx.supplierName} · {formatINR(tx.totalTax)} tax
                </option>
              ))}
            </select>
            <select
              className="rounded-lg border border-gray-200 px-2.5 py-2 text-sm"
              value={form.eligibility}
              onChange={(e) => setForm({ ...form, eligibility: e.target.value })}
            >
              <option value="PENDING">Pending (supplier filing)</option>
              <option value="ELIGIBLE">Eligible</option>
              <option value="BLOCKED">Blocked</option>
            </select>
            {form.eligibility === "BLOCKED" && (
              <input
                required
                placeholder="Reason for blocking"
                className="rounded-lg border border-gray-200 px-2.5 py-2 text-sm sm:col-span-3"
                value={form.eligibilityReason}
                onChange={(e) => setForm({ ...form, eligibilityReason: e.target.value })}
              />
            )}
          </div>
          {formError && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{formError}</p>}
          <div className="mt-3 w-40">
            <Button type="submit" loading={saving}>
              Save Entry
            </Button>
          </div>
        </form>
      )}

      {!summary ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl border border-gray-100 bg-gray-50" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard icon={Wallet} label="Available" value={formatINR(summary.available)} />
          <StatCard icon={CheckCircle2} label="Claimed" value={formatINR(summary.claimed)} />
          <StatCard icon={RotateCcw} label="Reversed" value={formatINR(summary.reversed)} />
          <StatCard icon={Scale} label="Net Credit" value={formatINR(summary.netCredit)} />
        </div>
      )}

      {summary && (
        <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-100 text-xs uppercase text-gray-400">
              <tr>
                <th className="px-4 py-3 font-medium">Tax Head</th>
                <th className="px-4 py-3 text-right font-medium">Available</th>
                <th className="px-4 py-3 text-right font-medium">Claimed</th>
                <th className="px-4 py-3 text-right font-medium">Reversed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {summary.byHead.map((h) => (
                <tr key={h.head}>
                  <td className="px-4 py-3 font-medium text-ink">{h.head}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{formatINR(h.available)}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{formatINR(h.claimed)}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{formatINR(h.reversed)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div>
        <h3 className="mb-2 text-base font-semibold text-ink">ITC Eligibility</h3>
        <div className="space-y-2">
          {!entries &&
            [0, 1, 2].map((i) => <div key={i} className="h-16 animate-pulse rounded-2xl border border-gray-100 bg-gray-50" />)}
          {entries && entries.length === 0 && (
            <p className="rounded-2xl border border-gray-100 bg-white py-10 text-center text-sm text-gray-400">
              No ITC entries yet.
            </p>
          )}
          {entries &&
            entries.map((entry) => {
              const totalAvailable =
                (entry.cgstAvailable || 0) + (entry.sgstAvailable || 0) + (entry.igstAvailable || 0) + (entry.cessAvailable || 0);
              return (
                <div key={entry._id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-ink">
                        {entry.documentNumber} · {entry.supplierName}
                      </p>
                      <p className="text-xs text-gray-400">{entry.gstin || "No GSTIN"}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${ELIGIBILITY_COLOR[entry.eligibility]}`}>
                        {entry.eligibility}
                      </span>
                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                        {entry.claimStatus}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-3 text-xs text-gray-500 sm:grid-cols-4">
                    <p>Available: <span className="font-medium text-ink">{formatINR(totalAvailable)}</span></p>
                    <p>Claimed: <span className="font-medium text-ink">{formatINR(entry.claimed)}</span></p>
                    <p>Reversed: <span className="font-medium text-ink">{formatINR(entry.reversed)}</span></p>
                    <p>Net: <span className="font-medium text-ink">{formatINR(entry.claimed - entry.reversed)}</span></p>
                  </div>

                  {entry.eligibility !== "BLOCKED" && entry.claimStatus !== "REVERSED" && (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        placeholder="Amount"
                        className="w-32 rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm"
                        value={amounts[entry._id] || ""}
                        onChange={(e) => setAmounts((p) => ({ ...p, [entry._id]: e.target.value }))}
                      />
                      <button
                        type="button"
                        onClick={() => handleClaim(entry._id)}
                        className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-ink hover:bg-gray-50"
                      >
                        Claim
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReverse(entry._id)}
                        className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-ink hover:bg-gray-50"
                      >
                        Reverse
                      </button>
                      {rowError[entry._id] && <span className="text-xs text-red-600">{rowError[entry._id]}</span>}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
