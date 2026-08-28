import { useEffect, useMemo, useState } from "react";
import SideDrawer from "../ui/SideDrawer";
import Button from "../ui/Button";
import { getCustomersApi } from "../../api/customer.api";
import { getInvoicesApi } from "../../api/invoice.api";
import { createPaymentApi } from "../../api/payment.api";

const todayISO = () => new Date().toISOString().slice(0, 10);

const PAYMENT_MODES = [
  { value: "CASH", label: "Cash" },
  { value: "UPI", label: "UPI" },
  { value: "CREDIT_CARD", label: "Credit Card" },
  { value: "DEBIT_CARD", label: "Debit Card" },
  { value: "WALLET", label: "Wallet" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
];

const STATUSES = ["PAID", "PARTIALLY_PAID", "PENDING", "FAILED", "REFUNDED"];

export default function RecordPaymentDrawer({ open, onClose, onCreated, prefillCustomerId }) {
  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [customer, setCustomer] = useState("");
  const [invoice, setInvoice] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(todayISO());
  const [paymentMode, setPaymentMode] = useState("UPI");
  const [status, setStatus] = useState("PAID");
  const [utr, setUtr] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    getCustomersApi().then(setCustomers).catch(() => setCustomers([]));
    getInvoicesApi({ limit: 200 }).then((r) => setInvoices(r.invoices)).catch(() => setInvoices([]));
    setCustomer(prefillCustomerId ?? "");
    setInvoice("");
    setAmount("");
    setPaymentDate(todayISO());
    setPaymentMode("UPI");
    setStatus("PAID");
    setUtr("");
    setReferenceNumber("");
    setRemarks("");
    setError("");
  }, [open, prefillCustomerId]);

  const customerInvoices = useMemo(
    () => invoices.filter((inv) => inv.customer?._id === customer && inv.balanceDue > 0),
    [invoices, customer]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!customer) return setError("Select a customer.");
    if (!amount || Number(amount) <= 0) return setError("Enter a valid amount.");

    setSaving(true);
    try {
      await createPaymentApi({
        customer,
        invoice: invoice || undefined,
        amount: Number(amount),
        paymentDate,
        paymentMode,
        status,
        utr: utr.trim() || undefined,
        referenceNumber: referenceNumber.trim() || undefined,
        remarks: remarks.trim() || undefined,
      });
      onCreated();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SideDrawer
      open={open}
      onClose={onClose}
      title="Record Payment"
      subtitle="Log a payment received from a customer."
      footer={
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-ink hover:bg-gray-50"
          >
            Cancel
          </button>
          <div className="w-44">
            <Button type="submit" form="record-payment-form" loading={saving}>
              Record Payment
            </Button>
          </div>
        </div>
      }
    >
      <form id="record-payment-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Customer</label>
          <select
            className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm"
            value={customer}
            onChange={(e) => {
              setCustomer(e.target.value);
              setInvoice("");
            }}
          >
            <option value="">Select customer</option>
            {customers.map((c) => (
              <option key={c._id} value={c._id}>
                {c.customerName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Against Invoice</label>
          <select
            className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm"
            value={invoice}
            onChange={(e) => setInvoice(e.target.value)}
            disabled={!customer}
          >
            <option value="">none</option>
            {customerInvoices.map((inv) => (
              <option key={inv._id} value={inv._id}>
                {inv.invoiceNumber} — balance ₹{inv.balanceDue.toLocaleString("en-IN")}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Amount</label>
            <input
              type="number"
              min={0}
              step="0.01"
              className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Date</label>
            <input
              type="date"
              className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Payment Mode</label>
            <select
              className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm"
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
            >
              {PAYMENT_MODES.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Status</label>
            <select
              className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">UTR</label>
            <input
              className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm"
              placeholder="e.g. HDFC00047126"
              value={utr}
              onChange={(e) => setUtr(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Reference Number</label>
            <input
              className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm"
              placeholder="e.g. NEFT/2046"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Remarks</label>
          <textarea
            className="h-20 w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm"
            placeholder="Optional note about this payment…"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </div>

        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
      </form>
    </SideDrawer>
  );
}
