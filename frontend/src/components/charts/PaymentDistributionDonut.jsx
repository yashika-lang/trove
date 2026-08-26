import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#2f6b4d", "#5f9a72", "#b0d3ba", "#d6a15e"];

// Matches Payment.paymentMode enum exactly (backend/src/models/payment.model.js).
const MODE_LABELS = {
  BANK_TRANSFER: "Bank Transfer",
  CREDIT_CARD: "Credit Card",
  DEBIT_CARD: "Debit Card",
  CASH: "Cash",
  UPI: "UPI",
  WALLET: "Wallet",
  UNKNOWN: "Other",
};

function labelFor(mode) {
  return MODE_LABELS[mode] ?? mode;
}

// data: [{mode, amount, count}] from GET /api/v1/dashboard paymentDistribution
export default function PaymentDistributionDonut({ data }) {
  if (!data?.length) {
    return <p className="py-16 text-center text-sm text-gray-400">No payments recorded yet.</p>;
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            dataKey="amount"
            nameKey="mode"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
          >
            {data.map((entry, i) => (
              <Cell key={entry.mode} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [`₹${Number(value).toLocaleString("en-IN")}`, labelFor(name)]}
            contentStyle={{
              backgroundColor: "var(--color-white)",
              borderColor: "var(--color-gray-100)",
              borderRadius: 8,
              color: "var(--color-ink)",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-gray-500">
        {data.map((entry, i) => (
          <span key={entry.mode} className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: COLORS[i % COLORS.length] }}
            />
            {labelFor(entry.mode)}
          </span>
        ))}
      </div>
    </div>
  );
}
