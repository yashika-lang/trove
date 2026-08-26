import { Lock } from "lucide-react";

// Unlike Bank Dashboard/Cash/GST, there is no Supplier entity, model, or API
// anywhere in the backend — Trove currently only tracks receivables (customer
// invoices/payments), not payables. Rather than fabricate a Supplier Ledger
// UI backed by fake numbers, this stays a locked placeholder with zero stats
// until a real Supplier/Purchase module exists to back it.
export default function SupplierLedgerFuture() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-gray-200 bg-white py-20 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
        <Lock size={20} />
      </span>
      <h2 className="text-base font-semibold text-ink">Supplier Ledger — Coming Soon</h2>
      <p className="max-w-sm text-sm text-gray-500">
        Trove doesn't yet have a Supplier or Purchases module on the backend, so there is no real
        payables data to show here. This ledger will unlock once supplier accounts and purchase
        bills are supported.
      </p>
    </div>
  );
}
