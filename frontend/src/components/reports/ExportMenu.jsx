import { useEffect, useRef, useState } from "react";
import { Download, FileText, FileSpreadsheet, File } from "lucide-react";
import { exportReportApi } from "../../api/report.api";
import { downloadBlob } from "../../utils/download";

const FORMATS = [
  { value: "pdf", label: "PDF", icon: File },
  { value: "excel", label: "Excel", icon: FileSpreadsheet },
  { value: "csv", label: "CSV", icon: FileText },
];

// Real backend-generated files (see backend/src/utils/pdfExport.js —
// pdfkit; excelExport.js — exceljs; csvExport.js — json2csv), not a
// screenshot-as-PDF or a renamed CSV. Filters currently applied to the
// report (date range, search) are sent along so the export matches what's
// on screen.
export default function ExportMenu({ reportName, filters }) {
  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState("");
  const [error, setError] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const handleExport = async (format) => {
    setOpen(false);
    setExporting(format);
    setError("");
    try {
      const { blob, filename } = await exportReportApi(reportName, format, filters);
      downloadBlob(blob, filename);
    } catch (err) {
      setError(err.message);
    } finally {
      setExporting("");
    }
  };

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={Boolean(exporting)}
        className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
      >
        <Download size={14} /> {exporting ? "Exporting…" : "Export"}
      </button>

      {open && (
        <div className="absolute right-0 z-10 mt-1 w-36 rounded-xl border border-gray-100 bg-white py-1 shadow-lg">
          {FORMATS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => handleExport(f.value)}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink hover:bg-gray-50"
            >
              <f.icon size={14} /> {f.label}
            </button>
          ))}
        </div>
      )}

      {error && (
        <div className="absolute right-0 top-9 z-10 whitespace-nowrap rounded-lg bg-red-50 px-2.5 py-1 text-xs text-red-600 shadow-md">
          {error}
        </div>
      )}
    </div>
  );
}
