import { Landmark, ArrowUpRight } from "lucide-react";

// Purely decorative — static demo figures matching the approved screenshot,
// not wired to any API. Real balances/invoices belong to the dashboard
// module, which is out of scope for this phase.
export default function FloatingStatCards() {
  return (
    <div className="absolute inset-0 flex items-center justify-center px-10">
      {/* Bounded cluster, centered as a single group within the panel so the
          composition stays balanced regardless of panel width. */}
      <div className="relative h-72 w-full max-w-sm sm:h-80">
        <div className="absolute left-1/2 top-0 w-64 -translate-x-1/2 animate-float-a rounded-2xl bg-brand-700 p-5 text-white shadow-xl">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
            <Landmark size={16} />
          </span>
          <p className="mt-4 text-sm text-white/70">Total Balance</p>
          <p className="text-2xl font-semibold">₹42,18,900</p>
          <p className="mt-1 text-xs text-white/60">Across 5 connected banks</p>
        </div>

        <div className="absolute right-0 top-28 w-48 animate-float-b rounded-2xl bg-white p-4 shadow-xl sm:top-32">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">INV-2041</p>
            <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-medium text-brand-700">
              Paid
            </span>
          </div>
          <p className="mt-1 text-lg font-semibold text-ink">₹45,200</p>
          <p className="mt-1 text-xs text-gray-400">GST 18% · Sharma Traders</p>
        </div>

        <div className="absolute left-2 top-48 flex w-40 animate-float-a items-center gap-2 rounded-2xl bg-white p-3 shadow-xl sm:top-52">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
            <ArrowUpRight size={14} />
          </span>
          <div>
            <p className="text-xs text-gray-400">GST collected</p>
          </div>
        </div>
      </div>
    </div>
  );
}
