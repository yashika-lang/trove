import { useParams, Link } from "react-router-dom";
import { Construction } from "lucide-react";

const TITLES = {
  notifications: "Notifications",
  products: "Products",
  customers: "Customers",
  invoices: "Invoices",
  payments: "Payments",
  "bank-dashboard": "Bank Dashboard",
  ledger: "Ledger",
  reports: "Reports",
  gst: "GST",
  "user-management": "User Management",
  settings: "Settings",
};

// Every sidebar module that doesn't have approved screenshots yet lands
// here instead of a dead link or an invented, unapproved UI.
export default function ComingSoonPage() {
  const { module } = useParams();
  const title = TITLES[module] ?? "This module";

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 py-24 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
        <Construction size={22} />
      </span>
      <h1 className="text-lg font-semibold text-ink">{title}</h1>
      <p className="max-w-sm text-sm text-gray-500">
        This module's backend API is ready, but the UI hasn't been built yet —
        pending approved screenshots.
      </p>
      <Link to="/admin/dashboard" className="text-sm font-medium text-brand-600">
        Back to Dashboard
      </Link>
    </div>
  );
}
