import { useEffect, useState } from "react";
import SideDrawer from "../ui/SideDrawer";
import Button from "../ui/Button";
import { INDIAN_STATES } from "../../data/indianStates";
import { createCustomerApi, updateCustomerApi } from "../../api/customer.api";

const emptyForm = {
  customerName: "",
  contactPerson: "",
  phone: "",
  email: "",
  gstin: "",
  billingAddress: "",
  state: "",
  creditLimit: 0,
  status: "ACTIVE",
  notes: "",
};

export default function CustomerDrawer({ open, onClose, onSaved, customer, readOnly = false }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const isEdit = Boolean(customer);

  useEffect(() => {
    if (!open) return;
    setError("");
    setForm(
      customer
        ? {
            customerName: customer.customerName,
            contactPerson: customer.contactPerson,
            phone: customer.phone,
            email: customer.email,
            gstin: customer.gstin,
            billingAddress: customer.billingAddress,
            state: customer.state,
            creditLimit: customer.creditLimit ?? 0,
            status: customer.status,
            notes: customer.notes ?? "",
          }
        : emptyForm
    );
  }, [open, customer]);

  const setField = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.customerName.trim()) return setError("Customer name is required.");
    if (!form.contactPerson.trim()) return setError("Contact person is required.");
    if (!form.phone.trim()) return setError("Phone is required.");
    if (!form.email.trim()) return setError("Email is required.");
    if (form.gstin.trim().length !== 15) return setError("GSTIN must be 15 characters.");
    if (!form.billingAddress.trim()) return setError("Billing address is required.");
    if (!form.state) return setError("State is required.");

    setSaving(true);
    try {
      const payload = {
        customerName: form.customerName.trim(),
        contactPerson: form.contactPerson.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        gstin: form.gstin.trim().toUpperCase(),
        billingAddress: form.billingAddress.trim(),
        state: form.state,
        creditLimit: Number(form.creditLimit) || 0,
        status: form.status,
        notes: form.notes.trim() || undefined,
      };

      if (isEdit) {
        await updateCustomerApi(customer._id, payload);
      } else {
        await createCustomerApi(payload);
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
      title={readOnly ? customer?.customerName : isEdit ? `Edit ${customer.customerName}` : "New Customer"}
      subtitle={readOnly ? "Customer details." : isEdit ? "Update customer details." : "Add a customer to your ledger."}
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
              <Button type="submit" form="customer-form" loading={saving}>
                Save Customer
              </Button>
            </div>
          </div>
        )
      }
    >
      <form id="customer-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
        <fieldset disabled={readOnly} className="m-0 space-y-4 border-0 p-0 disabled:opacity-70">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Customer Name</label>
            <input
              className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm"
              placeholder="e.g. Sharma Traders"
              value={form.customerName}
              onChange={setField("customerName")}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Contact Person</label>
            <input
              className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm"
              placeholder="e.g. Rakesh Sharma"
              value={form.contactPerson}
              onChange={setField("contactPerson")}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Phone</label>
              <input
                className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm"
                placeholder="+91 98765 43210"
                value={form.phone}
                onChange={setField("phone")}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Email</label>
              <input
                type="email"
                className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm"
                placeholder="name@company.in"
                value={form.email}
                onChange={setField("email")}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">GSTIN</label>
            <input
              className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm uppercase"
              placeholder="27AABCS1234F1Z5"
              maxLength={15}
              value={form.gstin}
              onChange={setField("gstin")}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Billing Address</label>
            <textarea
              className="h-16 w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm"
              placeholder="Street, city, state, PIN"
              value={form.billingAddress}
              onChange={setField("billingAddress")}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">State</label>
            <select
              className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm"
              value={form.state}
              onChange={setField("state")}
            >
              <option value="">Select state</option>
              {INDIAN_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Credit Limit (₹)</label>
              <input
                type="number"
                min={0}
                className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm"
                value={form.creditLimit}
                onChange={setField("creditLimit")}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Status</label>
              <select
                className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm"
                value={form.status}
                onChange={setField("status")}
              >
                <option value="ACTIVE">active</option>
                <option value="INACTIVE">inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Notes</label>
            <textarea
              className="h-16 w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm"
              placeholder="Optional notes about the customer"
              value={form.notes}
              onChange={setField("notes")}
            />
          </div>
        </fieldset>

        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
      </form>
    </SideDrawer>
  );
}
