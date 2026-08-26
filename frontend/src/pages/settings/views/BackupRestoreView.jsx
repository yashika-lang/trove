import { DatabaseBackup } from "lucide-react";

// Unlike every other Settings section, there is no backend at all for
// backup/restore (no export-all-data, no restore-from-file, no scheduled
// backup config anywhere in the API) — so this stays an honest empty
// state rather than a fake upload/download UI that goes nowhere.
export default function BackupRestoreView() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 py-24 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
        <DatabaseBackup size={22} />
      </span>
      <h1 className="text-lg font-semibold text-ink">Backup & Restore</h1>
      <p className="max-w-sm text-sm text-gray-500">
        Data backup and restore isn't available yet — there's no export or restore capability built on the backend for this.
      </p>
    </div>
  );
}
