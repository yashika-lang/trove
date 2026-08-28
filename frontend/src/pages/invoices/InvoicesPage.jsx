import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { FileText, CheckCircle2, IndianRupee, AlertTriangle, Search } from "lucide-react";
import StatCard from "../../components/ui/StatCard";
import StatusBadge from "../../components/ui/StatusBadge";
import InvoiceRowMenu from "../../components/invoices/InvoiceRowMenu";
import CreateInvoiceMenu from "../../components/invoices/CreateInvoiceMenu";
import CreateInvoiceDrawer from "../../components/invoices/CreateInvoiceDrawer";
import FromQuotationModal from "../../components/invoices/FromQuotationModal";
import { useAuth } from "../../context/AuthContext";
import { getInvoiceStatsApi, getInvoicesApi } from "../../api/invoice.api";

const formatINR = (value) => `₹${Number(value ?? 0).toLocaleString("en-IN")}`;
const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

const STATUSES = ["DRAFT", "GENERATED", "PENDING", "PARTIALLY_PAID", "PAID", "OVERDUE", "CANCELLED"];

export default function InvoicesPage() {
  const { user } = useAuth();
  const location = useLocation();
  const canCreate = user?.role === "Admin" || user?.role === "Sales";

  const [stats, setStats] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(
    canCreate && location.state?.openCreate === "direct"
  );
  const [fromQuotationOpen, setFromQuotationOpen] = useState(
    canCreate && location.state?.openCreate === "fromQuotation"
  );
  const prefillCustomerId = location.state?.prefillCustomerId;
  const [error, setError] = useState("");

  const refresh = useCallback(() => {
    getInvoiceStatsApi().then(setStats).catch((err) => setError(err.message));
    getInvoicesApi({ search, status: status || undefined })
      .then((result) => {
        setInvoices(result.invoices);
        setPagination(result.pagination);
      })
      .catch((err) => setError(err.message));
  }, [search, status]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Invoices</h1>
          <p className="mt-1 text-sm text-gray-500">
            Raise direct invoices or generate them from quotations, then track payments and adjustments.
          </p>
        </div>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard icon={FileText} label="Total Invoices" value={stats?.totalInvoices ?? "—"} />
        <StatCard icon={CheckCircle2} label="Paid" value={stats?.paid ?? "—"} />
        <StatCard icon={IndianRupee} label="Outstanding" value={formatINR(stats?.outstanding)} />
        <StatCard icon={AlertTriangle} label="Overdue" value={stats?.overdue ?? "—"} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex min-w-[200px] flex-1 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm">
          <Search size={16} className="text-gray-400" />
          <input
            className="w-full outline-none placeholder:text-gray-400"
            placeholder="Search by invoice no., customer or quotation…"
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
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        {canCreate && (
          <CreateInvoiceMenu
            onDirect={() => setDrawerOpen(true)}
            onFromQuotation={() => setFromQuotationOpen(true)}
          />
        )}
      </div>

      <div className="overflow-x-auto overflow-y-visible rounded-2xl border border-gray-100 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs uppercase text-gray-400">
              <th className="px-4 py-3 font-medium">Invoice #</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Source</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Due Date</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv._id} className="border-b border-gray-50 last:border-0">
                <td className="px-4 py-3 font-medium text-ink">{inv.invoiceNumber}</td>
                <td className="px-4 py-3 text-ink">{inv.customer?.customerName ?? "—"}</td>
                <td className="px-4 py-3 text-gray-500">
                  {inv.quotation ? (
                    <span className="inline-flex items-center gap-1">
                      <FileText size={12} /> {inv.quotation.quotationNumber}
                    </span>
                  ) : (
                    "Direct"
                  )}
                </td>
                <td className="px-4 py-3 text-gray-500">{formatDate(inv.invoiceDate)}</td>
                <td className="px-4 py-3 text-gray-500">{formatDate(inv.dueDate)}</td>
                <td className="px-4 py-3 text-ink">{formatINR(inv.total)}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={inv.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <InvoiceRowMenu invoice={inv} />
                </td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-400">
                  No invoices found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <p className="text-sm text-gray-400">
          Showing {invoices.length} of {pagination.total} invoices
        </p>
      )}

      <CreateInvoiceDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onCreated={refresh}
        prefillCustomerId={prefillCustomerId}
      />
      <FromQuotationModal
        open={fromQuotationOpen}
        onClose={() => setFromQuotationOpen(false)}
        onCreated={refresh}
      />
    </div>
  );
}
