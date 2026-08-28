import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { FileText, CheckCircle2, Clock, IndianRupee, Search, Plus, MoreVertical } from "lucide-react";
import StatCard from "../../components/ui/StatCard";
import StatusBadge from "../../components/ui/StatusBadge";
import CreateQuotationDrawer from "../../components/quotations/CreateQuotationDrawer";
import QuotationRowMenu from "../../components/quotations/QuotationRowMenu";
import { getQuotationStatsApi, getQuotationsApi } from "../../api/quotation.api";

const formatINR = (value) => `₹${Number(value ?? 0).toLocaleString("en-IN")}`;
const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

export default function QuotationsPage() {
  const location = useLocation();
  const [stats, setStats] = useState(null);
  const [quotations, setQuotations] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(Boolean(location.state?.openCreate));
  const [duplicateFrom, setDuplicateFrom] = useState(null);
  const prefillCustomerId = location.state?.prefillCustomerId;
  const [error, setError] = useState("");

  const refresh = useCallback(() => {
    getQuotationStatsApi().then(setStats).catch((err) => setError(err.message));
    getQuotationsApi({ search, status: status || undefined }).then((result) => {
      setQuotations(result.quotations);
      setPagination(result.pagination);
    }).catch((err) => setError(err.message));
  }, [search, status]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Quotations</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create, send and track quotations, then convert approved ones into invoices.
          </p>
        </div>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard icon={FileText} label="Total Quotations" value={stats?.totalQuotations ?? "—"} />
        <StatCard icon={CheckCircle2} label="Approved" value={stats?.approved ?? "—"} />
        <StatCard icon={Clock} label="Awaiting Response" value={stats?.awaitingResponse ?? "—"} />
        <StatCard icon={IndianRupee} label="Pipeline Value" value={formatINR(stats?.pipelineValue)} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex min-w-[200px] flex-1 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm">
          <Search size={16} className="text-gray-400" />
          <input
            className="w-full outline-none placeholder:text-gray-400"
            placeholder="Search by quotation no. or customer…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">all</option>
          {["DRAFT", "SENT", "APPROVED", "REJECTED", "EXPIRED", "CONVERTED"].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => {
            setDuplicateFrom(null);
            setDrawerOpen(true);
          }}
          className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          <Plus size={16} /> Create Quotation
        </button>
      </div>

      <div className="overflow-x-auto overflow-y-visible rounded-2xl border border-gray-100 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs uppercase text-gray-400">
              <th className="px-4 py-3 font-medium">Quotation #</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Valid Until</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {quotations.map((q) => (
              <tr key={q._id} className="border-b border-gray-50 last:border-0">
                <td className="px-4 py-3 font-medium text-ink">{q.quotationNumber}</td>
                <td className="px-4 py-3 text-ink">{q.customer?.customerName ?? "—"}</td>
                <td className="px-4 py-3 text-gray-500">{formatDate(q.quotationDate)}</td>
                <td className="px-4 py-3 text-gray-500">{formatDate(q.validUntil)}</td>
                <td className="px-4 py-3 text-ink">{formatINR(q.total)}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={q.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <QuotationRowMenu
                    quotation={q}
                    onChanged={refresh}
                    onDuplicate={(full) => {
                      setDuplicateFrom(full);
                      setDrawerOpen(true);
                    }}
                  />
                </td>
              </tr>
            ))}
            {quotations.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-400">
                  No quotations found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <p className="text-sm text-gray-400">
          Showing {quotations.length} of {pagination.total} quotations
        </p>
      )}

      <CreateQuotationDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onCreated={refresh}
        duplicateFrom={duplicateFrom}
        prefillCustomerId={!duplicateFrom ? prefillCustomerId : undefined}
      />
    </div>
  );
}
