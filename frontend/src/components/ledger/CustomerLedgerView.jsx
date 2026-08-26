import { useCallback, useEffect, useState } from "react";
import { Search, Download, TrendingDown, TrendingUp, Scale, ListOrdered } from "lucide-react";
import StatCard from "../ui/StatCard";
import { getCompanyLedgerApi, exportCompanyLedgerApi } from "../../api/ledger.api";
import { downloadBlob } from "../../utils/download";

const formatINR = (value) => `₹${Number(value ?? 0).toLocaleString("en-IN")}`;
const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

export default function CustomerLedgerView() {
  const [data, setData] = useState(null);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");

  const refresh = useCallback(() => {
    getCompanyLedgerApi({ search: search || undefined, type: type || undefined, page, limit: 10 })
      .then(setData)
      .catch((err) => setError(err.message));
  }, [search, type, page]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleExport = async () => {
    try {
      const blob = await exportCompanyLedgerApi({ search: search || undefined, type: type || undefined });
      downloadBlob(blob, "customer-ledger.csv");
    } catch (err) {
      setError(err.message);
    }
  };

  const entries = data?.entries ?? [];

  return (
    <div className="space-y-4">
      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard icon={TrendingUp} label="Total Debit" value={formatINR(data?.totalDebit)} />
        <StatCard icon={TrendingDown} label="Total Credit" value={formatINR(data?.totalCredit)} />
        <StatCard icon={Scale} label="Closing Balance" value={formatINR(data?.closingBalance)} />
        <StatCard icon={ListOrdered} label="Entries" value={data?.entriesCount ?? "—"} />
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-4 py-4">
          <div>
            <h2 className="text-sm font-semibold text-ink">Customer Ledger</h2>
            <p className="text-xs text-gray-400">
              Opening balance {formatINR(data?.openingBalance)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm">
              <Search size={14} className="text-gray-400" />
              <input
                className="w-44 outline-none placeholder:text-gray-400"
                placeholder="Search particular, reference…"
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
              <option value="">All entries</option>
              <option value="DEBIT">Debit</option>
              <option value="CREDIT">Credit</option>
            </select>
            <button
              type="button"
              onClick={handleExport}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-ink hover:bg-gray-50"
            >
              <Download size={14} /> Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto overflow-y-visible">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs uppercase text-gray-400">
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Particular</th>
                <th className="px-4 py-3 font-medium">Account</th>
                <th className="px-4 py-3 font-medium">Debit</th>
                <th className="px-4 py-3 font-medium">Credit</th>
                <th className="px-4 py-3 font-medium">Balance</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={`${entry.source}-${entry.sourceId}`} className="border-b border-gray-50 last:border-0">
                  <td className="px-4 py-3 text-gray-500">{formatDate(entry.date)}</td>
                  <td className="px-4 py-3 text-ink">{entry.particular}</td>
                  <td className="px-4 py-3 text-gray-500">{entry.account}</td>
                  <td className="px-4 py-3 text-ink">{entry.debit > 0 ? formatINR(entry.debit) : "—"}</td>
                  <td className="px-4 py-3 text-ink">{entry.credit > 0 ? formatINR(entry.credit) : "—"}</td>
                  <td className="px-4 py-3 font-medium text-ink">{formatINR(entry.balance)}</td>
                </tr>
              ))}
              {entries.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-400">
                    No ledger entries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {data?.pagination && (
          <div className="flex items-center justify-between border-t border-gray-50 px-4 py-3 text-sm text-gray-400">
            <span>
              Showing {entries.length} of {data.pagination.total} entries
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
                disabled={page >= data.pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-gray-200 px-2.5 py-1 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
