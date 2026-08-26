import { useEffect, useState } from "react";
import { History, FileCheck2, RefreshCw, Wallet, Settings, BookOpen, GitCompareArrows } from "lucide-react";
import { getGSTAuditLogsApi } from "../../../api/gst.api";

const ACTION_ICON = {
  RETURN_PREPARED: FileCheck2,
  RETURN_FILED: FileCheck2,
  RECONCILIATION_RUN: GitCompareArrows,
  ITC_CLAIMED: Wallet,
  ITC_REVERSED: Wallet,
  GST_RATE_CHANGED: RefreshCw,
  HSN_ADDED: BookOpen,
  GST_SETTINGS_UPDATED: Settings,
};

const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "—";

export default function GSTAuditLogView() {
  const [logs, setLogs] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getGSTAuditLogsApi({ limit: 100 })
      .then((r) => setLogs(r.logs))
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-ink">GST Audit Log</h2>
        <p className="mt-1 text-sm text-gray-500">A chronological record of every GST-related change.</p>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        {!logs && (
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-gray-50" />
            ))}
          </div>
        )}
        {logs && logs.length === 0 && (
          <p className="py-10 text-center text-sm text-gray-400">No GST audit activity yet.</p>
        )}
        {logs && logs.length > 0 && (
          <ol className="relative space-y-5 border-l border-gray-100 pl-5">
            {logs.map((log) => {
              const Icon = ACTION_ICON[log.action] ?? History;
              return (
                <li key={log._id} className="relative">
                  <span className="absolute -left-[27px] flex h-6 w-6 items-center justify-center rounded-full bg-brand-50 text-brand-600 ring-4 ring-white">
                    <Icon size={12} />
                  </span>
                  <p className="text-sm font-medium text-ink">{log.description}</p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {log.performedBy?.fullName ?? "System"} · {log.action.replace(/_/g, " ")} · {formatDateTime(log.createdAt)}
                  </p>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );
}
