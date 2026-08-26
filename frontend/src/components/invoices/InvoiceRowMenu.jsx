import { useEffect, useRef, useState } from "react";
import { MoreVertical, Eye, Printer, FileDown, Mail, MessageCircle, FilePlus2, FileMinus2 } from "lucide-react";
import SideDrawer from "../ui/SideDrawer";
import StatusBadge from "../ui/StatusBadge";
import CreditDebitNoteModal from "./CreditDebitNoteModal";
import { getInvoiceByIdApi, downloadInvoicePdfApi, emailInvoiceApi } from "../../api/invoice.api";
import { downloadBlob } from "../../utils/download";
import { openWhatsAppShare } from "../../utils/whatsapp";

const formatINR = (value) => `₹${Number(value ?? 0).toLocaleString("en-IN")}`;
const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

export default function InvoiceRowMenu({ invoice }) {
  const [open, setOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [noteType, setNoteType] = useState(null); // "CREDIT_NOTE" | "DEBIT_NOTE" | null
  const [emailStatus, setEmailStatus] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const openDetails = async () => {
    setOpen(false);
    setDetailsOpen(true);
    const full = await getInvoiceByIdApi(invoice._id);
    setDetail(full);
  };

  const handleDownloadPdf = async () => {
    setOpen(false);
    const blob = await downloadInvoicePdfApi(invoice._id);
    downloadBlob(blob, `${invoice.invoiceNumber}.pdf`);
  };

  const handleWhatsApp = () => {
    setOpen(false);
    openWhatsAppShare(
      invoice.customer?.phone,
      `Hi ${invoice.customer?.customerName ?? ""}, here is your invoice ${invoice.invoiceNumber} for ₹${invoice.total.toLocaleString("en-IN")}.`
    );
  };

  const handleEmail = async () => {
    setOpen(false);
    setEmailStatus("sending");
    try {
      await emailInvoiceApi(invoice._id);
      setEmailStatus("sent");
    } catch (err) {
      setEmailStatus(err.message);
    }
    setTimeout(() => setEmailStatus(""), 4000);
  };

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <button
        type="button"
        data-testid="invoice-row-menu-trigger"
        onClick={() => setOpen((v) => !v)}
        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-50 hover:text-ink"
      >
        <MoreVertical size={16} />
      </button>

      {open && (
        <div className="absolute right-0 z-10 mt-1 w-48 rounded-xl border border-gray-100 bg-white py-1 shadow-lg">
          <button
            type="button"
            onClick={openDetails}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink hover:bg-gray-50"
          >
            <Eye size={14} /> View Details
          </button>
          <button
            type="button"
            onClick={openDetails}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink hover:bg-gray-50"
          >
            <Eye size={14} /> Preview
          </button>
          <button
            type="button"
            onClick={() => {
              openDetails();
              setTimeout(() => window.print(), 300);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink hover:bg-gray-50"
          >
            <Printer size={14} /> Print
          </button>
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink hover:bg-gray-50"
          >
            <FileDown size={14} /> PDF
          </button>
          <button
            type="button"
            onClick={handleWhatsApp}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink hover:bg-gray-50"
          >
            <MessageCircle size={14} /> WhatsApp
          </button>
          <button
            type="button"
            onClick={handleEmail}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink hover:bg-gray-50"
          >
            <Mail size={14} /> Email
          </button>
          <div className="my-1 border-t border-gray-100" />
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setNoteType("CREDIT_NOTE");
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink hover:bg-gray-50"
          >
            <FilePlus2 size={14} /> Credit Note
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setNoteType("DEBIT_NOTE");
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink hover:bg-gray-50"
          >
            <FileMinus2 size={14} /> Debit Note
          </button>
        </div>
      )}

      {emailStatus && (
        <div
          className={`absolute -bottom-8 right-0 whitespace-nowrap rounded-lg px-2.5 py-1 text-xs shadow-md ${
            emailStatus === "sent"
              ? "bg-brand-50 text-brand-700"
              : emailStatus === "sending"
                ? "bg-gray-50 text-gray-500"
                : "bg-red-50 text-red-600"
          }`}
        >
          {emailStatus === "sent"
            ? "Email sent"
            : emailStatus === "sending"
              ? "Sending…"
              : emailStatus}
        </div>
      )}

      <SideDrawer
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        title={invoice.invoiceNumber}
        subtitle={
          <span className="flex items-center gap-2">
            {invoice.customer?.customerName}
            {detail && <StatusBadge status={detail.status} />}
          </span>
        }
      >
        {!detail ? (
          <p className="text-sm text-gray-400">Loading…</p>
        ) : (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-gray-100 px-3 py-2">
                <p className="text-xs text-gray-400">Invoice Date</p>
                <p className="text-ink">{formatDate(detail.invoiceDate)}</p>
              </div>
              <div className="rounded-lg border border-gray-100 px-3 py-2">
                <p className="text-xs text-gray-400">Due Date</p>
                <p className="text-ink">{formatDate(detail.dueDate)}</p>
              </div>
            </div>

            <div>
              <p className="mb-1.5 text-xs font-medium uppercase text-gray-400">Line Items</p>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-gray-400">
                    <th className="py-1.5 font-medium">Item</th>
                    <th className="py-1.5 font-medium">Qty</th>
                    <th className="py-1.5 font-medium">Rate</th>
                    <th className="py-1.5 text-right font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.items.map((item) => (
                    <tr key={item._id} className="border-b border-gray-50">
                      <td className="py-2 text-ink">
                        {item.product?.productName}
                        <p className="text-[11px] text-gray-400">
                          HSN {item.product?.hsnCode} · GST {item.gst}%
                        </p>
                      </td>
                      <td className="py-2">{item.quantity}</td>
                      <td className="py-2">{formatINR(item.rate)}</td>
                      <td className="py-2 text-right text-ink">{formatINR(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-1 border-t border-gray-100 pt-3">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>{formatINR(detail.subtotal)}</span>
              </div>
              {detail.cgst > 0 && (
                <div className="flex justify-between text-gray-500">
                  <span>CGST</span>
                  <span>{formatINR(detail.cgst)}</span>
                </div>
              )}
              {detail.sgst > 0 && (
                <div className="flex justify-between text-gray-500">
                  <span>SGST</span>
                  <span>{formatINR(detail.sgst)}</span>
                </div>
              )}
              {detail.igst > 0 && (
                <div className="flex justify-between text-gray-500">
                  <span>IGST</span>
                  <span>{formatINR(detail.igst)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-ink">
                <span>Total</span>
                <span>{formatINR(detail.total)}</span>
              </div>
              <div className="flex justify-between text-brand-600">
                <span>Amount Paid</span>
                <span>{formatINR(detail.amountPaid)}</span>
              </div>
              <div className="flex justify-between text-ink">
                <span>Balance Due</span>
                <span>{formatINR(detail.balanceDue)}</span>
              </div>
            </div>

            {(detail.notes || detail.termsAndConditions) && (
              <div className="space-y-2 border-t border-gray-100 pt-3">
                {detail.notes && (
                  <div>
                    <p className="text-xs font-medium uppercase text-gray-400">Notes</p>
                    <p className="text-ink">{detail.notes}</p>
                  </div>
                )}
                {detail.termsAndConditions && (
                  <div>
                    <p className="text-xs font-medium uppercase text-gray-400">Terms & Conditions</p>
                    <p className="text-ink">{detail.termsAndConditions}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </SideDrawer>

      <CreditDebitNoteModal
        open={Boolean(noteType)}
        onClose={() => setNoteType(null)}
        invoice={invoice}
        type={noteType}
      />
    </div>
  );
}
