import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Receipt,
  Wallet,
  TrendingUp,
  Percent,
  Landmark,
  Clock,
  FilePlus,
  ReceiptText,
  Package,
  UserPlus,
  Banknote,
} from "lucide-react";
import StatCard from "../../components/ui/StatCard";
import RevenueTrendChart from "../../components/charts/RevenueTrendChart";
import PaymentDistributionDonut from "../../components/charts/PaymentDistributionDonut";
import TopProductsBarChart from "../../components/charts/TopProductsBarChart";
import { getDashboardApi } from "../../api/dashboard.api";

const formatINR = (value) =>
  `₹${(Number(value ?? 0) / 100000).toLocaleString("en-IN", { maximumFractionDigits: 2 })} L`;

const formatRelativeTime = (dateStr) => {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hrs ago`;
  return `${Math.round(hrs / 24)} days ago`;
};

const ACTIVITY_ICON = {
  INVOICE: ReceiptText,
  PAYMENT: Banknote,
  QUOTATION: FileText,
  BANK_TRANSACTION: Landmark,
};

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getDashboardApi()
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>;
  }

  if (!data) {
    return <p className="text-sm text-gray-400">Loading dashboard…</p>;
  }

  const { summary, revenueTrend, paymentDistribution, topProducts, recentActivity } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Your financial workspace at a glance — sales, GST, banks and outstanding.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => navigate("/quotations", { state: { openCreate: true } })}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3.5 py-2 text-sm font-medium text-ink hover:bg-gray-50"
          >
            <FilePlus size={16} /> New Quotation
          </button>
          <button
            type="button"
            onClick={() => navigate("/invoices", { state: { openCreate: "direct" } })}
            className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            <Receipt size={16} /> New Invoice
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatCard icon={TrendingUp} label="Today's Sales" value={formatINR(summary.todaySales)} />
        <StatCard icon={Wallet} label="Monthly Revenue" value={formatINR(summary.monthlyRevenue)} />
        <StatCard icon={Clock} label="Outstanding" value={formatINR(summary.outstanding)} />
        <StatCard icon={Percent} label="GST Collected" value={formatINR(summary.gstCollected)} />
        <StatCard icon={Landmark} label="Total Bank Balance" value={formatINR(summary.totalBankBalance)} />
        <StatCard icon={Receipt} label="Pending Invoices" value={summary.pendingInvoices} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm xl:col-span-2">
          <h2 className="text-base font-semibold text-ink">Revenue Trend</h2>
          <p className="text-sm text-gray-500">Revenue collected over the last 6 months</p>
          <div className="mt-4">
            <RevenueTrendChart data={revenueTrend} />
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-ink">Payment Distribution</h2>
          <p className="text-sm text-gray-500">By collection mode</p>
          <div className="mt-4">
            <PaymentDistributionDonut data={paymentDistribution} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm xl:col-span-2">
          <h2 className="text-base font-semibold text-ink">Top Products</h2>
          <p className="text-sm text-gray-500">Highest revenue this month</p>
          <div className="mt-4">
            <TopProductsBarChart data={topProducts} />
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-ink">Quick Actions</h2>
          <div className="mt-4 space-y-2">
            <QuickAction icon={FileText} label="Create Quotation" onClick={() => navigate("/quotations", { state: { openCreate: true } })} />
            <QuickAction icon={Receipt} label="Create Invoice" onClick={() => navigate("/invoices", { state: { openCreate: "direct" } })} />
            <QuickAction icon={Package} label="Add Product" onClick={() => navigate("/products", { state: { openCreate: true } })} />
            <QuickAction icon={UserPlus} label="Add Customer" onClick={() => navigate("/customers", { state: { openCreate: true } })} />
            <QuickAction icon={Banknote} label="Record Payment" onClick={() => navigate("/payments", { state: { openCreate: true } })} />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-ink">Recent Activity</h2>
        <div className="mt-3 divide-y divide-gray-50">
          {recentActivity.length === 0 && (
            <p className="py-6 text-center text-sm text-gray-400">No recent activity yet.</p>
          )}
          {recentActivity.map((activity, i) => {
            const Icon = ACTIVITY_ICON[activity.type] ?? FileText;
            return (
              <div key={i} className="flex items-center justify-between gap-3 py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                    <Icon size={16} />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-ink">{activity.title}</p>
                    <p className="text-xs text-gray-400">{activity.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-ink">
                    ₹{Number(activity.amount ?? 0).toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs text-gray-400">{formatRelativeTime(activity.date)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function QuickAction({ icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2.5 rounded-lg border border-gray-100 px-3 py-2.5 text-sm text-ink hover:bg-gray-50"
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-50 text-brand-600">
        <Icon size={14} />
      </span>
      {label}
    </button>
  );
}
