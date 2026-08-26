import { useCallback, useEffect, useState } from "react";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Landmark,
  Search,
  Upload,
  RefreshCw,
  Plus,
  Download,
  CheckCircle2,
  Circle,
} from "lucide-react";
import StatCard from "../../components/ui/StatCard";
import BankAccountCard from "../../components/bank/BankAccountCard";
import AddBankDrawer from "../../components/bank/AddBankDrawer";
import ManualEntryDrawer from "../../components/bank/ManualEntryDrawer";
import ImportCsvModal from "../../components/bank/ImportCsvModal";
import ReconcileModal from "../../components/bank/ReconcileModal";
import { getBankDashboardApi } from "../../api/bankDashboard.api";
import { exportBankTransactionsApi } from "../../api/bankTransaction.api";
import { downloadBlob } from "../../utils/download";
import { maskAccountNumber } from "../../utils/maskAccountNumber";

const formatINR = (value) => `₹${Number(value ?? 0).toLocaleString("en-IN")}`;
const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

export default function BankDashboardPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [reconciliationStatus, setReconciliationStatus] = useState("");
  const [page, setPage] = useState(1);

  const [addBankOpen, setAddBankOpen] = useState(false);
  const [manualEntryOpen, setManualEntryOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [reconcileTarget, setReconcileTarget] = useState(null);

  const refresh = useCallback(() => {
    getBankDashboardApi({
      bankAccount: selectedBank || undefined,
      search: search || undefined,
      type: type || undefined,
      reconciliationStatus: reconciliationStatus || undefined,
      page,
      limit: 10,
    })
      .then(setData)
      .catch((err) => setError(err.message));
  }, [selectedBank, search, type, reconciliationStatus, page]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleExport = async () => {
    try {
      const blob = await exportBankTransactionsApi({
        bankAccount: selectedBank || undefined,
        type: type || undefined,
        reconciliationStatus: reconciliationStatus || undefined,
        search: search || undefined,
      });
      downloadBlob(blob, "bank-transactions.csv");
    } catch (err) {
      setError(err.message);
    }
  };

  const accounts = data?.accounts ?? [];
  const transactions = data?.recentTransactions ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Bank Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track balances, transactions and reconciliation across all connected bank accounts.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAddBankOpen(true)}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-ink hover:bg-gray-50"
        >
          <Plus size={16} /> Add Bank
        </button>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard icon={Wallet} label="Total Balance" value={formatINR(data?.totalBalance)} />
        <StatCard icon={ArrowUpRight} label="Today's Credit" value={formatINR(data?.todayCredit)} />
        <StatCard icon={ArrowDownRight} label="Today's Debit" value={formatINR(data?.todayDebit)} />
        <StatCard icon={Landmark} label="Bank Count" value={data?.bankCount ?? "—"} />
      </div>

      {accounts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center">
          <p className="text-sm text-gray-500">No bank accounts yet.</p>
          <button
            type="button"
            onClick={() => setAddBankOpen(true)}
            className="mt-3 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Add your first bank account
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {accounts.map((account) => (
            <BankAccountCard
              key={account._id}
              account={account}
              selected={selectedBank === account._id}
              onSelect={() => {
                setSelectedBank((current) => (current === account._id ? "" : account._id));
                setPage(1);
              }}
            />
          ))}
        </div>
      )}

      <div className="rounded-2xl border border-gray-100 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-4 py-4">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-ink">Transactions</h2>
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-600">
              {data?.unreconciledCount ?? 0} unreconciled
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm">
              <Search size={14} className="text-gray-400" />
              <input
                className="w-40 outline-none placeholder:text-gray-400"
                placeholder="Search narration, ref…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <select
              className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm"
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All types</option>
              <option value="CREDIT">Credit</option>
              <option value="DEBIT">Debit</option>
            </select>
            <select
              className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm"
              value={reconciliationStatus}
              onChange={(e) => {
                setReconciliationStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All</option>
              <option value="RECONCILED">Reconciled</option>
              <option value="UNRECONCILED">Unreconciled</option>
            </select>
            <button
              type="button"
              onClick={handleExport}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-ink hover:bg-gray-50"
            >
              <Download size={14} /> Export
            </button>
            <button
              type="button"
              onClick={() => setImportOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-ink hover:bg-gray-50"
            >
              <Upload size={14} /> Import CSV
            </button>
            <button
              type="button"
              onClick={() => {
                setReconciliationStatus("UNRECONCILED");
                setPage(1);
              }}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-ink hover:bg-gray-50"
              title="Filter to unreconciled transactions"
            >
              <RefreshCw size={14} /> Reconcile
            </button>
            <button
              type="button"
              onClick={() => setManualEntryOpen(true)}
              disabled={accounts.length === 0}
              className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus size={14} /> Manual Entry
            </button>
          </div>
        </div>

        <div className="overflow-x-auto overflow-y-visible">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs uppercase text-gray-400">
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Bank</th>
                <th className="px-4 py-3 font-medium">Narration</th>
                <th className="px-4 py-3 font-medium">Credit</th>
                <th className="px-4 py-3 font-medium">Debit</th>
                <th className="px-4 py-3 font-medium">Balance</th>
                <th className="px-4 py-3 font-medium text-center">Reconcile</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t._id} className="border-b border-gray-50 last:border-0">
                  <td className="px-4 py-3 text-gray-500">{formatDate(t.date)}</td>
                  <td className="px-4 py-3 text-ink">
                    {t.bank?.bankName}
                    <span className="ml-1 text-xs text-gray-400">
                      {maskAccountNumber(t.bank?.accountNumber)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{t.narration}</td>
                  <td className="px-4 py-3 text-brand-600">{t.credit > 0 ? formatINR(t.credit) : "—"}</td>
                  <td className="px-4 py-3 text-red-500">{t.debit > 0 ? formatINR(t.debit) : "—"}</td>
                  <td className="px-4 py-3 text-ink">{t.balance != null ? formatINR(t.balance) : "—"}</td>
                  <td className="px-4 py-3 text-center">
                    {t.reconciliationStatus === "RECONCILED" ? (
                      <span className="inline-flex items-center text-brand-600" title="Reconciled">
                        <CheckCircle2 size={18} />
                      </span>
                    ) : t.credit > 0 ? (
                      <button
                        type="button"
                        onClick={() => setReconcileTarget(t)}
                        className="inline-flex items-center text-gray-300 hover:text-brand-600"
                        title="Reconcile with a customer payment"
                      >
                        <Circle size={18} />
                      </button>
                    ) : (
                      <span
                        className="inline-flex items-center text-gray-200"
                        title="Debit transactions are not matched to customer payments"
                      >
                        <Circle size={18} />
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-400">
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {data?.transactionPagination && (
          <div className="flex items-center justify-between border-t border-gray-50 px-4 py-3 text-sm text-gray-400">
            <span>
              Showing {transactions.length} of {data.transactionPagination.total} transactions
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-gray-200 px-2.5 py-1 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Prev
              </button>
              <button
                type="button"
                disabled={page >= data.transactionPagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-gray-200 px-2.5 py-1 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <AddBankDrawer open={addBankOpen} onClose={() => setAddBankOpen(false)} onCreated={refresh} />
      <ManualEntryDrawer
        open={manualEntryOpen}
        onClose={() => setManualEntryOpen(false)}
        onCreated={refresh}
        accounts={accounts}
        defaultBankAccount={selectedBank}
      />
      <ImportCsvModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImported={refresh}
        accounts={accounts}
        defaultBankAccount={selectedBank}
      />
      <ReconcileModal
        open={Boolean(reconcileTarget)}
        onClose={() => setReconcileTarget(null)}
        transaction={reconcileTarget}
        onReconciled={refresh}
      />
    </div>
  );
}
