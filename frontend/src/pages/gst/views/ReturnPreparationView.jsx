import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import Button from "../../../components/ui/Button";
import { getGSTReturnsApi, createGSTReturnApi, updateGSTReturnApi } from "../../../api/gst.api";

const formatINR = (value) => `₹${Number(value ?? 0).toLocaleString("en-IN")}`;
const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const STATUS_COLOR = {
  DRAFT: "bg-gray-100 text-gray-600",
  PREPARED: "bg-brand-50 text-brand-700",
  APPROVED: "bg-blue-50 text-blue-700",
  PENDING: "bg-amber-50 text-amber-700",
  FILED: "bg-emerald-50 text-emerald-700",
  PAID: "bg-emerald-50 text-emerald-700",
};

const EMPTY_FORM = { returnType: "GSTR-1", period: "", dueDate: "", liability: "" };

export default function ReturnPreparationView() {
  const [returns, setReturns] = useState(null);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const [filingId, setFilingId] = useState(null);
  const [filingRef, setFilingRef] = useState("");
  const [filingError, setFilingError] = useState("");

  const refresh = () => {
    getGSTReturnsApi().then(setReturns).catch((err) => setError(err.message));
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError("");
    setSaving(true);
    try {
      await createGSTReturnApi(form);
      setForm(EMPTY_FORM);
      setShowForm(false);
      refresh();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleFile = async (id) => {
    setFilingError("");
    try {
      await updateGSTReturnApi(id, { status: "FILED", filingReference: filingRef.trim() });
      setFilingId(null);
      setFilingRef("");
      refresh();
    } catch (err) {
      setFilingError(err.message);
    }
  };

  if (error) return <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-ink">Return Preparation</h2>
          <p className="mt-1 text-sm text-gray-500">Prepare and file GSTR-1, GSTR-3B and GSTR-9.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          {showForm ? <X size={16} /> : <Plus size={16} />} {showForm ? "Cancel" : "Prepare Return"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <select className="rounded-lg border border-gray-200 px-2.5 py-2 text-sm" value={form.returnType} onChange={(e) => setForm({ ...form, returnType: e.target.value })}>
              <option value="GSTR-1">GSTR-1</option>
              <option value="GSTR-3B">GSTR-3B</option>
              <option value="GSTR-9">GSTR-9</option>
            </select>
            <input required placeholder="Period (e.g. 2026-07)" className="rounded-lg border border-gray-200 px-2.5 py-2 text-sm" value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })} />
            <input required type="date" className="rounded-lg border border-gray-200 px-2.5 py-2 text-sm" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
            <input required type="number" min="0" placeholder="Liability" className="rounded-lg border border-gray-200 px-2.5 py-2 text-sm" value={form.liability} onChange={(e) => setForm({ ...form, liability: e.target.value })} />
          </div>
          {formError && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{formError}</p>}
          <div className="mt-3 w-40">
            <Button type="submit" loading={saving}>
              Save Return
            </Button>
          </div>
        </form>
      )}

      {!returns ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl border border-gray-100 bg-gray-50" />
          ))}
        </div>
      ) : returns.length === 0 ? (
        <p className="rounded-2xl border border-gray-100 bg-white py-10 text-center text-sm text-gray-400">
          No returns prepared yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {returns.map((r) => {
            const canFile = !["FILED", "PAID"].includes(r.status);
            return (
              <div key={r._id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <p className="text-base font-semibold text-ink">{r.returnType}</p>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLOR[r.status]}`}>{r.status}</span>
                </div>
                <p className="mt-1 text-sm text-gray-500">Period: {r.period}</p>
                <p className="text-sm text-gray-500">Due: {formatDate(r.dueDate)}</p>
                <p className="mt-2 text-lg font-semibold text-ink">{formatINR(r.liability)}</p>

                {r.status === "FILED" || r.status === "PAID" ? (
                  <p className="mt-3 text-xs text-gray-400">
                    Filed {formatDate(r.filedAt)}{r.filingReference ? ` · ARN ${r.filingReference}` : ""}
                  </p>
                ) : filingId === r._id ? (
                  <div className="mt-3 space-y-2">
                    <input
                      placeholder="Filing reference / ARN"
                      className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm"
                      value={filingRef}
                      onChange={(e) => setFilingRef(e.target.value)}
                    />
                    {filingError && <p className="text-xs text-red-600">{filingError}</p>}
                    <div className="flex gap-2">
                      <button type="button" onClick={() => handleFile(r._id)} className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700">
                        Confirm File
                      </button>
                      <button type="button" onClick={() => setFilingId(null)} className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-ink hover:bg-gray-50">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  canFile && (
                    <button
                      type="button"
                      onClick={() => {
                        setFilingId(r._id);
                        setFilingRef("");
                        setFilingError("");
                      }}
                      className="mt-3 w-full rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-ink hover:bg-gray-50"
                    >
                      File Now
                    </button>
                  )
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
