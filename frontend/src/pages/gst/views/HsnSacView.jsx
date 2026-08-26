import { useEffect, useState } from "react";
import { Search, Plus, Trash2, X } from "lucide-react";
import Button from "../../../components/ui/Button";
import { useAuth } from "../../../context/AuthContext";
import { getHsnSacApi, createHsnSacApi, deleteHsnSacApi } from "../../../api/gst.api";

const EMPTY_FORM = { code: "", type: "HSN", description: "", uqc: "", gstRate: "" };

export default function HsnSacView() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const refresh = () => {
    setLoading(true);
    getHsnSacApi({ search: search.trim() || undefined, limit: 100 })
      .then(setResult)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const handle = setTimeout(refresh, 250);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError("");
    setSaving(true);
    try {
      await createHsnSacApi({ ...form, gstRate: Number(form.gstRate) });
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
    if (!window.confirm("Delete this HSN/SAC code?")) return;
    await deleteHsnSacApi(id);
    refresh();
  };

  const entries = result?.entries ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-ink">HSN/SAC Master</h2>
          <p className="mt-1 text-sm text-gray-500">Product/service classification codes and their GST rates.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          {showForm ? <X size={16} /> : <Plus size={16} />} {showForm ? "Cancel" : "Add Code"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <input
              required
              placeholder="Code (e.g. 8471)"
              className="rounded-lg border border-gray-200 px-2.5 py-2 text-sm"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
            />
            <select
              className="rounded-lg border border-gray-200 px-2.5 py-2 text-sm"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="HSN">HSN</option>
              <option value="SAC">SAC</option>
            </select>
            <input
              required
              placeholder="Description"
              className="rounded-lg border border-gray-200 px-2.5 py-2 text-sm lg:col-span-2"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <input
              placeholder="UQC (e.g. NOS)"
              className="rounded-lg border border-gray-200 px-2.5 py-2 text-sm"
              value={form.uqc}
              onChange={(e) => setForm({ ...form, uqc: e.target.value })}
            />
            <input
              required
              type="number"
              min="0"
              placeholder="GST Rate %"
              className="rounded-lg border border-gray-200 px-2.5 py-2 text-sm"
              value={form.gstRate}
              onChange={(e) => setForm({ ...form, gstRate: e.target.value })}
            />
          </div>
          {formError && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{formError}</p>}
          <div className="mt-3 w-40">
            <Button type="submit" loading={saving}>
              Save Code
            </Button>
          </div>
        </form>
      )}

      <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm">
        <Search size={14} className="text-gray-400" />
        <input
          className="w-72 outline-none placeholder:text-gray-400"
          placeholder="Search code or description…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

      <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-100 text-xs uppercase text-gray-400">
            <tr>
              <th className="px-4 py-3 font-medium">Code</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Description</th>
              <th className="px-4 py-3 font-medium">UQC</th>
              <th className="px-4 py-3 font-medium">GST Rate</th>
              {user?.role === "Admin" && <th className="px-4 py-3 font-medium" />}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading &&
              [0, 1, 2].map((i) => (
                <tr key={i}>
                  <td colSpan={6} className="px-4 py-3">
                    <div className="h-4 animate-pulse rounded bg-gray-50" />
                  </td>
                </tr>
              ))}
            {!loading && entries.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-400">
                  No HSN/SAC codes found.
                </td>
              </tr>
            )}
            {!loading &&
              entries.map((entry) => (
                <tr key={entry._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-ink">{entry.code}</td>
                  <td className="px-4 py-3 text-gray-600">{entry.type}</td>
                  <td className="px-4 py-3 text-gray-600">{entry.description}</td>
                  <td className="px-4 py-3 text-gray-600">{entry.uqc || "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{entry.gstRate}%</td>
                  {user?.role === "Admin" && (
                    <td className="px-4 py-3 text-right">
                      <button type="button" onClick={() => handleDelete(entry._id)} className="text-gray-400 hover:text-red-600">
                        <Trash2 size={15} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
