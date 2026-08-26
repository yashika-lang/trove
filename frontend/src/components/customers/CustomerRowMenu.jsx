import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MoreVertical, Eye, Pencil, FileText, Receipt, Banknote } from "lucide-react";

export default function CustomerRowMenu({ customer, onView, onEdit }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const goTo = (path, openCreate) => {
    setOpen(false);
    navigate(path, { state: { openCreate, prefillCustomerId: customer._id } });
  };

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <button
        type="button"
        data-testid="customer-row-menu-trigger"
        onClick={() => setOpen((v) => !v)}
        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-50 hover:text-ink"
      >
        <MoreVertical size={16} />
      </button>

      {open && (
        <div className="absolute right-0 z-10 mt-1 w-48 rounded-xl border border-gray-100 bg-white py-1 shadow-lg">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onView();
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink hover:bg-gray-50"
          >
            <Eye size={14} /> View Details
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink hover:bg-gray-50"
          >
            <Pencil size={14} /> Edit
          </button>
          <div className="my-1 border-t border-gray-100" />
          <button
            type="button"
            onClick={() => goTo("/quotations", true)}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink hover:bg-gray-50"
          >
            <FileText size={14} /> Create Quotation
          </button>
          <button
            type="button"
            onClick={() => goTo("/invoices", "direct")}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink hover:bg-gray-50"
          >
            <Receipt size={14} /> Create Invoice
          </button>
          <button
            type="button"
            onClick={() => goTo("/payments", true)}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink hover:bg-gray-50"
          >
            <Banknote size={14} /> Record Payment
          </button>
        </div>
      )}
    </div>
  );
}
