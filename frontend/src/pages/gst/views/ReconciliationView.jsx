import { useEffect, useState } from "react";
import { Plus, X, RefreshCw, CheckCircle2, AlertTriangle, FileX, FileQuestion } from "lucide-react";
import Button from "../../../components/ui/Button";
import StatCard from "../../../components/ui/StatCard";
import {
  getReconciliationRecordsApi,
  getReconciliationRecordStatsApi,
  createReconciliationRecordApi,
  rerunReconciliationMatchApi,
} from "../../../api/gst.api";

const formatINR = (value) => `₹${Number(value ?? 0).toLocaleString("en-IN")}`;

const STATUS_COLOR = {
  MATCHED: "bg-emerald-50 text-emerald-700",
  VALUE_MISMATCH: "bg-amber-50 text-amber-700",
  MISSING_IN_BOOKS: "bg-red-50 text-red-600",
  MISSING_IN_2B: "bg-red-50 text-red-600",
};

const EMPTY_FORM = {
  documentNumber: "",
  supplierName: "",
  gstin: "",
  period: "",
  booksTaxableAmount: "",
  portalTaxableAmount: "",
  booksTax: "",
  portalTax: "",
  notes: "",
};

export default function ReconciliationView() {
  const [stats, setStats] = useState(null);
  const [records, setRecords] = useState(null);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const [rerunning, setRerunning] = useState(false);
  const [rerunResult, setRerunResult] = useState("");

  const refresh = () => {
    Promise.all([getReconciliationRecordStatsApi(), getReconciliationRecordsApi()])
      .then(([s, r]) => {
        setStats(s);
        setRecords(r);
      })
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError("");
    setSaving(true);
    try {
      await createReconciliationRecordApi(form);
      setForm(EMPTY_FORM);
      setShowForm(false);
      refresh();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRerun = async () => {
    setRerunning(true);
    setRerunResult("");
    try {
      const result = await rerunReconciliationMatchApi();
      setRerunResult(`Checked ${result.checked}, updated ${result.updated}.`);
      refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setRerunning(false);
    }
  };

  if (error) return <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-ink">GST Reconciliation</h2>
          <p className="mt-1 text-sm text-gray-500">GSTR-2B vs Books matching.</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleRerun}
            disabled={rerunning}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3.5 py-2 text-sm font-medium text-ink hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw size={15} className={rerunning ? "animate-spin" : ""} /> {rerunning ? "Running…" : "Re-run Match"}
          </button>
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            {showForm ? <X size={16} /> : <Plus size={16} />} {showForm ? "Cancel" : "Add Record"}
          </button>
        </div>
      </div>

      {rerunResult && <p className="rounded-lg bg-brand-50 px-4 py-2.5 text-sm text-brand-700">{rerunResult}</p>}

      {showForm && (
        <form onSubmit={handleCreate} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <input required placeholder="Document number" className="rounded-lg border border-gray-200 px-2.5 py-2 text-sm" value={form.documentNumber} onChange={(e) => setForm({ ...form, documentNumber: e.target.value })} />
            <input required placeholder="Supplier name" className="rounded-lg border border-gray-200 px-2.5 py-2 text-sm" value={form.supplierName} onChange={(e) => setForm({ ...form, supplierName: e.target.value })} />
            <input placeholder="GSTIN" className="rounded-lg border border-gray-200 px-2.5 py-2 text-sm" value={form.gstin} onChange={(e) => setForm({ ...form, gstin: e.target.value })} />
            <input required placeholder="Period (e.g. 2026-07)" className="rounded-lg border border-gray-200 px-2.5 py-2 text-sm" value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })} />
            <input type="number" min="0" placeholder="Books taxable amount" className="rounded-lg border border-gray-200 px-2.5 py-2 text-sm" value={form.booksTaxableAmount} onChange={(e) => setForm({ ...form, booksTaxableAmount: e.target.value })} />
            <input type="number" min="0" placeholder="Books tax" className="rounded-lg border border-gray-200 px-2.5 py-2 text-sm" value={form.booksTax} onChange={(e) => setForm({ ...form, booksTax: e.target.value })} />
            <input type="number" min="0" placeholder="Portal (2B) taxable amount" className="rounded-lg border border-gray-200 px-2.5 py-2 text-sm" value={form.portalTaxableAmount} onChange={(e) => setForm({ ...form, portalTaxableAmount: e.target.value })} />
            <input type="number" min="0" placeholder="Portal (2B) tax" className="rounded-lg border border-gray-200 px-2.5 py-2 text-sm" value={form.portalTax} onChange={(e) => setForm({ ...form, portalTax: e.target.value })} />
            <input placeholder="Notes (optional)" className="rounded-lg border border-gray-200 px-2.5 py-2 text-sm lg:col-span-4" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          {formError && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{formError}</p>}
          <div className="mt-3 w-40">
            <Button type="submit" loading={saving}>
              Save Record
            </Button>
          </div>
        </form>
      )}

      {!stats ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl border border-gray-100 bg-gray-50" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard icon={CheckCircle2} label="Matched" value={stats.matched} />
          <StatCard icon={AlertTriangle} label="Value Mismatch" value={stats.valueMismatch} />
          <StatCard icon={FileQuestion} label="Missing in Books" value={stats.missingInBooks} />
          <StatCard icon={FileX} label="Missing in 2B" value={stats.missingIn2B} />
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-gray-100 text-xs uppercase text-gray-400">
            <tr>
              <th className="px-4 py-3 font-medium">Document</th>
              <th className="px-4 py-3 font-medium">Supplier</th>
              <th className="px-4 py-3 font-medium">Period</th>
              <th className="px-4 py-3 text-right font-medium">Books Tax</th>
              <th className="px-4 py-3 text-right font-medium">Portal (2B) Tax</th>
              <th className="px-4 py-3 text-right font-medium">Difference</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {!records &&
              [0, 1, 2].map((i) => (
                <tr key={i}>
                  <td colSpan={7} className="px-4 py-3">
                    <div className="h-4 animate-pulse rounded bg-gray-50" />
                  </td>
                </tr>
              ))}
            {records && records.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-400">
                  No reconciliation records found.
                </td>
              </tr>
            )}
            {records &&
              records.map((r) => (
                <tr key={r._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-ink">{r.documentNumber}</td>
                  <td className="px-4 py-3 text-gray-600">{r.supplierName}</td>
                  <td className="px-4 py-3 text-gray-600">{r.period}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{formatINR(r.booksTax)}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{formatINR(r.portalTax)}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{formatINR(r.difference)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[r.status]}`}>
                      {r.status.replace(/_/g, " ")}
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
