import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { getProductsApi } from "../../api/product.api";
import { createCreditDebitNoteApi } from "../../api/creditDebitNote.api";

const emptyItem = () => ({ product: "", hsnCode: "", quantity: 1, rate: 0, gst: 0 });

export default function CreditDebitNoteModal({ open, onClose, invoice, type }) {
  const [products, setProducts] = useState([]);
  const [reason, setReason] = useState("");
  const [items, setItems] = useState([emptyItem()]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);
  const [saving, setSaving] = useState(false);

  const label = type === "CREDIT_NOTE" ? "Credit Note" : "Debit Note";

  useEffect(() => {
    if (!open) return;
    getProductsApi().then(setProducts).catch(() => setProducts([]));
    setReason("");
    setItems([emptyItem()]);
    setError("");
    setSuccess(null);
  }, [open]);

  const estimatedTotal = useMemo(
    () =>
      items.reduce((sum, i) => {
        const amount = (Number(i.quantity) || 0) * (Number(i.rate) || 0);
        return sum + amount + (amount * (Number(i.gst) || 0)) / 100;
      }, 0),
    [items]
  );

  if (!open) return null;

  const onSelectProduct = (index, productId) => {
    const product = products.find((p) => p._id === productId);
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              product: productId,
              hsnCode: product?.hsnCode ?? "",
              rate: product?.price ?? 0,
              gst: product?.gst ?? 0,
            }
          : item
      )
    );
  };

  const updateQty = (index, quantity) =>
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, quantity } : item)));

  const addItem = () => setItems((prev) => [...prev, emptyItem()]);
  const removeItem = (index) =>
    setItems((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));

  const handleSubmit = async () => {
    setError("");
    if (!reason.trim()) return setError("Enter a reason.");
    if (items.some((i) => !i.product)) return setError("Select a product for every line item.");

    setSaving(true);
    try {
      const note = await createCreditDebitNoteApi({
        invoiceId: invoice._id,
        type,
        reason: reason.trim(),
        items: items.map((i) => ({ product: i.product, quantity: Number(i.quantity) })),
      });
      setSuccess(note);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="w-[28rem] rounded-2xl bg-white p-5 shadow-2xl">
        {success ? (
          <div className="text-center">
            <p className="text-sm text-gray-500">{label} issued</p>
            <p className="mt-1 text-xl font-semibold text-ink">{success.noteNumber}</p>
            <p className="mt-1 text-sm text-gray-500">₹{success.total.toLocaleString("en-IN")}</p>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 w-full rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-base font-semibold text-ink">
              {label} for {invoice.invoiceNumber}
            </h3>
            <p className="mt-1 text-xs text-gray-500">{invoice.customer?.customerName}</p>

            <label className="mb-1 mt-4 block text-xs font-medium text-gray-500">Reason</label>
            <input
              className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm"
              placeholder="e.g. Damaged goods returned"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />

            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-medium uppercase text-gray-400">Items</p>
                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
                >
                  <Plus size={12} /> Add Item
                </button>
              </div>
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 items-center gap-2">
                    <select
                      className="col-span-7 rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
                      value={item.product}
                      onChange={(e) => onSelectProduct(index, e.target.value)}
                    >
                      <option value="">Select product</option>
                      {products.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.productName}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min={1}
                      className="col-span-3 rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
                      value={item.quantity}
                      onChange={(e) => updateQty(index, e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="col-span-2 flex justify-center text-gray-300 hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <p className="mt-3 text-sm text-gray-500">
              Estimated Total <span className="font-medium text-ink">₹{estimatedTotal.toFixed(2)}</span>
            </p>

            {error && <p className="mt-2 text-xs text-red-500">{error}</p>}

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-ink hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700 disabled:bg-brand-300"
              >
                {saving ? "Issuing…" : `Issue ${label}`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
