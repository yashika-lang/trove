import { useEffect, useState } from "react";
import Button from "../../../components/ui/Button";
import { getMyProfileApi, updateMyPreferencesApi } from "../../../api/profile.api";
import { useTheme } from "../../../context/ThemeContext";

const THEMES = ["light", "dark", "system"];
const DATE_FORMATS = ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"];
const NUMBER_FORMATS = ["1,000.00", "1.000,00", "1 000.00"];
const TIME_FORMATS = ["12", "24"];

export default function PreferencesView() {
  const { setTheme } = useTheme();
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getMyProfileApi()
      .then((data) => {
        const p = data.user.preferences || {};
        setForm({
          theme: p.theme || "light",
          language: p.language || "en",
          currency: p.currency || "INR",
          dateFormat: p.dateFormat || "DD/MM/YYYY",
          numberFormat: p.numberFormat || "1,000.00",
          timeFormat: p.timeFormat || "24",
        });
      })
      .catch((err) => setError(err.message));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSaved(false);
    setSaving(true);
    try {
      await updateMyPreferencesApi(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (error) return <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>;
  if (!form) return <div className="h-48 animate-pulse rounded-2xl border border-gray-100 bg-gray-50" />;

  return (
    <form onSubmit={handleSave} className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink">Preferences</h1>
        <p className="mt-1 text-sm text-gray-500">Your personal display and formatting preferences.</p>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Theme">
            <select
              className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm capitalize"
              value={form.theme}
              onChange={(e) => {
                const next = e.target.value;
                setForm({ ...form, theme: next });
                setTheme(next);
              }}
            >
              {THEMES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-400">Applies immediately and follows you to your next login.</p>
          </Field>
          <Field label="Language">
            <input className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} />
          </Field>
          <Field label="Currency">
            <input maxLength={3} className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm uppercase" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })} />
          </Field>
          <Field label="Date Format">
            <select className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm" value={form.dateFormat} onChange={(e) => setForm({ ...form, dateFormat: e.target.value })}>
              {DATE_FORMATS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </Field>
          <Field label="Number Format">
            <select className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm" value={form.numberFormat} onChange={(e) => setForm({ ...form, numberFormat: e.target.value })}>
              {NUMBER_FORMATS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </Field>
          <Field label="Time Format">
            <select className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm" value={form.timeFormat} onChange={(e) => setForm({ ...form, timeFormat: e.target.value })}>
              {TIME_FORMATS.map((f) => (
                <option key={f} value={f}>{f}-hour</option>
              ))}
            </select>
          </Field>
        </div>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
      {saved && <p className="rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-700">Saved.</p>}

      <div className="w-48">
        <Button type="submit" loading={saving}>
          Save Changes
        </Button>
      </div>
    </form>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-500">{label}</label>
      {children}
    </div>
  );
}
