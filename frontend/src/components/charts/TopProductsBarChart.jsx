import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

// data: [{productId, productName, revenue, quantity}] from
// GET /api/v1/dashboard topProducts
export default function TopProductsBarChart({ data }) {
  if (!data?.length) {
    return <p className="py-16 text-center text-sm text-gray-400">No sales recorded yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(220, data.length * 56)}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24 }}>
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="productName"
          width={110}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12, fill: "var(--color-gray-400)" }}
        />
        <Tooltip
          formatter={(value) => [`₹${Number(value).toLocaleString("en-IN")}`, "Revenue"]}
          cursor={{ fill: "var(--color-gray-100)" }}
          contentStyle={{
            backgroundColor: "var(--color-white)",
            borderColor: "var(--color-gray-100)",
            borderRadius: 8,
            color: "var(--color-ink)",
          }}
        />
        <Bar dataKey="revenue" radius={[0, 6, 6, 0]} barSize={18}>
          {data.map((entry) => (
            <Cell key={entry.productId} fill="var(--color-brand-600)" />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
