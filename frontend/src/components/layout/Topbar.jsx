import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Calendar, Moon, Sun, Bell, FileText, Package, Users, Receipt, User, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { globalSearchApi } from "../../api/search.api";
import {
  getNotificationsApi,
  markNotificationReadApi,
  markAllNotificationsReadApi,
} from "../../api/notification.api";
import { NOTIFICATION_ROUTE } from "../../constants/notifications";

const today = new Date().toLocaleDateString("en-US", {
  weekday: "long",
  day: "2-digit",
  month: "long",
  year: "numeric",
});

function initialsOf(name) {
  if (!name) return "?";
  return name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();
}

const RESULT_ICON = { customer: Users, product: Package, quotation: FileText, invoice: Receipt };
const RESULT_ROUTE = {
  customer: () => "/coming-soon/customers",
  product: () => "/coming-soon/products",
  quotation: () => "/quotations",
  invoice: () => "/invoices",
};

const formatRelativeTime = (dateStr) => {
  const mins = Math.round((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hrs ago`;
  return `${Math.round(hrs / 24)} days ago`;
};

export default function Topbar() {
  const { user, logout } = useAuth();
  const { effectiveTheme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef(null);

  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  // Debounced global search.
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const handle = setTimeout(() => {
      globalSearchApi(query.trim())
        .then((r) => {
          setResults(r);
          setSearchOpen(true);
        })
        .catch(() => setResults([]));
    }, 250);
    return () => clearTimeout(handle);
  }, [query]);

  const loadNotifications = () => {
    getNotificationsApi().then((r) => {
      setNotifications(r.notifications);
      setUnreadCount(r.unreadCount);
    });
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const openNotifications = () => {
    setNotifOpen((v) => !v);
    loadNotifications();
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsReadApi();
    loadNotifications();
  };

  const handleNotificationClick = async (n) => {
    if (!n.read) await markNotificationReadApi(n._id);
    loadNotifications();
    const route = NOTIFICATION_ROUTE[n.type];
    if (route) {
      setNotifOpen(false);
      navigate(route);
    }
  };

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-gray-100 bg-white px-6">
      <div className="relative flex-1" ref={searchRef}>
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm">
          <Search size={16} className="text-gray-400" />
          <input
            className="w-full outline-none placeholder:text-gray-400"
            placeholder="Search products, customers, invoices…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query && setSearchOpen(true)}
          />
          <kbd className="rounded border border-gray-200 px-1.5 py-0.5 text-[10px] text-gray-400">⌘K</kbd>
        </div>

        {searchOpen && (
          <div className="absolute left-0 right-0 z-20 mt-1 max-h-80 overflow-y-auto rounded-xl border border-gray-100 bg-white py-1 shadow-lg">
            {results.length === 0 && (
              <p className="px-3 py-3 text-sm text-gray-400">No results for "{query}".</p>
            )}
            {results.map((r) => {
              const Icon = RESULT_ICON[r.type] ?? FileText;
              return (
                <button
                  key={`${r.type}-${r.id}`}
                  type="button"
                  onClick={() => {
                    setSearchOpen(false);
                    setQuery("");
                    navigate(RESULT_ROUTE[r.type]());
                  }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-gray-50"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                    <Icon size={14} />
                  </span>
                  <span>
                    <span className="block text-ink">{r.label}</span>
                    <span className="block text-xs text-gray-400">{r.sublabel}</span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="hidden items-center gap-1.5 text-sm text-gray-500 md:flex">
        <Calendar size={15} />
        {today}
      </div>

      <div className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-ink">{user?.role}</div>

      <button
        type="button"
        onClick={toggleTheme}
        className="text-gray-400 hover:text-ink"
        title={effectiveTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      >
        {effectiveTheme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div className="relative" ref={notifRef}>
        <button
          type="button"
          data-testid="notification-bell"
          onClick={openNotifications}
          className="relative text-gray-400 hover:text-ink"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-2 w-2 rounded-full bg-red-500" />
          )}
        </button>

        {notifOpen && (
          <div className="absolute right-0 z-20 mt-2 w-80 rounded-xl border border-gray-100 bg-white py-1 shadow-lg">
            <div className="flex items-center justify-between px-3 py-2">
              <p className="text-sm font-semibold text-ink">Notifications</p>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="text-xs font-medium text-brand-600 hover:text-brand-700"
                >
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 && (
                <p className="px-3 py-6 text-center text-sm text-gray-400">No notifications yet.</p>
              )}
              {notifications.map((n) => (
                <button
                  key={n._id}
                  type="button"
                  onClick={() => handleNotificationClick(n)}
                  className={`block w-full border-t border-gray-50 px-3 py-2.5 text-left first:border-t-0 hover:bg-gray-50 ${
                    !n.read ? "bg-brand-50/40" : ""
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />}
                    <span className="text-sm font-medium text-ink">{n.title}</span>
                  </span>
                  <span className="mt-0.5 block text-xs text-gray-400">{n.message}</span>
                  <span className="mt-0.5 block text-[11px] text-gray-300">
                    {formatRelativeTime(n.createdAt)}
                  </span>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                setNotifOpen(false);
                navigate("/notifications");
              }}
              className="block w-full border-t border-gray-50 px-3 py-2.5 text-center text-xs font-medium text-brand-600 hover:bg-gray-50"
            >
              View all notifications
            </button>
          </div>
        )}
      </div>

      <div className="relative" ref={profileRef}>
        <button
          type="button"
          data-testid="profile-avatar"
          onClick={() => setProfileOpen((v) => !v)}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-xs font-medium text-white"
        >
          {initialsOf(user?.fullName)}
        </button>

        {profileOpen && (
          <div className="absolute right-0 z-20 mt-2 w-56 rounded-xl border border-gray-100 bg-white py-1 shadow-lg">
            <div className="border-b border-gray-50 px-3.5 py-3">
              <p className="text-sm font-semibold text-ink">{user?.fullName}</p>
              <p className="text-xs text-gray-400">{user?.role}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setProfileOpen(false);
                navigate("/profile");
              }}
              className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-ink hover:bg-gray-50"
            >
              <User size={15} className="text-gray-400" /> Profile
            </button>
            <button
              type="button"
              onClick={async () => {
                setProfileOpen(false);
                await logout();
                navigate("/login", { replace: true });
              }}
              className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut size={15} /> Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
