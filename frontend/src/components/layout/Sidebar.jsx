import { NavLink } from "react-router-dom";
import { LogOut, Gem } from "lucide-react";
import { NAV_SECTIONS } from "../../constants/nav";
import { useAuth } from "../../context/AuthContext";
import { getRoleByValue } from "../../constants/roles";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const role = user?.role;

  // Only Admin has an approved dashboard screen inside this shell so far —
  // Sales/Accountant "Dashboard" points at their own (plain, shell-less)
  // placeholder rather than the Admin-only /admin/dashboard route.
  const dashboardHref =
    role === "Admin" ? "/admin/dashboard" : `/${getRoleByValue(role)?.param}/dashboard`;

  return (
    <aside className="flex h-screen w-56 shrink-0 flex-col border-r border-gray-100 bg-white">
      <div className="flex items-center gap-2 px-5 py-5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
          <Gem size={16} />
        </span>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-ink">Trove</p>
          <p className="text-[11px] text-gray-400">GST · Billing · Books</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        {NAV_SECTIONS.map((section) => {
          const items = section.items.filter((item) => item.roles.includes(role));
          if (items.length === 0) return null;

          return (
            <div key={section.label} className="mt-4 first:mt-1">
              <p className="px-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                {section.label}
              </p>
              <div className="mt-1 space-y-0.5">
                {items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.label === "Dashboard" ? dashboardHref : item.to}
                    className={({ isActive }) =>
                      `flex items-center justify-between rounded-lg px-2.5 py-2 text-sm transition-colors ${
                        isActive
                          ? "bg-brand-50 text-brand-700"
                          : "text-gray-600 hover:bg-gray-50"
                      }`
                    }
                  >
                    <span className="flex items-center gap-2">
                      <item.icon size={16} />
                      {item.label}
                    </span>
                    {item.badge && (
                      <span className="rounded-full bg-brand-100 px-1.5 py-0.5 text-[10px] font-medium text-brand-700">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={logout}
        className="mx-3 mb-4 flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-gray-500 hover:bg-gray-50"
      >
        <LogOut size={16} />
        Logout
      </button>
    </aside>
  );
}
