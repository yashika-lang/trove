import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { KeyRound } from "lucide-react";
import Button from "../../../components/ui/Button";
import { updateSecurityPolicyApi } from "../../../api/settings.api";

const fromSettings = (s) => ({
  twoFactorAuthentication: s?.securityPolicy?.twoFactorAuthentication ?? false,
  minimumPasswordLength: s?.securityPolicy?.minimumPasswordLength ?? 8,
  requireSpecialCharacters: s?.securityPolicy?.requireSpecialCharacters ?? true,
  requireNumbers: s?.securityPolicy?.requireNumbers ?? true,
  passwordExpirationDays: s?.securityPolicy?.passwordExpirationDays ?? 90,
  sessionTimeoutMinutes: s?.securityPolicy?.sessionTimeoutMinutes ?? 30,
});

export default function SecurityView({ settings, onSaved }) {
  const [form, setForm] = useState(fromSettings(settings));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm(fromSettings(settings));
  }, [settings]);

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSaved(false);
    setSaving(true);
    try {
      await updateSecurityPolicyApi(form);
      onSaved();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink">Security</h1>
        <p className="mt-1 text-sm text-gray-500">Company-wide authentication and password policy.</p>
      </div>

      <div className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <KeyRound size={18} />
          </span>
          <div>
            <p className="text-sm font-medium text-ink">Change Your Password</p>
            <p className="text-xs text-gray-400">Update your own account password.</p>
          </div>
        </div>
        <Link to="/profile" className="rounded-lg border border-gray-200 px-3.5 py-2 text-sm font-medium text-ink hover:bg-gray-50">
          Go to Profile
        </Link>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <p className="rounded-lg bg-amber-50 px-4 py-2.5 text-xs text-amber-700">
          This policy is stored for reference — registration and login don't yet enforce these rules automatically (e.g. enabling
          two-factor authentication does not add a verification step to login).
        </p>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <label className="flex cursor-pointer items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
            <span className="text-sm text-ink">Two-Factor Authentication</span>
            <input
              type="checkbox"
              className="h-4 w-4 accent-brand-600"
              checked={form.twoFactorAuthentication}
              onChange={(e) => setForm({ ...form, twoFactorAuthentication: e.target.checked })}
            />
          </label>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Minimum Password Length">
              <input type="number" min="6" max="128" className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm" value={form.minimumPasswordLength} onChange={(e) => setForm({ ...form, minimumPasswordLength: e.target.value })} />
            </Field>
            <Field label="Password Expiration (days)">
              <input type="number" min="0" className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm" value={form.passwordExpirationDays} onChange={(e) => setForm({ ...form, passwordExpirationDays: e.target.value })} />
            </Field>
            <Field label="Session Timeout (minutes)">
              <input type="number" min="5" className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm" value={form.sessionTimeoutMinutes} onChange={(e) => setForm({ ...form, sessionTimeoutMinutes: e.target.value })} />
            </Field>
          </div>

          <div className="mt-4 space-y-2">
            <label className="flex cursor-pointer items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
              <span className="text-sm text-ink">Require Special Characters</span>
              <input type="checkbox" className="h-4 w-4 accent-brand-600" checked={form.requireSpecialCharacters} onChange={(e) => setForm({ ...form, requireSpecialCharacters: e.target.checked })} />
            </label>
            <label className="flex cursor-pointer items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
              <span className="text-sm text-ink">Require Numbers</span>
              <input type="checkbox" className="h-4 w-4 accent-brand-600" checked={form.requireNumbers} onChange={(e) => setForm({ ...form, requireNumbers: e.target.checked })} />
            </label>
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
    </div>
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
