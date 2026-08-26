import { useEffect, useRef, useState } from "react";
import { Plus, ChevronDown, FileEdit, ArrowRightLeft } from "lucide-react";

export default function CreateInvoiceMenu({ onDirect, onFromQuotation }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
      >
        <Plus size={16} /> Create Invoice <ChevronDown size={14} />
      </button>

      {open && (
        <div className="absolute right-0 z-10 mt-1 w-48 rounded-xl border border-gray-100 bg-white py-1 shadow-lg">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onDirect();
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink hover:bg-gray-50"
          >
            <FileEdit size={14} /> Direct Invoice
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onFromQuotation();
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink hover:bg-gray-50"
          >
            <ArrowRightLeft size={14} /> From Quotation
          </button>
        </div>
      )}
    </div>
  );
}
