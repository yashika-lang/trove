import {
  Receipt,
  Wallet,
  FileCheck2,
  Landmark,
  RefreshCw,
  FileText,
  GitCompareArrows,
  Bell,
} from "lucide-react";

// Maps a notification's `type` to the page a click should land on — kept in
// sync with every `notificationService.notify({ type: ... })` call across
// the backend services (see notification.model.js for the full enum).
export const NOTIFICATION_ROUTE = {
  INVOICE_CREATED: "/invoices",
  PAYMENT_RECEIVED: "/payments",
  QUOTATION_APPROVED: "/quotations",
  BANK_IMPORT_COMPLETED: "/bank-dashboard",
  TRANSACTION_RECONCILED: "/bank-dashboard",
  GST_RETURN_FILED: "/gst/returns",
  ITC_REVERSED: "/gst/itc",
  RECONCILIATION_MISMATCH: "/gst/reconciliation",
};

export const NOTIFICATION_ICON = {
  INVOICE_CREATED: Receipt,
  PAYMENT_RECEIVED: Wallet,
  QUOTATION_APPROVED: FileCheck2,
  BANK_IMPORT_COMPLETED: Landmark,
  TRANSACTION_RECONCILED: RefreshCw,
  GST_RETURN_FILED: FileText,
  ITC_REVERSED: Wallet,
  RECONCILIATION_MISMATCH: GitCompareArrows,
  GENERAL: Bell,
};

export const NOTIFICATION_LABEL = {
  INVOICE_CREATED: "Invoice",
  PAYMENT_RECEIVED: "Payment",
  QUOTATION_APPROVED: "Quotation",
  BANK_IMPORT_COMPLETED: "Bank Import",
  TRANSACTION_RECONCILED: "Reconciliation",
  GST_RETURN_FILED: "GST Return",
  ITC_REVERSED: "ITC",
  RECONCILIATION_MISMATCH: "GST Reconciliation",
  GENERAL: "General",
};
