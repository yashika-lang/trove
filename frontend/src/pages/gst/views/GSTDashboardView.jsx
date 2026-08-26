import { useEffect, useState } from "react";
import { Receipt, TrendingUp, TrendingDown, Scale, FileText, Landmark } from "lucide-react";
import StatCard from "../../../components/ui/StatCard";
import { getGSTDashboardApi } from "../../../api/gst.api";

const formatINR = (value) => `₹${Number(value ?? 0).toLocaleString("en-IN")}`;

const STATUS_COLORS = {
  draft: "bg-gray-100 text-gray-600",
  generated: "bg-brand-50 text-brand-700",
  pending: "bg-amber-50 text-amber-700",
  filed: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-red-50 text-red-600",
};

export default function GSTDashboardView() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getGSTDashboardApi().then(setData).catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>;

  if (!data) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl border border-gray-100 bg-gray-50" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatCard icon={Receipt} label="Total Transactions" value={data.summary.totalTransactions} />
        <StatCard icon={FileText} label="Taxable Amount" value={formatINR(data.summary.totalTaxableAmount)} />
        <StatCard icon={Scale} label="Total GST" value={formatINR(data.summary.totalGST)} />
        <StatCard icon={TrendingUp} label="Output GST" value={formatINR(data.liability.outputGST)} sub="Outward tax collected" />
        <StatCard icon={TrendingDown} label="Input GST" value={formatINR(data.liability.inputGST)} sub="Inward tax paid (ITC)" />
        <StatCard
          icon={Landmark}
          label="Net GST Liability"
          value={formatINR(data.liability.netGST)}
          sub={data.liability.netGST >= 0 ? "Payable" : "Refundable"}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-ink">Tax Head Breakdown</h2>
          <p className="text-sm text-gray-500">Across all GST transactions</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <HeadStat label="CGST" value={data.summary.totalCGST} />
            <HeadStat label="SGST" value={data.summary.totalSGST} />
            <HeadStat label="IGST" value={data.summary.totalIGST} />
            <HeadStat label="Cess" value={data.summary.totalCess} />
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-ink">Outward vs Inward</h2>
          <p className="text-sm text-gray-500">Taxable amount and tax by direction</p>
          <div className="mt-4 space-y-3">
            <DirectionRow label="Outward (Sales)" taxable={data.outward.taxableAmount} tax={data.outward.tax} />
            <DirectionRow label="Inward (Purchases)" taxable={data.inward.taxableAmount} tax={data.inward.tax} />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-ink">Document Status</h2>
        <p className="text-sm text-gray-500">GST transaction documents by status</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {Object.entries(data.status).map(([key, count]) => (
            <span key={key} className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize ${STATUS_COLORS[key]}`}>
              {key}: {count}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function HeadStat({ label, value }) {
  return (
    <div className="rounded-xl bg-gray-50 p-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-base font-semibold text-ink">{formatINR(value)}</p>
    </div>
  );
}

function DirectionRow({ label, taxable, tax }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
      <p className="text-sm font-medium text-ink">{label}</p>
      <div className="text-right">
        <p className="text-sm font-semibold text-ink">{formatINR(tax)} tax</p>
        <p className="text-xs text-gray-400">on {formatINR(taxable)} taxable</p>
      </div>
    </div>
  );
}
