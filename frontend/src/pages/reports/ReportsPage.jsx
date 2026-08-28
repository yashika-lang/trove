import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Search, ChevronRight } from "lucide-react";
import ReportStatCards from "../../components/reports/ReportStatCards";
import ReportTable from "../../components/reports/ReportTable";
import ExportMenu from "../../components/reports/ExportMenu";
import PeriodSelect from "../../components/reports/PeriodSelect";
import { REPORT_GROUPS, ALL_REPORTS } from "./reportConfig";

export default function ReportsPage() {
  const [navSearch, setNavSearch] = useState("");
  const [activeKey, setActiveKey] = useState(ALL_REPORTS[0].key);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rowSearch, setRowSearch] = useState("");
  const [dateRange, setDateRange] = useState({ startDate: undefined, endDate: undefined });

  const activeReport = useMemo(
    () => ALL_REPORTS.find((r) => r.key === activeKey),
    [activeKey]
  );

  const filteredGroups = useMemo(() => {
    if (!navSearch.trim()) return REPORT_GROUPS;
    const search = navSearch.trim().toLowerCase();
    return REPORT_GROUPS.map((group) => ({
      ...group,
      reports: group.reports.filter((r) => r.label.toLowerCase().includes(search)),
    })).filter((group) => group.reports.length > 0);
  }, [navSearch]);

  // Backend query params — only the filters this specific report actually
  // accepts are sent (see reportConfig.js hasBackendSearch/hasDateFilter).
  const backendParams = useMemo(() => {
    const params = {};
    if (activeReport.hasDateFilter) {
      if (dateRange.startDate) params.startDate = dateRange.startDate;
      if (dateRange.endDate) params.endDate = dateRange.endDate;
    }
    if (activeReport.hasBackendSearch && rowSearch.trim()) {
      params.search = rowSearch.trim();
    }
    return params;
  }, [activeReport, dateRange, rowSearch]);

  // Guards against out-of-order responses: switching reports quickly (or a
  // slower report, like Ledger Report which composes 3 downstream calls,
  // resolving after a faster later request) must never let a stale
  // response overwrite what's currently on screen.
  const requestIdRef = useRef(0);

  const refresh = useCallback(() => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError("");
    activeReport
      .fetch(backendParams)
      .then((result) => {
        if (requestIdRef.current !== requestId) return;
        setData(result);
      })
      .catch((err) => {
        if (requestIdRef.current !== requestId) return;
        setError(err.message);
      })
      .finally(() => {
        if (requestIdRef.current !== requestId) return;
        setLoading(false);
      });
  }, [activeReport, backendParams]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleSelectReport = (key) => {
    setActiveKey(key);
    setRowSearch("");
    setDateRange({ startDate: undefined, endDate: undefined });
  };

  const allRows = data ? activeReport.getRows(data) : [];

  // Reports whose backend endpoint doesn't accept `search` (small,
  // already-fully-fetched datasets — Monthly Sales, Top Customers, Top
  // Products, Quotation Conversion) filter the already-rendered rows
  // client-side instead. This still satisfies "search must actually
  // affect displayed rows" without re-deriving any financial total.
  const rows = useMemo(() => {
    if (activeReport.hasBackendSearch || !rowSearch.trim()) return allRows;
    const search = rowSearch.trim().toLowerCase();
    return allRows.filter((row) =>
      activeReport
        .clientSearchFields?.(row)
        .some((field) => String(field ?? "").toLowerCase().includes(search))
    );
  }, [activeReport, allRows, rowSearch]);

  const cards = data ? activeReport.getCards(data) : [];

  return (
    <div className="flex h-full flex-col gap-6 lg:flex-row">
      <div className="w-full space-y-4 lg:max-w-xs lg:shrink-0">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Reports</h1>
          <p className="mt-1 text-sm text-gray-500">
            Pre-built sales, finance and insight reports — filter by period and export to PDF,
            Excel or CSV.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm">
          <Search size={14} className="text-gray-400" />
          <input
            className="w-full outline-none placeholder:text-gray-400"
            placeholder="Find a report…"
            value={navSearch}
            onChange={(e) => setNavSearch(e.target.value)}
          />
        </div>

        <div className="space-y-4">
          {filteredGroups.map((group) => (
            <div key={group.label}>
              <p className="mb-1.5 text-xs font-semibold uppercase text-gray-400">{group.label}</p>
              <div className="space-y-1">
                {group.reports.map((report) => {
                  const Icon = report.icon;
                  const selected = report.key === activeKey;
                  return (
                    <button
                      key={report.key}
                      type="button"
                      onClick={() => handleSelectReport(report.key)}
                      className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm font-medium transition-colors ${
                        selected
                          ? "border-brand-500 bg-brand-50 text-brand-700"
                          : "border-transparent text-ink hover:bg-gray-50"
                      }`}
                    >
                      <Icon size={15} />
                      <span className="flex-1">{report.label}</span>
                      {selected && <ChevronRight size={14} />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="min-w-0 flex-1 space-y-4">
        <div className="flex items-start justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <activeReport.icon size={18} />
            </span>
            <div>
              <h2 className="text-base font-semibold text-ink">{activeReport.label}</h2>
              <p className="text-xs text-gray-500">{activeReport.description}</p>
            </div>
          </div>
          <ExportMenu reportName={activeReport.key} filters={backendParams} />
        </div>

        {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

        {loading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl border border-gray-100 bg-gray-50" />
            ))}
          </div>
        ) : (
          <ReportStatCards cards={cards} />
        )}

        <div className="rounded-2xl border border-gray-100 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-4 py-4">
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm">
              <Search size={14} className="text-gray-400" />
              <input
                className="w-full sm:w-56 outline-none placeholder:text-gray-400"
                placeholder="Search rows…"
                value={rowSearch}
                onChange={(e) => setRowSearch(e.target.value)}
              />
            </div>
            {activeReport.hasDateFilter && (
              <PeriodSelect onChange={setDateRange} />
            )}
          </div>

          {loading ? (
            <div className="space-y-2 p-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-8 animate-pulse rounded-lg bg-gray-50" />
              ))}
            </div>
          ) : (
            <ReportTable
              columns={activeReport.columns}
              rows={rows}
              rowKey={activeReport.rowKey}
            />
          )}

          <div className="border-t border-gray-50 px-4 py-3 text-sm text-gray-400">
            Showing {rows.length} row(s) · {dateRange.startDate || dateRange.endDate ? "Filtered" : "All time"}
          </div>
        </div>
      </div>
    </div>
  );
}
