import { useEffect, useState } from "react";
import { CheckCircle2, AlertTriangle, Gauge } from "lucide-react";
import StatCard from "../../../components/ui/StatCard";
import { getGSTValidationApi } from "../../../api/gst.api";

const STATUS_STYLE = {
  PASSED: { badge: "bg-emerald-50 text-emerald-700", icon: CheckCircle2, iconColor: "text-emerald-600" },
  WARNING: { badge: "bg-amber-50 text-amber-700", icon: AlertTriangle, iconColor: "text-amber-600" },
  ERROR: { badge: "bg-red-50 text-red-600", icon: AlertTriangle, iconColor: "text-red-600" },
};

export default function ValidationCenterView() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getGSTValidationApi().then(setData).catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>;

  if (!data) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl border border-gray-100 bg-gray-50" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-ink">Validation Center</h2>
        <p className="mt-1 text-sm text-gray-500">Live compliance checks against your real GST data.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard icon={CheckCircle2} label="Checks Passed" value={data.checksPassed} />
        <StatCard icon={AlertTriangle} label="Issues Found" value={data.issuesFound} />
        <StatCard icon={Gauge} label="Readiness" value={`${data.readiness}%`} />
      </div>

      <div className="space-y-2">
        {data.checks.map((check) => {
          const style = STATUS_STYLE[check.status];
          const Icon = style.icon;
          return (
            <div key={check.id} className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <span className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50 ${style.iconColor}`}>
                  <Icon size={17} />
                </span>
                <div>
                  <p className="text-sm font-medium text-ink">{check.label}</p>
                  <p className="text-xs text-gray-400">{check.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-right">
                <div className="text-xs text-gray-500">
                  <p>{check.passedCount} passed</p>
                  {check.warningCount > 0 && <p className="text-amber-600">{check.warningCount} warnings</p>}
                  {check.errorCount > 0 && <p className="text-red-600">{check.errorCount} errors</p>}
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${style.badge}`}>{check.status}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
