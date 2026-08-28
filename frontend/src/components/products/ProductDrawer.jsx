import { useEffect, useState } from "react";
import SideDrawer from "../ui/SideDrawer";
import Button from "../ui/Button";
import { createProductApi, updateProductApi } from "../../api/product.api";

const GST_RATES = [0, 5, 12, 18, 28];

const emptyForm = {
  productName: "",
  sku: "",
  hsnCode: "",
  category: "",
  unit: "",
  price: "",
  gst: 18,
  openingStock: 0,
  description: "",
};

// `product` (optional) → edit mode, prefilled and PATCHed instead of POSTed.
// `categories`/`units` are suggestion lists (datalist) derived from products
// already loaded on the page — category/unit are free-text on the backend
// (backend/src/models/product.model.js), not a fixed enum.
export default function ProductDrawer({
  open,
  onClose,
  onSaved,
  product,
  duplicateFrom,
  categories = [],
  units = [],
  readOnly = false,
}) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const isEdit = Boolean(product);
  const source = product ?? duplicateFrom;

  useEffect(() => {
    if (!open) return;
    setError("");
    setForm(
      source
        ? {
            productName: duplicateFrom ? `${source.productName} (Copy)` : source.productName,
            sku: duplicateFrom ? `${source.sku}-COPY` : source.sku,
            hsnCode: source.hsnCode,
            category: source.category,
            unit: source.unit,
            price: source.price,
            gst: source.gst,
            // Duplicating starts a fresh product with its own stock count
            // (0, to be filled in); editing/viewing must show the real
            // saved value — this was previously hardcoded to 0 for both
            // cases, so View/Edit always showed "0" regardless of what was
            // actually saved.
            openingStock: duplicateFrom ? 0 : source.openingStock,
            description: source.description ?? "",
          }
        : emptyForm
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, product, duplicateFrom]);

  const setField = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.productName.trim()) return setError("Product name is required.");
    if (!form.sku.trim()) return setError("SKU is required.");
    if (!form.hsnCode.trim()) return setError("HSN code is required.");
    if (!form.category.trim()) return setError("Category is required.");
    if (!form.unit.trim()) return setError("Unit is required.");
    if (form.price === "" || Number(form.price) < 0) return setError("Enter a valid price.");

    setSaving(true);
    try {
      const payload = {
        productName: form.productName.trim(),
        sku: form.sku.trim(),
        hsnCode: form.hsnCode.trim(),
        category: form.category.trim(),
        unit: form.unit.trim(),
        price: Number(form.price),
        gst: Number(form.gst),
        openingStock: Number(form.openingStock) || 0,
        description: form.description.trim() || undefined,
      };

      if (isEdit) {
        await updateProductApi(product._id, payload);
      } else {
        await createProductApi(payload);
      }
      onSaved();
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
      title={readOnly ? product?.productName : isEdit ? `Edit ${product.productName}` : duplicateFrom ? `Duplicate ${duplicateFrom.productName}` : "New Product"}
      subtitle={readOnly ? "Product details." : isEdit ? "Update product details." : "Add a product to your catalogue."}
      footer={
        readOnly ? (
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-ink hover:bg-gray-50"
          >
            Close
          </button>
        ) : (
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-ink hover:bg-gray-50"
            >
              Cancel
            </button>
            <div className="w-40">
              <Button type="submit" form="product-form" loading={saving}>
                Save Product
              </Button>
            </div>
          </div>
        )
      }
    >
      <form id="product-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
        <fieldset disabled={readOnly} className="m-0 space-y-4 border-0 p-0 disabled:opacity-70">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Product Name</label>
          <input
            className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm"
            placeholder="e.g. Steel Rod 12mm"
            value={form.productName}
            onChange={setField("productName")}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">SKU</label>
            <input
              className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm"
              value={form.sku}
              onChange={setField("sku")}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">HSN Code</label>
            <input
              className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm"
              value={form.hsnCode}
              onChange={setField("hsnCode")}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Category</label>
            <input
              list="product-categories"
              className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm"
              placeholder="Select or type"
              value={form.category}
              onChange={setField("category")}
            />
            <datalist id="product-categories">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Unit</label>
            <input
              list="product-units"
              className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm"
              placeholder="Select or type"
              value={form.unit}
              onChange={setField("unit")}
            />
            <datalist id="product-units">
              {units.map((u) => (
                <option key={u} value={u} />
              ))}
            </datalist>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Price (₹)</label>
            <input
              type="number"
              min={0}
              step="0.01"
              className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm"
              placeholder="0.00"
              value={form.price}
              onChange={setField("price")}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">GST %</label>
            <select
              className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm"
              value={form.gst}
              onChange={setField("gst")}
            >
              {GST_RATES.map((rate) => (
                <option key={rate} value={rate}>
                  {rate}%
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Opening Stock</label>
          <input
            type="number"
            min={0}
            className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm"
            value={form.openingStock}
            onChange={setField("openingStock")}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Description</label>
          <textarea
            className="h-20 w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm"
            placeholder="Optional notes about the product"
            value={form.description}
            onChange={setField("description")}
          />
        </div>
        </fieldset>

        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
      </form>
    </SideDrawer>
  );
}
