import { useState } from "react";
import { Users, Banknote, Percent, Lock } from "lucide-react";
import CustomerLedgerView from "../../components/ledger/CustomerLedgerView";
import CashLedgerView from "../../components/ledger/CashLedgerView";
import GstLedgerView from "../../components/ledger/GstLedgerView";
import SupplierLedgerFuture from "../../components/ledger/SupplierLedgerFuture";

const TABS = [
  { key: "customer", label: "Customer Ledger", icon: Users },
  { key: "cash", label: "Cash Ledger", icon: Banknote },
  { key: "gst", label: "GST Ledger", icon: Percent },
  { key: "supplier", label: "Supplier Ledger", icon: Lock, future: true },
];

export default function LedgerPage() {
  const [activeTab, setActiveTab] = useState("customer");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Ledger</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track customer, cash and GST accounts with real, backend-computed running balances.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const selected = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 rounded-2xl border bg-white p-4 text-left shadow-sm transition-colors ${
                selected ? "border-brand-500 ring-1 ring-brand-500" : "border-gray-100 hover:border-gray-200"
              }`}
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                  tab.future ? "bg-gray-100 text-gray-400" : "bg-brand-50 text-brand-600"
                }`}
              >
                <Icon size={16} />
              </span>
              <div>
                <p className="text-sm font-medium text-ink">{tab.label}</p>
                {tab.future && <p className="text-xs text-gray-400">Future</p>}
              </div>
            </button>
          );
        })}
      </div>

      {activeTab === "customer" && <CustomerLedgerView />}
      {activeTab === "cash" && <CashLedgerView canWrite />}
      {activeTab === "gst" && <GstLedgerView canWrite />}
      {activeTab === "supplier" && <SupplierLedgerFuture />}
    </div>
  );
}
