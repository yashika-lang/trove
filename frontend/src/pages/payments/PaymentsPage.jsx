import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Wallet, CheckCircle2, Clock, XCircle, Search, Plus } from "lucide-react";
import StatCard from "../../components/ui/StatCard";
import StatusBadge from "../../components/ui/StatusBadge";
import RecordPaymentDrawer from "../../components/payments/RecordPaymentDrawer";
import PaymentRowMenu from "../../components/payments/PaymentRowMenu";
import { getPaymentStatsApi, getPaymentsApi } from "../../api/payment.api";

const formatINR = (value) => `₹${Number(value ?? 0).toLocaleString("en-IN")}`;
const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

const MODE_LABELS = {
  CASH: "Cash",
  UPI: "UPI",
  CREDIT_CARD: "Credit Card",
  DEBIT_CARD: "Debit Card",
  WALLET: "Wallet",
  BANK_TRANSFER: "Bank Transfer",
};

export default function PaymentsPage() {
  const location = useLocation();
  const [stats, setStats] = useState(null);
  const [payments, setPayments] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState("");
  const [status, setStatus] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(Boolean(location.state?.openCreate));
  const [error, setError] = useState("");

  const prefillCustomerId = location.state?.prefillCustomerId;

  const refresh = useCallback(() => {
    getPaymentStatsApi().then(setStats).catch((err) => setError(err.message));
    getPaymentsApi({ search, paymentMode: mode || undefined, status: status || undefined })
      .then((result) => {
        setPayments(result.payments);
        setPagination(result.pagination);
      })
      .catch((err) => setError(err.message));
  }, [search, mode, status]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Payments</h1>
        <p className="mt-1 text-sm text-gray-500">
          Record and reconcile customer payments across cash, UPI, cards, wallets and bank transfers.
        </p>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard icon={Wallet} label="Total Payments" value={stats?.totalPayments ?? "—"} />
        <StatCard icon={CheckCircle2} label="Collected" value={formatINR(stats?.collected)} />
        <StatCard icon={Clock} label="Pending / Partial" value={formatINR(stats?.pendingPartial)} />
        <StatCard icon={XCircle} label="Failed" value={stats?.failed ?? "—"} />
      </div>

      <div className="flex items-center gap-3">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm">
          <Search size={16} className="text-gray-400" />
          <input
            className="w-full outline-none placeholder:text-gray-400"
            placeholder="Search by payment no., customer, invoice, UTR or reference…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
          value={mode}
          onChange={(e) => setMode(e.target.value)}
        >
          <option value="">All modes</option>
          {Object.entries(MODE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="PAID">Paid</option>
          <option value="PENDING">Pending</option>
          <option value="PARTIALLY_PAID">Partially Paid</option>
          <option value="FAILED">Failed</option>
          <option value="REFUNDED">Refunded</option>
        </select>
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          <Plus size={16} /> Record Payment
        </button>
      </div>

      <div className="overflow-x-auto overflow-y-visible rounded-2xl border border-gray-100 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs uppercase text-gray-400">
              <th className="px-4 py-3 font-medium">Payment #</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Invoice</th>
              <th className="px-4 py-3 font-medium">Mode</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p._id} className="border-b border-gray-50 last:border-0">
                <td className="px-4 py-3 font-medium text-ink">{p.paymentNumber}</td>
                <td className="px-4 py-3 text-ink">{p.customer?.customerName ?? "—"}</td>
                <td className="px-4 py-3 text-gray-500">{p.invoice?.invoiceNumber ?? "On account"}</td>
                <td className="px-4 py-3 text-gray-500">{MODE_LABELS[p.paymentMode] ?? p.paymentMode}</td>
                <td className="px-4 py-3 text-gray-500">{formatDate(p.paymentDate)}</td>
                <td className="px-4 py-3 text-ink">{formatINR(p.amount)}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={p.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <PaymentRowMenu payment={p} onChanged={refresh} />
                </td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-400">
                  No payments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <p className="text-sm text-gray-400">
          Showing {payments.length} of {pagination.total} payments
        </p>
      )}

      <RecordPaymentDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onCreated={refresh}
        prefillCustomerId={prefillCustomerId}
      />
    </div>
  );
}
