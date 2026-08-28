import { useEffect, useRef, useState } from "react";
import { MoreVertical, Eye, Printer, FileDown, MessageCircle, Mail, Undo2 } from "lucide-react";
import SideDrawer from "../ui/SideDrawer";
import StatusBadge from "../ui/StatusBadge";
import {
  getPaymentByIdApi,
  downloadPaymentReceiptPdfApi,
  emailPaymentReceiptApi,
  updatePaymentStatusApi,
} from "../../api/payment.api";
import { downloadBlob } from "../../utils/download";
import { openWhatsAppShare } from "../../utils/whatsapp";

const formatINR = (value) => `₹${Number(value ?? 0).toLocaleString("en-IN")}`;
const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

export default function PaymentRowMenu({ payment, onChanged }) {
  const [open, setOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [emailStatus, setEmailStatus] = useState("");
  const [refunding, setRefunding] = useState(false);
  const [refundError, setRefundError] = useState("");
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
    const full = await getPaymentByIdApi(payment._id);
    setDetail(full);
  };

  const handleDownloadPdf = async () => {
    setOpen(false);
    const blob = await downloadPaymentReceiptPdfApi(payment._id);
    downloadBlob(blob, `${payment.paymentNumber}.pdf`);
  };

  const handleWhatsApp = () => {
    setOpen(false);
    openWhatsAppShare(
      payment.customer?.phone,
      `Hi ${payment.customer?.customerName ?? ""}, we've recorded your payment ${payment.paymentNumber} of ₹${payment.amount.toLocaleString("en-IN")}.`
    );
  };

  const handleEmail = async () => {
    setOpen(false);
    setEmailStatus("sending");
    try {
      await emailPaymentReceiptApi(payment._id);
      setEmailStatus("sent");
    } catch (err) {
      setEmailStatus(err.message);
    }
    setTimeout(() => setEmailStatus(""), 4000);
  };

  const handleRefund = async () => {
    setRefundError("");
    try {
      await updatePaymentStatusApi(payment._id, "REFUNDED");
      setRefunding(false);
      onChanged();
    } catch (err) {
      setRefundError(err.message);
    }
  };

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <button
        type="button"
        data-testid="payment-row-menu-trigger"
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
            onClick={() => {
              openDetails();
              setTimeout(() => window.print(), 300);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink hover:bg-gray-50"
          >
            <Printer size={14} /> Print Receipt
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
            <Mail size={14} /> Email Receipt
          </button>
          <div className="my-1 border-t border-gray-100" />
          <button
            type="button"
            disabled={payment.status === "REFUNDED"}
            onClick={() => {
              setOpen(false);
              setRefunding(true);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-transparent"
          >
            <Undo2 size={14} /> Refund
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
          {emailStatus === "sent" ? "Receipt sent" : emailStatus === "sending" ? "Sending…" : emailStatus}
        </div>
      )}

      <SideDrawer
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        title={payment.paymentNumber}
        subtitle={detail ? <StatusBadge status={detail.status} /> : ""}
      >
        {!detail ? (
          <p className="text-sm text-gray-400">Loading…</p>
        ) : (
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-xs uppercase text-gray-400">Received From</p>
              <p className="text-ink">{detail.customer?.customerName}</p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase text-gray-400">Date</p>
                <p className="text-ink">{formatDate(detail.paymentDate)}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-gray-400">Invoice</p>
                <p className="text-ink">{detail.invoice?.invoiceNumber ?? "On account"}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase text-gray-400">Amount</p>
                <p className="text-ink">{formatINR(detail.amount)}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-gray-400">Mode</p>
                <p className="text-ink">{detail.paymentMode.replace("_", " ")}</p>
              </div>
            </div>
            {(detail.utr || detail.referenceNumber) && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {detail.utr && (
                  <div>
                    <p className="text-xs uppercase text-gray-400">UTR</p>
                    <p className="text-ink">{detail.utr}</p>
                  </div>
                )}
                {detail.referenceNumber && (
                  <div>
                    <p className="text-xs uppercase text-gray-400">Reference</p>
                    <p className="text-ink">{detail.referenceNumber}</p>
                  </div>
                )}
              </div>
            )}
            {detail.remarks && (
              <div>
                <p className="text-xs uppercase text-gray-400">Remarks</p>
                <p className="text-ink">{detail.remarks}</p>
              </div>
            )}
          </div>
        )}
      </SideDrawer>

      {refunding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
          <div className="w-full max-w-xs rounded-2xl bg-white p-5 shadow-2xl">
            <h3 className="text-sm font-semibold text-ink">Refund {payment.paymentNumber}?</h3>
            <p className="mt-1 text-xs text-gray-500">
              Marks this payment as REFUNDED and recalculates the linked invoice's balance due.
            </p>
            {refundError && <p className="mt-2 text-xs text-red-500">{refundError}</p>}
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRefunding(false)}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-ink hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRefund}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
              >
                Refund
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
