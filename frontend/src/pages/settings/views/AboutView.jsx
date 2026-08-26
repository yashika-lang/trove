import { Gem } from "lucide-react";

export default function AboutView() {
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink">About</h1>
        <p className="mt-1 text-sm text-gray-500">App information.</p>
      </div>

      <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white">
          <Gem size={26} />
        </span>
        <div>
          <p className="text-lg font-semibold text-ink">Trove</p>
          <p className="text-sm text-gray-500">GST billing, invoicing and accounting — Version 1.0.0</p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 text-sm text-gray-500 shadow-sm">
        A role-based GST compliance, billing and bookkeeping platform for small businesses, built on the MERN stack.
      </div>
    </div>
  );
}
