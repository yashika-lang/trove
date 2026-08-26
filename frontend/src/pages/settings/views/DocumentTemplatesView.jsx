import { useState } from "react";
import { Plus, X, Trash2, Star, LayoutTemplate } from "lucide-react";
import Button from "../../../components/ui/Button";
import {
  createDocumentTemplateApi,
  deleteDocumentTemplateApi,
  setDefaultDocumentTemplateApi,
} from "../../../api/settings.api";

const TYPES = [
  { value: "invoice", label: "Invoice" },
  { value: "quotation", label: "Quotation" },
  { value: "creditNote", label: "Credit Note" },
  { value: "debitNote", label: "Debit Note" },
];

const EMPTY_FORM = { type: "invoice", name: "", primaryColor: "#2563eb", accentColor: "#1e40af", isDefault: false };

export default function DocumentTemplatesView({ templates, onSaved }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError("");
    setSaving(true);
    try {
      await createDocumentTemplateApi(form);
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
    if (!window.confirm("Delete this template?")) return;
    await deleteDocumentTemplateApi(id);
    onSaved();
  };

  const handleSetDefault = async (id) => {
    await setDefaultDocumentTemplateApi(id);
    onSaved();
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink">Document Templates</h1>
          <p className="mt-1 text-sm text-gray-500">Named color themes for your invoices and quotations.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          {showForm ? <X size={16} /> : <Plus size={16} />} {showForm ? "Cancel" : "Add Template"}
        </button>
      </div>

      <p className="rounded-lg bg-amber-50 px-4 py-2.5 text-xs text-amber-700">
        Templates save here, but generated invoice/quotation PDFs don't read these colors yet — this is metadata storage, not live styling.
      </p>

      {showForm && (
        <form onSubmit={handleCreate} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <select className="rounded-lg border border-gray-200 px-2.5 py-2 text-sm" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <input required placeholder="Template name" className="rounded-lg border border-gray-200 px-2.5 py-2 text-sm" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <label className="flex items-center gap-2 text-sm text-ink">
              Primary Color
              <input type="color" className="h-9 w-14 rounded border border-gray-200" value={form.primaryColor} onChange={(e) => setForm({ ...form, primaryColor: e.target.value })} />
            </label>
            <label className="flex items-center gap-2 text-sm text-ink">
              Accent Color
              <input type="color" className="h-9 w-14 rounded border border-gray-200" value={form.accentColor} onChange={(e) => setForm({ ...form, accentColor: e.target.value })} />
            </label>
            <label className="flex items-center gap-2 rounded-lg border border-gray-200 px-2.5 py-2 text-sm text-ink sm:col-span-2">
              <input type="checkbox" className="h-4 w-4 accent-brand-600" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} />
              Set as default for this document type
            </label>
          </div>
          {formError && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{formError}</p>}
          <div className="mt-3 w-40">
            <Button type="submit" loading={saving}>
              Save Template
            </Button>
          </div>
        </form>
      )}

      {!templates ? (
        <div className="h-32 animate-pulse rounded-2xl border border-gray-100 bg-gray-50" />
      ) : templates.length === 0 ? (
        <p className="rounded-2xl border border-gray-100 bg-white py-10 text-center text-sm text-gray-400">
          No document templates yet.
        </p>
      ) : (
        <div className="space-y-3">
          {templates.map((t) => (
            <div key={t._id} className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: t.primaryColor, color: "#fff" }}>
                  <LayoutTemplate size={18} />
                </span>
                <div>
                  <p className="flex items-center gap-1.5 text-sm font-medium text-ink">
                    {t.name}
                    {t.isDefault && <span className="rounded-full bg-brand-100 px-1.5 py-0.5 text-[10px] font-medium text-brand-700">Default</span>}
                  </p>
                  <p className="text-xs text-gray-400 capitalize">{TYPES.find((x) => x.value === t.type)?.label ?? t.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {!t.isDefault && (
                  <button type="button" onClick={() => handleSetDefault(t._id)} title="Set as default" className="text-gray-400 hover:text-brand-600">
                    <Star size={15} />
                  </button>
                )}
                {!t.isDefault && (
                  <button type="button" onClick={() => handleDelete(t._id)} title="Delete" className="text-gray-400 hover:text-red-600">
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
