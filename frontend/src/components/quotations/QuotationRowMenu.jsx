import { useEffect, useRef, useState } from "react";
import { MoreVertical, Eye, Printer, FileDown, Mail, MessageCircle, Copy, ArrowRightLeft, Send, CheckCircle2, XCircle } from "lucide-react";
import SideDrawer from "../ui/SideDrawer";
import StatusBadge from "../ui/StatusBadge";
import {
  getQuotationByIdApi,
  convertQuotationToInvoiceApi,
  downloadQuotationPdfApi,
  emailQuotationApi,
  updateQuotationStatusApi,
} from "../../api/quotation.api";
import { downloadBlob } from "../../utils/download";
import { openWhatsAppShare } from "../../utils/whatsapp";

// Mirrors backend/src/services/quotation.service.js updateQuotationStatus:
// only DRAFT/SENT quotations can transition; APPROVED/CONVERTED/REJECTED
// are terminal. DRAFT can go straight to APPROVED/REJECTED, or via SENT first.
const canChangeStatus = (status) => status === "DRAFT" || status === "SENT";

const formatINR = (value) => `₹${Number(value ?? 0).toLocaleString("en-IN")}`;
const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

export default function QuotationRowMenu({ quotation, onChanged, onDuplicate }) {
  const [open, setOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [converting, setConverting] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");
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
    const full = await getQuotationByIdApi(quotation._id);
    setDetail(full);
  };

  const handleConvert = async () => {
    if (!dueDate) return setError("Pick a due date.");
    setError("");
    try {
      await convertQuotationToInvoiceApi(quotation._id, dueDate);
      setConverting(false);
      onChanged();
    } catch (err) {
      setError(err.message);
    }
  };

  const [statusUpdating, setStatusUpdating] = useState(false);
  const [statusError, setStatusError] = useState("");

  const handleStatusChange = async (status) => {
    setOpen(false);
    setStatusError("");
    setStatusUpdating(true);
    try {
      await updateQuotationStatusApi(quotation._id, status);
      onChanged();
    } catch (err) {
      setStatusError(err.message);
      setTimeout(() => setStatusError(""), 4000);
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleDuplicate = async () => {
    setOpen(false);
    setDuplicating(true);
    try {
      const full = await getQuotationByIdApi(quotation._id);
      onDuplicate(full);
    } finally {
      setDuplicating(false);
    }
  };

  const handleDownloadPdf = async () => {
    setOpen(false);
    const blob = await downloadQuotationPdfApi(quotation._id);
    downloadBlob(blob, `${quotation.quotationNumber}.pdf`);
  };

  const handleWhatsApp = () => {
    setOpen(false);
    openWhatsAppShare(
      quotation.customer?.phone,
      `Hi ${quotation.customer?.customerName ?? ""}, here is your quotation ${quotation.quotationNumber} for ₹${quotation.total.toLocaleString("en-IN")}.`
    );
  };

  const handleEmail = async () => {
    setOpen(false);
    setEmailStatus("sending");
    try {
      await emailQuotationApi(quotation._id);
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
        data-testid="quotation-row-menu-trigger"
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
            <FileDown size={14} /> Download PDF
          </button>
          <button
            type="button"
            onClick={handleEmail}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink hover:bg-gray-50"
          >
            <Mail size={14} /> Email
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
            onClick={handleDuplicate}
            disabled={duplicating}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink hover:bg-gray-50 disabled:text-gray-300"
          >
            <Copy size={14} /> {duplicating ? "Loading…" : "Duplicate"}
          </button>
          {canChangeStatus(quotation.status) && (
            <>
              <div className="my-1 border-t border-gray-100" />
              {quotation.status === "DRAFT" && (
                <button
                  type="button"
                  disabled={statusUpdating}
                  onClick={() => handleStatusChange("SENT")}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink hover:bg-gray-50 disabled:text-gray-300"
                >
                  <Send size={14} /> Send
                </button>
              )}
              <button
                type="button"
                disabled={statusUpdating}
                onClick={() => handleStatusChange("APPROVED")}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-brand-700 hover:bg-brand-50 disabled:text-gray-300"
              >
                <CheckCircle2 size={14} /> Approve
              </button>
              <button
                type="button"
                disabled={statusUpdating}
                onClick={() => handleStatusChange("REJECTED")}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 disabled:text-gray-300"
              >
                <XCircle size={14} /> Reject
              </button>
            </>
          )}
          <div className="my-1 border-t border-gray-100" />
          <button
            type="button"
            disabled={quotation.status !== "APPROVED"}
            onClick={() => {
              setOpen(false);
              setConverting(true);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-transparent"
            title={quotation.status !== "APPROVED" ? "Only approved quotations can be converted." : ""}
          >
            <ArrowRightLeft size={14} /> Convert to Invoice
          </button>
        </div>
      )}

      {statusError && (
        <div className="absolute -bottom-8 right-0 whitespace-nowrap rounded-lg bg-red-50 px-2.5 py-1 text-xs text-red-600 shadow-md">
          {statusError}
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
          {emailStatus === "sent" ? "Email sent" : emailStatus === "sending" ? "Sending…" : emailStatus}
        </div>
      )}

      <SideDrawer
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        title={`Quotation ${quotation.quotationNumber}`}
        subtitle={detail ? <StatusBadge status={detail.status} /> : ""}
      >
        {!detail ? (
          <p className="text-sm text-gray-400">Loading…</p>
        ) : (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-gray-500">
              <div>
                <p className="text-xs uppercase text-gray-400">Customer</p>
                <p className="text-ink">{detail.customer?.customerName}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-gray-400">Valid Until</p>
                <p className="text-ink">{formatDate(detail.validUntil)}</p>
              </div>
            </div>

            <div className="overflow-x-auto"><table className="w-full min-w-[420px] text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-left text-gray-400">
                  <th className="py-1.5 font-medium">Product</th>
                  <th className="py-1.5 font-medium">Qty</th>
                  <th className="py-1.5 font-medium">Rate</th>
                  <th className="py-1.5 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {detail.items.map((item) => (
                  <tr key={item._id} className="border-b border-gray-50">
                    <td className="py-1.5 text-ink">{item.product?.productName}</td>
                    <td className="py-1.5">{item.quantity}</td>
                    <td className="py-1.5">{formatINR(item.rate)}</td>
                    <td className="py-1.5 text-right text-ink">{formatINR(item.amount)}</td>
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
            </div>
          </div>
        )}
      </SideDrawer>

      {converting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
          <div className="w-full max-w-xs rounded-2xl bg-white p-5 shadow-2xl">
            <h3 className="text-sm font-semibold text-ink">Convert to Invoice</h3>
            <p className="mt-1 text-xs text-gray-500">
              Creates an invoice from {quotation.quotationNumber} using its existing items and GST.
            </p>
            <label className="mb-1 mt-3 block text-xs font-medium text-gray-500">Due Date</label>
            <input
              type="date"
              className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
            {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConverting(false)}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-ink hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConvert}
                className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
              >
                Convert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
