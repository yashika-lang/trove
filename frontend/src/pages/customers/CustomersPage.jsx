import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Users, UserCheck, IndianRupee, AlertTriangle, Search, Plus } from "lucide-react";
import StatCard from "../../components/ui/StatCard";
import CustomerDrawer from "../../components/customers/CustomerDrawer";
import CustomerRowMenu from "../../components/customers/CustomerRowMenu";
import { useAuth } from "../../context/AuthContext";
import { getCustomerStatsApi, getCustomersApi } from "../../api/customer.api";

const formatINR = (value) => `₹${Number(value ?? 0).toLocaleString("en-IN")}`;

export default function CustomersPage() {
  const { user } = useAuth();
  const location = useLocation();
  const canCreate = user?.role === "Admin" || user?.role === "Sales";

  const [stats, setStats] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  // "create" | "edit" | "view" | null — Dashboard's "Add Customer" quick
  // action navigates here with { state: { openCreate: true } }.
  const [drawerMode, setDrawerMode] = useState(
    canCreate && location.state?.openCreate ? "create" : null
  );
  const [activeCustomer, setActiveCustomer] = useState(null);

  const refresh = useCallback(() => {
    getCustomerStatsApi().then(setStats).catch(() => setStats(null));
    getCustomersApi({ search, status: status || undefined })
      .then(setCustomers)
      .catch((err) => setError(err.message));
  }, [search, status]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Customers</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track balances, GSTIN details and the full transaction history for every account.
        </p>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard icon={Users} label="Total Customers" value={stats?.totalCustomers ?? "—"} />
        <StatCard icon={UserCheck} label="Active" value={stats?.activeCustomers ?? "—"} />
        <StatCard icon={IndianRupee} label="Total Outstanding" value={formatINR(stats?.totalOutstanding)} />
        <StatCard icon={AlertTriangle} label="With Dues" value={stats?.customersWithDues ?? "—"} />
      </div>

      <div className="flex items-center gap-3">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm">
          <Search size={16} className="text-gray-400" />
          <input
            className="w-full outline-none placeholder:text-gray-400"
            placeholder="Search by name, email, phone or GSTIN…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">all</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
        {canCreate && (
          <button
            type="button"
            onClick={() => {
              setActiveCustomer(null);
              setDrawerMode("create");
            }}
            className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            <Plus size={16} /> Add Customer
          </button>
        )}
      </div>

      <div className="overflow-x-auto overflow-y-visible rounded-2xl border border-gray-100 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs uppercase text-gray-400">
              <th className="px-4 py-3 font-medium">Customer Name</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">GSTIN</th>
              <th className="px-4 py-3 font-medium">Outstanding</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c._id} className="border-b border-gray-50 last:border-0">
                <td className="px-4 py-3">
                  <p className="font-medium text-ink">{c.customerName}</p>
                  <p className="text-xs text-gray-400">{c.contactPerson}</p>
                </td>
                <td className="px-4 py-3 text-gray-500">{c.phone}</td>
                <td className="px-4 py-3 text-gray-500">{c.email}</td>
                <td className="px-4 py-3 text-gray-500">{c.gstin}</td>
                <td className={`px-4 py-3 ${c.outstanding > 0 ? "text-red-600" : "text-ink"}`}>
                  {formatINR(c.outstanding)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      c.status === "ACTIVE" ? "bg-brand-100 text-brand-700" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {c.status === "ACTIVE" ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <CustomerRowMenu
                    customer={c}
                    onView={() => {
                      setActiveCustomer(c);
                      setDrawerMode("view");
                    }}
                    onEdit={() => {
                      setActiveCustomer(c);
                      setDrawerMode("edit");
                    }}
                  />
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-400">
                  No customers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-gray-400">Showing {customers.length} of {customers.length} customers</p>

      <CustomerDrawer
        open={drawerMode === "create" || drawerMode === "edit" || drawerMode === "view"}
        onClose={() => setDrawerMode(null)}
        onSaved={refresh}
        customer={drawerMode === "edit" || drawerMode === "view" ? activeCustomer : null}
        readOnly={drawerMode === "view"}
      />
    </div>
  );
}
