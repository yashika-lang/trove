import { useEffect, useState } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { getGSTTransactionsApi } from "../../../api/gst.api";

const TABS = [
  { key: "ALL", label: "All" },
  { key: "OUTWARD", label: "Outward" },
  { key: "INWARD", label: "Inward" },
];

const formatINR = (value) => `₹${Number(value ?? 0).toLocaleString("en-IN")}`;
const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export default function GSTTransactionsView() {
  const [tab, setTab] = useState("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    const handle = setTimeout(() => {
      getGSTTransactionsApi({ type: tab, search: search.trim() || undefined, page, limit: 20 })
        .then(setResult)
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(handle);
  }, [tab, search, page]);

  const entries = result?.entries ?? [];
  const pagination = result?.pagination;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-ink">GST Transactions</h2>
        <p className="mt-1 text-sm text-gray-500">Every outward and inward transaction driving your GST figures.</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-lg border border-gray-200 bg-white p-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => {
                setTab(t.key);
                setPage(1);
              }}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                tab === t.key ? "bg-brand-600 text-white" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm">
          <Search size={14} className="text-gray-400" />
          <input
            className="w-56 outline-none placeholder:text-gray-400"
            placeholder="Search document, GSTIN, party…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

      <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-gray-100 text-xs uppercase text-gray-400">
            <tr>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Document</th>
              <th className="px-4 py-3 font-medium">Party</th>
              <th className="px-4 py-3 font-medium">GSTIN</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Rate</th>
              <th className="px-4 py-3 text-right font-medium">Taxable</th>
              <th className="px-4 py-3 text-right font-medium">CGST</th>
              <th className="px-4 py-3 text-right font-medium">SGST</th>
              <th className="px-4 py-3 text-right font-medium">IGST</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading &&
              [0, 1, 2, 3].map((i) => (
                <tr key={i}>
                  <td colSpan={10} className="px-4 py-3">
                    <div className="h-4 animate-pulse rounded bg-gray-50" />
                  </td>
                </tr>
              ))}
            {!loading && entries.length === 0 && (
              <tr>
                <td colSpan={10} className="px-4 py-10 text-center text-sm text-gray-400">
                  No GST transactions found.
                </td>
              </tr>
            )}
            {!loading &&
              entries.map((tx) => (
                <tr key={tx._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-600">{formatDate(tx.date)}</td>
                  <td className="px-4 py-3 font-medium text-ink">{tx.documentNumber}</td>
                  <td className="px-4 py-3 text-gray-600">{tx.type === "OUTWARD" ? tx.customer?.customerName ?? "—" : tx.supplierName || "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{tx.gstin || "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        tx.type === "OUTWARD" ? "bg-brand-50 text-brand-700" : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {tx.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{tx.taxRate}%</td>
                  <td className="px-4 py-3 text-right text-gray-600">{formatINR(tx.taxableAmount)}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{formatINR(tx.cgst)}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{formatINR(tx.sgst)}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{formatINR(tx.igst)}</td>
                </tr>
              ))}
          </tbody>
        </table>

        {pagination && (
          <div className="flex items-center justify-between border-t border-gray-50 px-4 py-3 text-sm text-gray-500">
            <span>
              {pagination.total} transaction(s) · Page {pagination.page} of {Math.max(pagination.totalPages, 1)}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 disabled:opacity-40"
              >
                <ChevronLeft size={14} /> Prev
              </button>
              <button
                type="button"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 disabled:opacity-40"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
