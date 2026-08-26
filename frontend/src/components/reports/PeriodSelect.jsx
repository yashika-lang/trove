import { useState } from "react";

const toISO = (date) => date.toISOString().slice(0, 10);

// Pure date-range arithmetic (no financial calculation) — resolves a named
// period into startDate/endDate strings sent to the backend's own
// buildDateFilter. Server-local time, matching the same "today" convention
// used by Bank Dashboard/Bank Summary, so there's no off-by-one-day drift
// between modules.
function resolvePeriod(period) {
  const now = new Date();

  if (period === "all") return { startDate: undefined, endDate: undefined };

  if (period === "today") {
    return { startDate: toISO(now), endDate: toISO(now) };
  }

  if (period === "this_week") {
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay());
    return { startDate: toISO(start), endDate: toISO(now) };
  }

  if (period === "this_month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { startDate: toISO(start), endDate: toISO(now) };
  }

  if (period === "last_month") {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    return { startDate: toISO(start), endDate: toISO(end) };
  }

  if (period === "this_quarter") {
    const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
    const start = new Date(now.getFullYear(), quarterStartMonth, 1);
    return { startDate: toISO(start), endDate: toISO(now) };
  }

  if (period === "last_quarter") {
    const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3 - 3;
    const start = new Date(now.getFullYear(), quarterStartMonth, 1);
    const end = new Date(now.getFullYear(), quarterStartMonth + 3, 0);
    return { startDate: toISO(start), endDate: toISO(end) };
  }

  if (period === "this_year") {
    const start = new Date(now.getFullYear(), 0, 1);
    return { startDate: toISO(start), endDate: toISO(now) };
  }

  return { startDate: undefined, endDate: undefined };
}

const OPTIONS = [
  { value: "all", label: "All time" },
  { value: "today", label: "Today" },
  { value: "this_week", label: "This week" },
  { value: "this_month", label: "This month" },
  { value: "last_month", label: "Last month" },
  { value: "this_quarter", label: "This quarter" },
  { value: "last_quarter", label: "Last quarter" },
  { value: "this_year", label: "This year" },
  { value: "custom", label: "Custom range" },
];

export default function PeriodSelect({ onChange }) {
  const [period, setPeriod] = useState("all");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const handlePeriodChange = (value) => {
    setPeriod(value);
    if (value === "custom") {
      onChange({ startDate: customStart || undefined, endDate: customEnd || undefined });
    } else {
      onChange(resolvePeriod(value));
    }
  };

  const handleCustomChange = (field, value) => {
    const next = { customStart, customEnd, [field]: value };
    if (field === "start") setCustomStart(value);
    else setCustomEnd(value);
    onChange({
      startDate: (field === "start" ? value : next.customStart) || undefined,
      endDate: (field === "end" ? value : next.customEnd) || undefined,
    });
  };

  return (
    <div className="flex items-center gap-2">
      <select
        className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm"
        value={period}
        onChange={(e) => handlePeriodChange(e.target.value)}
      >
        {OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {period === "custom" && (
        <>
          <input
            type="date"
            className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
            value={customStart}
            onChange={(e) => handleCustomChange("start", e.target.value)}
          />
          <span className="text-xs text-gray-400">to</span>
          <input
            type="date"
            className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
            value={customEnd}
            onChange={(e) => handleCustomChange("end", e.target.value)}
          />
        </>
      )}
    </div>
  );
}
