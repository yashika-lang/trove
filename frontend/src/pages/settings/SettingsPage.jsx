import { useEffect, useState } from "react";
import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import {
  Settings as SettingsIcon,
  Building2,
  FileText,
  Percent,
  Landmark,
  CreditCard,
  Bell,
  LayoutTemplate,
  Lock,
  DatabaseBackup,
  SlidersHorizontal,
  Info,
} from "lucide-react";
import { getAllSettingsApi } from "../../api/settings.api";
import GeneralSettingsView from "./views/GeneralSettingsView";
import CompanyInfoView from "./views/CompanyInfoView";
import InvoiceQuotationView from "./views/InvoiceQuotationView";
import GstTaxView from "./views/GstTaxView";
import BankAccountsView from "./views/BankAccountsView";
import PaymentPreferencesView from "./views/PaymentPreferencesView";
import NotificationsSettingsView from "./views/NotificationsSettingsView";
import DocumentTemplatesView from "./views/DocumentTemplatesView";
import SecurityView from "./views/SecurityView";
import BackupRestoreView from "./views/BackupRestoreView";
import PreferencesView from "./views/PreferencesView";
import AboutView from "./views/AboutView";

const NAV = [
  { to: "general", label: "General", description: "Company basics and contact", icon: SettingsIcon },
  { to: "company-info", label: "Company Info", description: "Legal details and preferences", icon: Building2 },
  { to: "invoice-quotation", label: "Invoice & Quotation", description: "Document numbering and terms", icon: FileText },
  { to: "gst-tax", label: "GST & Tax", description: "Billing tax defaults", icon: Percent },
  { to: "bank-accounts", label: "Bank Accounts", description: "Payment account management", icon: Landmark },
  { to: "payment-preferences", label: "Payment Preferences", description: "Payment methods and terms", icon: CreditCard },
  { to: "notifications", label: "Notifications", description: "Alert and reminder settings", icon: Bell },
  { to: "document-templates", label: "Document Templates", description: "Invoice and quotation designs", icon: LayoutTemplate },
  { to: "security", label: "Security", description: "Authentication and privacy", icon: Lock },
  { to: "backup-restore", label: "Backup & Restore", description: "Data backup and recovery", icon: DatabaseBackup },
  { to: "preferences", label: "Preferences", description: "Theme and display options", icon: SlidersHorizontal },
  { to: "about", label: "About", description: "App information and links", icon: Info },
];

export default function SettingsPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const refresh = () => {
    getAllSettingsApi().then(setData).catch((err) => setError(err.message));
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div className="flex h-full gap-6">
      <div className="w-full max-w-[260px] shrink-0 space-y-1 overflow-y-auto">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={`/settings/${item.to}`}
            className={({ isActive }) =>
              `flex items-start gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                isActive ? "bg-brand-600 text-white" : "text-ink hover:bg-gray-50"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={16} className="mt-0.5 shrink-0" />
                <span>
                  <span className="block font-medium">{item.label}</span>
                  <span className={`block text-xs ${isActive ? "text-white/80" : "text-gray-400"}`}>
                    {item.description}
                  </span>
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>

      <div className="min-w-0 flex-1 overflow-y-auto">
        {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
        {!error && !data && (
          <div className="h-64 animate-pulse rounded-2xl border border-gray-100 bg-gray-50" />
        )}
        {data && (
          <Routes>
            <Route index element={<Navigate to="general" replace />} />
            <Route path="general" element={<GeneralSettingsView company={data.company} onSaved={refresh} />} />
            <Route path="company-info" element={<CompanyInfoView company={data.company} onSaved={refresh} />} />
            <Route path="invoice-quotation" element={<InvoiceQuotationView settings={data.settings} onSaved={refresh} />} />
            <Route path="gst-tax" element={<GstTaxView settings={data.settings} onSaved={refresh} />} />
            <Route path="bank-accounts" element={<BankAccountsView banks={data.banks} onSaved={refresh} />} />
            <Route path="payment-preferences" element={<PaymentPreferencesView settings={data.settings} onSaved={refresh} />} />
            <Route path="notifications" element={<NotificationsSettingsView settings={data.settings} onSaved={refresh} />} />
            <Route path="document-templates" element={<DocumentTemplatesView templates={data.templates} onSaved={refresh} />} />
            <Route path="security" element={<SecurityView settings={data.settings} onSaved={refresh} />} />
            <Route path="backup-restore" element={<BackupRestoreView />} />
            <Route path="preferences" element={<PreferencesView />} />
            <Route path="about" element={<AboutView />} />
            <Route path="*" element={<Navigate to="general" replace />} />
          </Routes>
        )}
      </div>
    </div>
  );
}
