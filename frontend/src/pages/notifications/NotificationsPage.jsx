import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, ChevronLeft, ChevronRight } from "lucide-react";
import {
  getNotificationsApi,
  markNotificationReadApi,
  markAllNotificationsReadApi,
} from "../../api/notification.api";
import { NOTIFICATION_ROUTE, NOTIFICATION_ICON, NOTIFICATION_LABEL } from "../../constants/notifications";

const TABS = [
  { key: "ALL", label: "All" },
  { key: "UNREAD", label: "Unread" },
];

const PAGE_SIZE = 20;

const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "—";

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("ALL");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const refresh = () => {
    getNotificationsApi({ page, limit: PAGE_SIZE }).then(setResult).catch((err) => setError(err.message));
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleMarkAllRead = async () => {
    await markAllNotificationsReadApi();
    refresh();
  };

  const handleClick = async (n) => {
    if (!n.read) await markNotificationReadApi(n._id);
    refresh();
    const route = NOTIFICATION_ROUTE[n.type];
    if (route) navigate(route);
  };

  const notifications = result?.notifications ?? [];
  const visible = tab === "UNREAD" ? notifications.filter((n) => !n.read) : notifications;
  const totalPages = result ? Math.max(Math.ceil(result.total / PAGE_SIZE), 1) : 1;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Notifications</h1>
          <p className="mt-1 text-sm text-gray-500">Events raised by your team's activity across Trove.</p>
        </div>
        {result?.unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="rounded-lg border border-gray-200 px-3.5 py-2 text-sm font-medium text-ink hover:bg-gray-50"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="flex gap-1 rounded-lg border border-gray-200 bg-white p-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              tab === t.key ? "bg-brand-600 text-white" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            {t.label}
            {t.key === "UNREAD" && result?.unreadCount > 0 && (
              <span className={`rounded-full px-1.5 text-xs ${tab === t.key ? "bg-white/20" : "bg-brand-100 text-brand-700"}`}>
                {result.unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

      <div className="rounded-2xl border border-gray-100 bg-white">
        {!result &&
          [0, 1, 2, 3].map((i) => (
            <div key={i} className="border-b border-gray-50 p-4 last:border-0">
              <div className="h-4 w-2/3 animate-pulse rounded bg-gray-50" />
            </div>
          ))}

        {result && visible.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
              <Bell size={20} />
            </span>
            <p className="text-sm text-gray-400">
              {tab === "UNREAD" ? "You're all caught up — no unread notifications." : "No notifications yet."}
            </p>
          </div>
        )}

        {result &&
          visible.map((n) => {
            const Icon = NOTIFICATION_ICON[n.type] ?? Bell;
            const clickable = Boolean(NOTIFICATION_ROUTE[n.type]);
            return (
              <button
                key={n._id}
                type="button"
                onClick={() => handleClick(n)}
                className={`flex w-full items-start gap-3 border-b border-gray-50 p-4 text-left last:border-0 hover:bg-gray-50 ${
                  !n.read ? "bg-brand-50/40" : ""
                } ${clickable ? "" : "cursor-default"}`}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  <Icon size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    {!n.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600" />}
                    <p className="text-sm font-medium text-ink">{n.title}</p>
                    <span className="ml-auto shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                      {NOTIFICATION_LABEL[n.type] ?? "General"}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-gray-500">{n.message}</p>
                  <p className="mt-1 text-xs text-gray-400">{formatDateTime(n.createdAt)}</p>
                </div>
              </button>
            );
          })}

        {result && (
          <div className="flex items-center justify-between border-t border-gray-50 px-4 py-3 text-sm text-gray-500">
            <span>
              {result.total} notification(s) · Page {page} of {totalPages}
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
                disabled={page >= totalPages}
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
