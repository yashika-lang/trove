// Colors map to the real backend status enums:
// - Quotation: DRAFT | SENT | APPROVED | REJECTED | EXPIRED | CONVERTED
//   (backend/src/models/quotation.model.js)
// - Invoice: DRAFT | GENERATED | PENDING | PARTIALLY_PAID | PAID | OVERDUE | CANCELLED
//   (backend/src/models/invoice.model.js)
// - Payment: PAID | PARTIALLY_PAID | PENDING | FAILED | REFUNDED
//   (backend/src/models/payment.model.js)
const STYLES = {
  DRAFT: "bg-gray-100 text-gray-600",
  SENT: "bg-blue-50 text-blue-600",
  APPROVED: "bg-brand-100 text-brand-700",
  PAID: "bg-brand-100 text-brand-700",
  GENERATED: "bg-blue-50 text-blue-600",
  PENDING: "bg-amber-50 text-amber-600",
  PARTIALLY_PAID: "bg-amber-50 text-amber-600",
  REJECTED: "bg-red-50 text-red-600",
  EXPIRED: "bg-red-50 text-red-600",
  OVERDUE: "bg-red-50 text-red-600",
  CANCELLED: "bg-red-50 text-red-600",
  CONVERTED: "bg-purple-50 text-purple-600",
  FAILED: "bg-red-50 text-red-600",
  REFUNDED: "bg-blue-50 text-blue-600",
};

function toTitleCase(value) {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
        STYLES[status] ?? "bg-gray-100 text-gray-600"
      }`}
    >
      {toTitleCase(status ?? "")}
    </span>
  );
}
