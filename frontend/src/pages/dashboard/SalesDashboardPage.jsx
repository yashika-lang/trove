import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  FileText,
  CheckCircle2,
  Receipt,
  Clock,
  AlertCircle,
  UserPlus,
  Banknote,
  ReceiptText,
} from "lucide-react";
import StatCard from "../../components/ui/StatCard";
import RevenueTrendChart from "../../components/charts/RevenueTrendChart";
import {
  getSalesSummaryApi,
  getSalesMonthlyPerformanceApi,
  getSalesFollowUpsApi,
  getSalesRecentCustomersApi,
  getSalesActivityApi,
} from "../../api/salesDashboard.api";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const formatINR = (value) => `₹${Number(value ?? 0).toLocaleString("en-IN")}`;
const formatLakh = (value) =>
  `₹${(Number(value ?? 0) / 100000).toLocaleString("en-IN", { maximumFractionDigits: 2 })} L`;

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const formatRelativeTime = (dateStr) => {
  const mins = Math.round((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hrs ago`;
  return `${Math.round(hrs / 24)} days ago`;
};

const ACTIVITY_ICON = {
  INVOICE: ReceiptText,
  QUOTATION: FileText,
  PAYMENT: Banknote,
};

function initialsOf(name) {
  if (!name) return "?";
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

// Red = overdue/due today, amber = due within 3 days, green = further out.
function followUpPriority(dueDate) {
  const days = Math.ceil((new Date(dueDate).getTime() - Date.now()) / 86400000);
  if (days <= 0) return { color: "text-red-500 bg-red-50", label: days === 0 ? "Due Today" : "Overdue" };
  if (days <= 3) return { color: "text-amber-500 bg-amber-50", label: `Due In ${days} days` };
  return { color: "text-brand-600 bg-brand-50", label: `Due In ${days} days` };
}

export default function SalesDashboardPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [performance, setPerformance] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [recentCustomers, setRecentCustomers] = useState([]);
  const [activity, setActivity] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      getSalesSummaryApi(),
      getSalesMonthlyPerformanceApi(),
      getSalesFollowUpsApi(),
      getSalesRecentCustomersApi(),
      getSalesActivityApi(),
    ])
      .then(([s, perf, fu, customers, act]) => {
        setSummary(s);
        setPerformance(perf.map((p) => ({ ...p, month: MONTHS[p.month - 1] ?? p.month })));
        setFollowUps(fu);
        setRecentCustomers(customers);
        setActivity(act);
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
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Your sales performance dashboard — track quotations, invoices, and revenue.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => navigate("/quotations", { state: { openCreate: true } })}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3.5 py-2 text-sm font-medium text-ink hover:bg-gray-50"
          >
            <FileText size={16} /> New Quotation
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

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        <StatCard icon={TrendingUp} label="Personal Sales Revenue" value={formatLakh(summary.personalSalesRevenue)} />
        <StatCard icon={FileText} label="Quotations Created" value={summary.quotationsCreated} />
        <StatCard icon={CheckCircle2} label="Quotations Converted" value={summary.quotationsConverted} />
        <StatCard icon={Receipt} label="Invoices Created" value={summary.invoicesCreated} />
        <StatCard icon={Clock} label="Pending Customer Payments" value={formatLakh(summary.pendingCustomerPayments)} />
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-ink">Monthly Sales Performance</h2>
        <p className="text-sm text-gray-500">Your sales revenue over the last 6 months</p>
        <div className="mt-4">
          <RevenueTrendChart data={performance} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-brand-600" />
            <h2 className="text-base font-semibold text-ink">Follow-ups Due</h2>
          </div>
          <p className="text-sm text-gray-500">Customer payments awaiting your follow-up</p>
          <div className="mt-3 divide-y divide-gray-50">
            {followUps.length === 0 && (
              <p className="py-6 text-center text-sm text-gray-400">No follow-ups due.</p>
            )}
            {followUps.map((fu) => {
              const priority = followUpPriority(fu.dueDate);
              return (
                <div key={fu.invoiceId} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex items-center gap-3">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-full ${priority.color}`}>
                      <AlertCircle size={15} />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-ink">{fu.customer}</p>
                      <p className="text-xs text-gray-400">{fu.invoiceNumber} · {priority.label}</p>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-ink">{formatINR(fu.amount)}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserPlus size={16} className="text-brand-600" />
              <h2 className="text-base font-semibold text-ink">Recent Customers</h2>
            </div>
          </div>
          <p className="text-sm text-gray-500">Customers you recently added</p>
          <div className="mt-3 divide-y divide-gray-50">
            {recentCustomers.length === 0 && (
              <p className="py-6 text-center text-sm text-gray-400">No customers added yet.</p>
            )}
            {recentCustomers.map((c) => (
              <div key={c._id} className="flex items-center justify-between gap-3 py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                    {initialsOf(c.customerName)}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-ink">{c.customerName}</p>
                    <p className="text-xs text-gray-400">{c.contactPerson} · Added {formatRelativeTime(c.createdAt)}</p>
                  </div>
                </div>
                <p className="text-sm font-medium text-ink">{formatINR(c.outstanding)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm xl:col-span-2">
          <h2 className="text-base font-semibold text-ink">Personal Activity Timeline</h2>
          <div className="mt-3 divide-y divide-gray-50">
            {activity.length === 0 && (
              <p className="py-6 text-center text-sm text-gray-400">No recent activity yet.</p>
            )}
            {activity.map((a, i) => {
              const Icon = ACTIVITY_ICON[a.type] ?? FileText;
              return (
                <div key={i} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                      <Icon size={16} />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-ink">{a.title}</p>
                      <p className="text-xs text-gray-400">{a.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-ink">{formatINR(a.amount)}</p>
                    <p className="text-xs text-gray-400">{formatRelativeTime(a.date)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-ink">Quick Actions</h2>
          <div className="mt-4 space-y-2">
            <QuickAction icon={FileText} label="Create Quotation" onClick={() => navigate("/quotations", { state: { openCreate: true } })} />
            <QuickAction icon={Receipt} label="Create Invoice" onClick={() => navigate("/invoices", { state: { openCreate: "direct" } })} />
            <QuickAction icon={UserPlus} label="Add Customer" onClick={() => navigate("/customers", { state: { openCreate: true } })} />
            <QuickAction icon={Banknote} label="Record Payment" onClick={() => navigate("/payments", { state: { openCreate: true } })} />
          </div>
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
