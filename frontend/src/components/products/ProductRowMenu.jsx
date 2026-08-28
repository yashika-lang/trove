import { useEffect, useRef, useState } from "react";
import { MoreVertical, Eye, Pencil, Copy, Trash2 } from "lucide-react";
import { deleteProductApi } from "../../api/product.api";
import { useAuth } from "../../context/AuthContext";

// Delete/Edit are Admin-only on the backend (product.routes.js); Sales can
// only view. Duplicate is a create, so it's Admin-only too.
export default function ProductRowMenu({ product, onView, onEdit, onDuplicate, onChanged }) {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";
  const [open, setOpen] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [error, setError] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const handleDelete = async () => {
    setError("");
    try {
      await deleteProductApi(product._id);
      setConfirmingDelete(false);
      onChanged();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <button
        type="button"
        data-testid="product-row-menu-trigger"
        onClick={() => setOpen((v) => !v)}
        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-50 hover:text-ink"
      >
        <MoreVertical size={16} />
      </button>

      {open && (
        <div className="absolute right-0 z-10 mt-1 w-40 rounded-xl border border-gray-100 bg-white py-1 shadow-lg">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onView();
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink hover:bg-gray-50"
          >
            <Eye size={14} /> View
          </button>
          {isAdmin && (
            <>
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
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onDuplicate();
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink hover:bg-gray-50"
              >
                <Copy size={14} /> Duplicate
              </button>
              <div className="my-1 border-t border-gray-100" />
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setConfirmingDelete(true);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 size={14} /> Delete
              </button>
            </>
          )}
        </div>
      )}

      {confirmingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
          <div className="w-full max-w-xs rounded-2xl bg-white p-5 shadow-2xl">
            <h3 className="text-sm font-semibold text-ink">Delete {product.productName}?</h3>
            <p className="mt-1 text-xs text-gray-500">This cannot be undone.</p>
            {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-ink hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
