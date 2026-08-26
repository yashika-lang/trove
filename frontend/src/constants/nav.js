import {
  LayoutGrid,
  Bell,
  Package,
  Users,
  FileText,
  Receipt,
  CreditCard,
  Landmark,
  BookOpen,
  BarChart3,
  Percent,
  UserCog,
  Settings,
} from "lucide-react";

// Mirrors backend/src/routes/*.routes.js authorizeRoles(...) exactly, so a
// nav item is only shown to a role that can actually call its API. Verified
// by grepping every route file's authorizeRoles() calls.
export const NAV_SECTIONS = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", icon: LayoutGrid, to: "/admin/dashboard", roles: ["Admin", "Sales", "Accountant"], live: true },
      { label: "Notifications", icon: Bell, to: "/notifications", roles: ["Admin", "Sales", "Accountant"], live: true },
    ],
  },
  {
    label: "Sales",
    items: [
      { label: "Products", icon: Package, to: "/products", roles: ["Admin", "Sales"], live: true },
      { label: "Customers", icon: Users, to: "/customers", roles: ["Admin", "Sales"], live: true },
      { label: "Quotations", icon: FileText, to: "/quotations", roles: ["Admin", "Sales"], live: true },
      { label: "Invoices", icon: Receipt, to: "/invoices", roles: ["Admin", "Sales", "Accountant"], badge: "New", live: true },
      { label: "Payments", icon: CreditCard, to: "/payments", roles: ["Admin", "Sales", "Accountant"], badge: "New", live: true },
    ],
  },
  {
    label: "Finance",
    items: [
      { label: "Bank Dashboard", icon: Landmark, to: "/bank-dashboard", roles: ["Admin", "Accountant"], badge: "New", live: true },
      { label: "Ledger", icon: BookOpen, to: "/ledger", roles: ["Admin", "Accountant"], badge: "New", live: true },
      { label: "Reports", icon: BarChart3, to: "/reports", roles: ["Admin", "Accountant"], badge: "New", live: true },
      { label: "GST", icon: Percent, to: "/gst", roles: ["Admin", "Accountant"], badge: "New", live: true },
    ],
  },
  {
    label: "Admin",
    items: [
      { label: "User Management", icon: UserCog, to: "/coming-soon/user-management", roles: ["Admin"] },
      { label: "Settings", icon: Settings, to: "/settings", roles: ["Admin"], badge: "New", live: true },
    ],
  },
];
