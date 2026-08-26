import StatCard from "../ui/StatCard";

// Tailwind's JIT scanner needs literal class names, not a template-built
// `md:grid-cols-${n}` string (that would never appear in the compiled
// CSS) — so the column count is mapped to a fixed literal per count.
const MD_COLS = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
};

export default function ReportStatCards({ cards }) {
  return (
    <div className={`grid grid-cols-2 gap-4 ${MD_COLS[cards.length] ?? "md:grid-cols-4"}`}>
      {cards.map((card) => (
        <StatCard key={card.label} icon={card.icon} label={card.label} value={card.value} />
      ))}
    </div>
  );
}
