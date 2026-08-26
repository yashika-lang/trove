import { useEffect, useState } from "react";
import { X, CheckCircle2 } from "lucide-react";
import { findPaymentMatchesApi, reconcileTransactionApi } from "../../api/reconciliation.api";

const formatINR = (value) => `₹${Number(value ?? 0).toLocaleString("en-IN")}`;
const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

export default function ReconcileModal({ open, onClose, transaction, onReconciled }) {
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [reconcilingId, setReconcilingId] = useState(null);

  useEffect(() => {
    if (!open || !transaction) return;
    setLoading(true);
    setError("");
    setMessage("");
    findPaymentMatchesApi(transaction._id)
      .then((result) => {
        setMatches(result.matches ?? []);
        setMessage(result.message ?? "");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [open, transaction]);

  if (!open || !transaction) return null;

  const handleReconcile = async (paymentId) => {
    setReconcilingId(paymentId);
    setError("");
    try {
      await reconcileTransactionApi(transaction._id, paymentId);
      onReconciled();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setReconcilingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-base font-semibold text-ink">Reconcile Transaction</h3>
            <p className="mt-0.5 text-xs text-gray-500">
              {transaction.narration} — {formatINR(transaction.credit || transaction.amount)} on{" "}
              {formatDate(transaction.date || transaction.transactionDate)}
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-ink">
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 max-h-80 space-y-2 overflow-y-auto">
          {loading && <p className="py-6 text-center text-sm text-gray-400">Finding matches…</p>}

          {!loading && matches.length === 0 && (
            <p className="rounded-lg bg-gray-50 px-3 py-4 text-center text-sm text-gray-500">
              {message || "No unlinked payment of this exact amount was found."}
            </p>
          )}

          {!loading &&
            matches.map((payment) => (
              <div
                key={payment._id}
                className="flex items-center justify-between rounded-xl border border-gray-100 px-3 py-2.5"
              >
                <div>
                  <p className="text-sm font-medium text-ink">{payment.customer?.customerName ?? "—"}</p>
                  <p className="text-xs text-gray-400">
                    {payment.paymentNumber} · {formatDate(payment.paymentDate)} ·{" "}
                    {payment.invoice?.invoiceNumber ?? "On account"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-ink">{formatINR(payment.amount)}</span>
                  <button
                    type="button"
                    disabled={reconcilingId === payment._id}
                    onClick={() => handleReconcile(payment._id)}
                    className="flex items-center gap-1 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700 disabled:opacity-60"
                  >
                    <CheckCircle2 size={14} />
                    {reconcilingId === payment._id ? "Linking…" : "Link"}
                  </button>
                </div>
              </div>
            ))}
        </div>

        {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}
