import { useEffect, useRef, useState } from "react";
import { UploadCloud, X } from "lucide-react";
import Button from "../ui/Button";
import { importBankStatementApi } from "../../api/bankImport.api";
import { maskAccountNumber } from "../../utils/maskAccountNumber";

const formatINR = (value) => `₹${Number(value ?? 0).toLocaleString("en-IN")}`;

export default function ImportCsvModal({ open, onClose, onImported, accounts, defaultBankAccount }) {
  const [bankAccount, setBankAccount] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Only reset on the closed->open transition. Depending on `accounts`
    // too would re-run this whenever the parent's data refreshes (e.g.
    // right after a successful import, while this modal is still open to
    // show the result) and wipe out the just-set result/file state back to
    // the empty form.
    if (!open) return;
    setBankAccount(defaultBankAccount ?? accounts?.[0]?._id ?? "");
    setFile(null);
    setError("");
    setResult(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const handleImport = async () => {
    setError("");

    if (!bankAccount) return setError("Select a bank account.");
    if (!file) return setError("Choose a CSV file to import.");

    setImporting(true);
    try {
      // The backend validates and imports the entire file as a single
      // all-or-nothing operation — any invalid row (bad date, non-CREDIT/
      // DEBIT type, non-positive amount, duplicate reference) rejects the
      // whole file with a row-numbered message. There is no per-row
      // partial-success response to show here.
      const importResult = await importBankStatementApi(file, bankAccount);
      setResult(importResult);
      onImported();
    } catch (err) {
      setError(err.message);
    } finally {
      setImporting(false);
    }
  };

  const handleDone = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-base font-semibold text-ink">Import Bank Statement</h3>
            <p className="mt-0.5 text-xs text-gray-500">Upload a CSV export from your bank.</p>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-ink">
            <X size={18} />
          </button>
        </div>

        {!result ? (
          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Bank Account</label>
              <select
                className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm"
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
              >
                <option value="">Select bank account</option>
                {(accounts ?? []).map((acc) => (
                  <option key={acc._id} value={acc._id}>
                    {acc.bankName} — {maskAccountNumber(acc.accountNumber)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">CSV File</label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-3 py-6 text-center text-sm text-gray-500 hover:bg-gray-50"
              >
                <UploadCloud size={20} className="text-gray-400" />
                {file ? file.name : "Click to choose a .csv file"}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              <p className="mt-1.5 text-xs text-gray-400">
                Columns required: transactionDate, type (CREDIT/DEBIT), amount, narration, referenceNumber (optional).
              </p>
            </div>

            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-ink hover:bg-gray-50"
              >
                Cancel
              </button>
              <div className="w-32">
                <Button type="button" loading={importing} onClick={handleImport}>
                  Import
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <p className="rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-700">
              {result.importedCount} transaction(s) imported successfully.
            </p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border border-gray-100 px-3 py-2">
                <p className="text-xs text-gray-400">Total Credit</p>
                <p className="font-medium text-ink">{formatINR(result.totalCredit)}</p>
              </div>
              <div className="rounded-lg border border-gray-100 px-3 py-2">
                <p className="text-xs text-gray-400">Total Debit</p>
                <p className="font-medium text-ink">{formatINR(result.totalDebit)}</p>
              </div>
              <div className="rounded-lg border border-gray-100 px-3 py-2">
                <p className="text-xs text-gray-400">Previous Balance</p>
                <p className="font-medium text-ink">{formatINR(result.previousBalance)}</p>
              </div>
              <div className="rounded-lg border border-gray-100 px-3 py-2">
                <p className="text-xs text-gray-400">New Balance</p>
                <p className="font-medium text-ink">{formatINR(result.newBalance)}</p>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleDone}
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
