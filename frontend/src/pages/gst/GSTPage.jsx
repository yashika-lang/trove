import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import {
  LayoutGrid,
  Receipt,
  BookOpen,
  Percent,
  Wallet,
  GitCompareArrows,
  FileCheck2,
  ShieldCheck,
  Settings,
  History,
} from "lucide-react";
import GSTDashboardView from "./views/GSTDashboardView";
import GSTTransactionsView from "./views/GSTTransactionsView";
import HsnSacView from "./views/HsnSacView";
import TaxRatesView from "./views/TaxRatesView";
import ITCView from "./views/ITCView";
import ReconciliationView from "./views/ReconciliationView";
import ReturnPreparationView from "./views/ReturnPreparationView";
import ValidationCenterView from "./views/ValidationCenterView";
import GSTSettingsView from "./views/GSTSettingsView";
import GSTAuditLogView from "./views/GSTAuditLogView";

const NAV = [
  {
    label: "Overview",
    items: [
      { to: "dashboard", label: "GST Dashboard", icon: LayoutGrid },
      { to: "transactions", label: "GST Transactions", icon: Receipt },
    ],
  },
  {
    label: "Masters",
    items: [
      { to: "hsn-sac", label: "HSN/SAC Master", icon: BookOpen },
      { to: "tax-rates", label: "Tax Rates", icon: Percent },
    ],
  },
  {
    label: "Compliance",
    items: [
      { to: "itc", label: "Input Tax Credit", icon: Wallet },
      { to: "reconciliation", label: "GST Reconciliation", icon: GitCompareArrows },
      { to: "returns", label: "Return Preparation", icon: FileCheck2 },
      { to: "validation", label: "Validation Center", icon: ShieldCheck },
    ],
  },
  {
    label: "System",
    items: [
      { to: "settings", label: "GST Settings", icon: Settings },
      { to: "audit-log", label: "Audit Log", icon: History },
    ],
  },
];

export default function GSTPage() {
  return (
    <div className="flex h-full flex-col gap-6 lg:flex-row">
      <div className="w-full space-y-5 lg:max-w-[220px] lg:shrink-0">
        <div>
          <h1 className="text-2xl font-semibold text-ink">GST</h1>
          <p className="mt-1 text-sm text-gray-500">Compliance, filing and tax master data.</p>
        </div>
        {NAV.map((section) => (
          <div key={section.label}>
            <p className="mb-1.5 px-1 text-xs font-semibold uppercase text-gray-400">{section.label}</p>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={`/gst/${item.to}`}
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors ${
                      isActive ? "bg-brand-50 text-brand-700" : "text-gray-600 hover:bg-gray-50"
                    }`
                  }
                >
                  <item.icon size={15} />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="min-w-0 flex-1">
        <Routes>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<GSTDashboardView />} />
          <Route path="transactions" element={<GSTTransactionsView />} />
          <Route path="hsn-sac" element={<HsnSacView />} />
          <Route path="tax-rates" element={<TaxRatesView />} />
          <Route path="itc" element={<ITCView />} />
          <Route path="reconciliation" element={<ReconciliationView />} />
          <Route path="returns" element={<ReturnPreparationView />} />
          <Route path="validation" element={<ValidationCenterView />} />
          <Route path="settings" element={<GSTSettingsView />} />
          <Route path="audit-log" element={<GSTAuditLogView />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Routes>
      </div>
    </div>
  );
}
