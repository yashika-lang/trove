import { useEffect, useState } from "react";
import { Plus, X, Trash2 } from "lucide-react";
import Button from "../../../components/ui/Button";
import { useAuth } from "../../../context/AuthContext";
import { getTaxRatesApi, createTaxRateApi, deleteTaxRateApi } from "../../../api/gst.api";

const EMPTY_FORM = { rate: "", cgst: "", sgst: "", igst: "", label: "", description: "" };

export default function TaxRatesView() {
  const { user } = useAuth();
  const [rates, setRates] = useState(null);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const refresh = () => {
    getTaxRatesApi().then(setRates).catch((err) => setError(err.message));
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError("");
    setSaving(true);
    try {
      await createTaxRateApi({
        rate: Number(form.rate),
        cgst: Number(form.cgst),
        sgst: Number(form.sgst),
        igst: Number(form.igst),
        label: form.label,
        description: form.description,
      });
      setForm(EMPTY_FORM);
      setShowForm(false);
      refresh();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this tax rate?")) return;
    await deleteTaxRateApi(id);
    refresh();
  };

  if (error) return <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-ink">Tax Rates</h2>
          <p className="mt-1 text-sm text-gray-500">GST rate slabs with CGST/SGST/IGST split.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          {showForm ? <X size={16} /> : <Plus size={16} />} {showForm ? "Cancel" : "Add Rate"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <input required type="number" min="0" placeholder="Rate %" className="rounded-lg border border-gray-200 px-2.5 py-2 text-sm" value={form.rate} onChange={(e) => setForm({ ...form, rate: e.target.value })} />
            <input required type="number" min="0" placeholder="CGST %" className="rounded-lg border border-gray-200 px-2.5 py-2 text-sm" value={form.cgst} onChange={(e) => setForm({ ...form, cgst: e.target.value })} />
            <input required type="number" min="0" placeholder="SGST %" className="rounded-lg border border-gray-200 px-2.5 py-2 text-sm" value={form.sgst} onChange={(e) => setForm({ ...form, sgst: e.target.value })} />
            <input required type="number" min="0" placeholder="IGST %" className="rounded-lg border border-gray-200 px-2.5 py-2 text-sm" value={form.igst} onChange={(e) => setForm({ ...form, igst: e.target.value })} />
            <input placeholder="Label" className="rounded-lg border border-gray-200 px-2.5 py-2 text-sm" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
            <input placeholder="Examples / description" className="rounded-lg border border-gray-200 px-2.5 py-2 text-sm" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          {formError && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{formError}</p>}
          <div className="mt-3 w-40">
            <Button type="submit" loading={saving}>
              Save Rate
            </Button>
          </div>
        </form>
      )}

      {!rates ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl border border-gray-100 bg-gray-50" />
          ))}
        </div>
      ) : rates.length === 0 ? (
        <p className="rounded-2xl border border-gray-100 bg-white py-10 text-center text-sm text-gray-400">
          No tax rates configured yet.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {[...rates]
            .sort((a, b) => a.rate - b.rate)
            .map((r) => (
              <div key={r._id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <p className="text-2xl font-semibold text-ink">{r.rate}%</p>
                  {user?.role === "Admin" && (
                    <button type="button" onClick={() => handleDelete(r._id)} className="text-gray-300 hover:text-red-600">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <p className="text-sm font-medium text-gray-600">{r.label}</p>
                <div className="mt-3 space-y-1 text-xs text-gray-500">
                  <p>CGST: {r.cgst}%</p>
                  <p>SGST: {r.sgst}%</p>
                  <p>IGST: {r.igst}%</p>
                </div>
                {r.description && <p className="mt-3 text-xs text-gray-400">{r.description}</p>}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
