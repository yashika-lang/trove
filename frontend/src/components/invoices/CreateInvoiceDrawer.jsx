import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import SideDrawer from "../ui/SideDrawer";
import Button from "../ui/Button";
import { getCustomersApi } from "../../api/customer.api";
import { getProductsApi } from "../../api/product.api";
import { createInvoiceApi } from "../../api/invoice.api";

const todayISO = () => new Date().toISOString().slice(0, 10);
const addDaysISO = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

const emptyItem = () => ({ product: "", hsnCode: "", quantity: 1, rate: 0, gst: 0 });

export default function CreateInvoiceDrawer({ open, onClose, onCreated, prefillCustomerId }) {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customer, setCustomer] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(todayISO());
  const [dueDate, setDueDate] = useState(addDaysISO(30));
  const [items, setItems] = useState([emptyItem()]);
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("Payment due within 30 days of invoice date.");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    getCustomersApi().then(setCustomers).catch(() => setCustomers([]));
    getProductsApi().then(setProducts).catch(() => setProducts([]));
    setCustomer(prefillCustomerId ?? "");
    setInvoiceDate(todayISO());
    setDueDate(addDaysISO(30));
    setItems([emptyItem()]);
    setNotes("");
    setError("");
  }, [open, prefillCustomerId]);

  const updateItem = (index, patch) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const onSelectProduct = (index, productId) => {
    const product = products.find((p) => p._id === productId);
    updateItem(index, {
      product: productId,
      hsnCode: product?.hsnCode ?? "",
      rate: product?.price ?? 0,
      gst: product?.gst ?? 0,
    });
  };

  const addItem = () => setItems((prev) => [...prev, emptyItem()]);
  const removeItem = (index) =>
    setItems((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, i) => sum + (Number(i.quantity) || 0) * (Number(i.rate) || 0), 0);
    const gst = items.reduce(
      (sum, i) => sum + ((Number(i.quantity) || 0) * (Number(i.rate) || 0) * (Number(i.gst) || 0)) / 100,
      0
    );
    return { subtotal, gst, total: subtotal + gst };
  }, [items]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!customer) return setError("Select a customer.");
    if (items.some((i) => !i.product)) return setError("Select a product for every line item.");

    setSaving(true);
    try {
      await createInvoiceApi({
        customer,
        invoiceDate,
        dueDate,
        items: items.map((i) => ({ product: i.product, quantity: Number(i.quantity) })),
        notes: notes || undefined,
        termsAndConditions: terms || undefined,
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
      title="Create Invoice"
      subtitle="Direct invoice with GST-aware line items."
      footer={
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-ink hover:bg-gray-50"
          >
            Cancel
          </button>
          <div className="w-40">
            <Button type="submit" form="create-invoice-form" loading={saving}>
              Save Invoice
            </Button>
          </div>
        </div>
      }
    >
      <form id="create-invoice-form" onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="col-span-1">
            <label className="mb-1 block text-xs font-medium text-gray-500">Customer</label>
            <select
              className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm"
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
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
            <label className="mb-1 block text-xs font-medium text-gray-500">Invoice Date</label>
            <input
              type="date"
              className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Due Date</label>
            <input
              type="date"
              className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-ink">Line Items</p>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              <Plus size={14} /> Add Item
            </button>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-4 gap-2 px-1 text-[11px] font-medium uppercase text-gray-400 sm:grid-cols-12">
              <span className="col-span-4">Product</span>
              <span className="col-span-2">HSN</span>
              <span className="col-span-2">Qty</span>
              <span className="col-span-2">Rate</span>
              <span className="col-span-1">GST %</span>
              <span className="col-span-1" />
            </div>

            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-4 items-center gap-2 sm:grid-cols-12">
                <select
                  className="col-span-4 rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
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
                  className="col-span-2 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5 text-sm text-gray-500"
                  value={item.hsnCode}
                  readOnly
                  placeholder="—"
                />
                <input
                  type="number"
                  min={1}
                  className="col-span-2 rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, { quantity: e.target.value })}
                />
                <input
                  className="col-span-2 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5 text-sm text-gray-500"
                  value={item.rate}
                  readOnly
                />
                <input
                  className="col-span-1 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5 text-sm text-gray-500"
                  value={item.gst}
                  readOnly
                />
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="col-span-1 flex justify-center text-gray-300 hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-1 border-t border-gray-100 pt-3 text-sm">
          <div className="flex justify-between text-gray-500">
            <span>Subtotal</span>
            <span>₹{totals.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Estimated GST</span>
            <span>₹{totals.gst.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-semibold text-ink">
            <span>Estimated Total</span>
            <span>₹{totals.total.toFixed(2)}</span>
          </div>
          <p className="text-[11px] text-gray-400">
            Final CGST/SGST/IGST split is calculated by the server from company and customer state.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Notes</label>
            <textarea
              className="h-20 w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm"
              placeholder="Optional notes for the customer"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Terms & Conditions</label>
            <textarea
              className="h-20 w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm"
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
            />
          </div>
        </div>

        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
      </form>
    </SideDrawer>
  );
}
