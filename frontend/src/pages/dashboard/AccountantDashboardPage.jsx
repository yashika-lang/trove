import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wallet,
  CreditCard,
  Clock,
  Percent,
  Receipt,
  Landmark,
  Banknote,
  BookOpen,
  FileText,
  ReceiptText,
} from "lucide-react";
import StatCard from "../../components/ui/StatCard";
import RevenueTrendChart from "../../components/charts/RevenueTrendChart";
import PaymentDistributionDonut from "../../components/charts/PaymentDistributionDonut";
import TopProductsBarChart from "../../components/charts/TopProductsBarChart";
import {
  getAccountantSummaryApi,
  getAccountantRevenueTrendApi,
  getAccountantPaymentDistributionApi,
  getAccountantTopProductsApi,
  getAccountantRecentActivityApi,
} from "../../api/accountantDashboard.api";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const formatINR = (value) =>
  `₹${(Number(value ?? 0) / 100000).toLocaleString("en-IN", { maximumFractionDigits: 2 })} L`;

const formatRelativeTime = (dateStr) => {
  const mins = Math.round((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hrs ago`;
  return `${Math.round(hrs / 24)} days ago`;
};

const ACTIVITY_ICON = {
  PAYMENT: Banknote,
  GST: Percent,
  BANK: Landmark,
};

export default function AccountantDashboardPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [paymentDistribution, setPaymentDistribution] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      getAccountantSummaryApi(),
      getAccountantRevenueTrendApi(),
      getAccountantPaymentDistributionApi(),
      getAccountantTopProductsApi(),
      getAccountantRecentActivityApi(),
    ])
      .then(([s, trend, dist, products, activity]) => {
        setSummary(s);
        setRevenueTrend(trend.map((t) => ({ ...t, month: MONTHS[t.month - 1] ?? t.month })));
        setPaymentDistribution(dist);
        setTopProducts(products);
        setRecentActivity(activity);
      })
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>;
  }

  if (!summary) {
    return <p className="text-sm text-gray-400">Loading dashboard…</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Your accounting dashboard — manage finances, GST, and bank reconciliation.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatCard icon={Wallet} label="Total Receipts" value={formatINR(summary.totalReceipts)} />
        <StatCard icon={CreditCard} label="Total Payments" value={formatINR(summary.totalPayments)} />
        <StatCard icon={Clock} label="Outstanding Amount" value={formatINR(summary.outstandingAmount)} />
        <StatCard icon={Percent} label="GST Collected" value={formatINR(summary.gstCollected)} />
        <StatCard icon={Receipt} label="GST Payable" value={formatINR(summary.gstPayable)} />
        <StatCard icon={Landmark} label="Bank Balance" value={formatINR(summary.bankBalance)} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm xl:col-span-2">
          <h2 className="text-base font-semibold text-ink">Revenue Trend</h2>
          <p className="text-sm text-gray-500">Revenue and GST collected over the last 6 months</p>
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
            <QuickAction icon={Banknote} label="Record Payment" onClick={() => navigate("/payments", { state: { openCreate: true } })} />
            <QuickAction icon={BookOpen} label="View Ledger" onClick={() => navigate("/ledger")} />
            <QuickAction icon={FileText} label="GST Report" onClick={() => navigate("/reports")} />
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
            const Icon = ACTIVITY_ICON[activity.type] ?? ReceiptText;
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
