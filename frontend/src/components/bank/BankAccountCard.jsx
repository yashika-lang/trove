import { ArrowDownRight, ArrowUpRight, Landmark } from "lucide-react";
import { maskAccountNumber } from "../../utils/maskAccountNumber";

const formatINR = (value) => `₹${Number(value ?? 0).toLocaleString("en-IN")}`;

export default function BankAccountCard({ account, selected, onSelect }) {
  const recent = account.recentActivity;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-2xl border bg-white p-4 text-left shadow-sm transition-colors ${
        selected ? "border-brand-500 ring-1 ring-brand-500" : "border-gray-100 hover:border-gray-200"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            <Landmark size={16} />
          </span>
          <div>
            <p className="text-sm font-medium text-ink">{account.bankName}</p>
            <p className="text-xs text-gray-400">A/c {maskAccountNumber(account.accountNumber)}</p>
          </div>
        </div>
      </div>

      <p className="mt-3 text-xl font-semibold text-ink">{formatINR(account.balance)}</p>

      <div className="mt-2 flex items-center gap-3 text-xs">
        <span className="flex items-center gap-1 text-brand-600">
          <ArrowUpRight size={12} /> {formatINR(account.todayCredit)}
        </span>
        <span className="flex items-center gap-1 text-red-500">
          <ArrowDownRight size={12} /> {formatINR(account.todayDebit)}
        </span>
      </div>

      <div className="mt-3 border-t border-gray-50 pt-2">
        {recent ? (
          <p className="truncate text-xs text-gray-400">
            {recent.narration} · {recent.type === "CREDIT" ? "+" : "−"}
            {formatINR(recent.amount)}
          </p>
        ) : (
          <p className="text-xs text-gray-300">No recent activity</p>
        )}
      </div>
    </button>
  );
}
