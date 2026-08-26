import {
  Calendar,
  FileText,
  Percent,
  AlertCircle,
  BookOpen,
  Landmark,
  CreditCard,
  Users,
  Package,
  TrendingUp,
} from "lucide-react";
import StatusBadge from "../../components/ui/StatusBadge";
import { maskAccountNumber } from "../../utils/maskAccountNumber";
import {
  getDailySalesApi,
  getMonthlySalesApi,
  getQuotationReportApi,
  getGstReportApi,
  getOutstandingReportApi,
  getLedgerReportApi,
  getBankSummaryReportApi,
  getPaymentReportApi,
  getTopCustomersApi,
  getTopProductsApi,
  getQuotationConversionApi,
} from "../../api/report.api";

const formatINR = (value) => `₹${Number(value ?? 0).toLocaleString("en-IN")}`;
const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const formatMonth = (ym) => {
  if (!ym) return "—";
  const [, month] = ym.split("-");
  return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][Number(month) - 1];
};

// Every entry mirrors one backend/src/routes/report.routes.js endpoint and
// its matching backend/src/routes/reportExport.routes.js reportName. Cards
// and columns read fields the backend already aggregates — nothing here
// computes an authoritative financial total.
export const REPORT_GROUPS = [
  {
    label: "SALES",
    reports: [
      {
        key: "daily-sales",
        label: "Daily Sales",
        icon: Calendar,
        description: "Invoiced sales grouped by day, with taxable value and GST.",
        fetch: getDailySalesApi,
        hasBackendSearch: true,
        hasDateFilter: true,
        getCards: (data) => [
          { icon: Calendar, label: "Days", value: data?.summary?.days ?? 0 },
          { icon: TrendingUp, label: "Invoiced", value: formatINR(data?.summary?.totalSales) },
          { icon: Percent, label: "GST", value: formatINR(data?.summary?.totalGST) },
        ],
        getRows: (data) => data?.data ?? [],
        rowKey: (row) => row._id,
        columns: [
          { key: "date", header: "Date", render: (row) => formatDate(row._id) },
          { key: "invoiceCount", header: "Invoices" },
          { key: "taxable", header: "Taxable", render: (row) => formatINR(row.taxable) },
          { key: "gst", header: "GST", render: (row) => formatINR(row.gst) },
          { key: "sales", header: "Total", emphasis: true, render: (row) => formatINR(row.sales) },
        ],
      },
      {
        key: "monthly-sales",
        label: "Monthly Sales",
        icon: Calendar,
        description: "Revenue and GST collected per month.",
        fetch: getMonthlySalesApi,
        hasBackendSearch: false,
        hasDateFilter: true,
        clientSearchFields: (row) => [formatMonth(row._id)],
        getCards: (data) => [
          { icon: TrendingUp, label: "Revenue", value: formatINR(data?.summary?.totalTaxable) },
          { icon: Percent, label: "GST", value: formatINR(data?.summary?.totalGST) },
          { icon: Calendar, label: "Avg / month", value: formatINR(data?.summary?.avgPerMonth) },
        ],
        getRows: (data) => data?.data ?? [],
        rowKey: (row) => row._id,
        columns: [
          { key: "month", header: "Month", render: (row) => formatMonth(row._id) },
          { key: "taxable", header: "Revenue", render: (row) => formatINR(row.taxable) },
          { key: "gst", header: "GST", render: (row) => formatINR(row.gst) },
          { key: "sales", header: "Total", emphasis: true, render: (row) => formatINR(row.sales) },
        ],
      },
      {
        key: "quotations",
        label: "Quotation Report",
        icon: FileText,
        description: "Every quotation with its current status and quoted value.",
        fetch: getQuotationReportApi,
        hasBackendSearch: true,
        hasDateFilter: true,
        getCards: (data) => [
          { icon: TrendingUp, label: "Quoted value", value: formatINR(data?.summary?.totalValue) },
          { icon: FileText, label: "Quotations", value: data?.summary?.total ?? 0 },
          { icon: Percent, label: "Won / approved", value: data?.summary?.wonApproved ?? 0 },
        ],
        getRows: (data) => data?.quotations ?? [],
        rowKey: (row) => row._id,
        columns: [
          { key: "quotationNumber", header: "Quotation", emphasis: true },
          { key: "customer", header: "Customer", render: (row) => row.customer?.customerName ?? "—" },
          { key: "quotationDate", header: "Date", render: (row) => formatDate(row.quotationDate) },
          { key: "validUntil", header: "Valid Until", render: (row) => formatDate(row.validUntil) },
          { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
          { key: "total", header: "Value", emphasis: true, render: (row) => formatINR(row.total) },
        ],
      },
    ],
  },
  {
    label: "FINANCE",
    reports: [
      {
        key: "gst",
        label: "GST Report",
        icon: Percent,
        description: "Output tax liability per invoice, split into CGST and SGST.",
        fetch: getGstReportApi,
        hasBackendSearch: true,
        hasDateFilter: true,
        getCards: (data) => [
          { icon: TrendingUp, label: "Taxable value", value: formatINR(data?.summary?.taxableValue) },
          { icon: Percent, label: "CGST + SGST", value: formatINR(data?.summary?.cgstPlusSgst) },
          { icon: FileText, label: "Invoices", value: data?.summary?.invoiceCount ?? 0 },
        ],
        getRows: (data) => data?.rows ?? [],
        rowKey: (row, i) => `${row.invoiceNumber}-${i}`,
        columns: [
          { key: "invoiceNumber", header: "Invoice", emphasis: true },
          { key: "customer", header: "Customer" },
          { key: "date", header: "Date", render: (row) => formatDate(row.date) },
          { key: "taxable", header: "Taxable", render: (row) => formatINR(row.taxable) },
          { key: "cgst", header: "CGST", render: (row) => formatINR(row.cgst) },
          { key: "sgst", header: "SGST", render: (row) => formatINR(row.sgst) },
          { key: "totalGST", header: "Total GST", emphasis: true, render: (row) => formatINR(row.totalGST) },
        ],
      },
      {
        key: "outstanding",
        label: "Outstanding Report",
        icon: AlertCircle,
        description: "Receivables by customer, highest balance first.",
        fetch: getOutstandingReportApi,
        hasBackendSearch: true,
        hasDateFilter: false,
        getCards: (data) => [
          { icon: AlertCircle, label: "Total outstanding", value: formatINR(data?.summary?.totalOutstanding) },
          { icon: Users, label: "Customers", value: data?.summary?.customers ?? 0 },
          { icon: TrendingUp, label: "Avg balance", value: formatINR(data?.summary?.avgBalance) },
        ],
        getRows: (data) => data?.data ?? [],
        rowKey: (row) => row._id,
        columns: [
          { key: "customerName", header: "Customer", emphasis: true },
          { key: "invoiceCount", header: "Invoices" },
          { key: "creditLimit", header: "Credit Limit", render: (row) => formatINR(row.creditLimit) },
          { key: "lastPaymentDate", header: "Last Payment", render: (row) => formatDate(row.lastPaymentDate) },
          { key: "outstanding", header: "Outstanding", emphasis: true, render: (row) => formatINR(row.outstanding) },
        ],
      },
      {
        key: "ledger",
        label: "Ledger Report",
        icon: BookOpen,
        description: "Opening, movement and closing balance across ledger modules.",
        fetch: getLedgerReportApi,
        hasBackendSearch: true,
        hasDateFilter: true,
        getCards: (data) => [
          { icon: TrendingUp, label: "Total debit", value: formatINR(data?.summary?.totalDebit) },
          { icon: TrendingUp, label: "Total credit", value: formatINR(data?.summary?.totalCredit) },
          { icon: BookOpen, label: "Modules", value: data?.summary?.moduleCount ?? 0 },
        ],
        getRows: (data) => data?.modules ?? [],
        rowKey: (row) => row.module,
        columns: [
          { key: "module", header: "Module", emphasis: true },
          { key: "opening", header: "Opening", render: (row) => formatINR(row.opening) },
          { key: "debit", header: "Debit", render: (row) => formatINR(row.debit) },
          { key: "credit", header: "Credit", render: (row) => formatINR(row.credit) },
          { key: "closing", header: "Closing", emphasis: true, render: (row) => formatINR(row.closing) },
        ],
      },
      {
        key: "bank-summary",
        label: "Bank Summary",
        icon: Landmark,
        description: "Balance and today's cash flow across all bank accounts.",
        fetch: getBankSummaryReportApi,
        hasBackendSearch: true,
        hasDateFilter: true,
        getCards: (data) => [
          { icon: Landmark, label: "Total balance", value: formatINR(data?.summary?.totalBalance) },
          { icon: TrendingUp, label: "Today credit", value: formatINR(data?.summary?.todayCredit) },
          { icon: TrendingUp, label: "Today debit", value: formatINR(data?.summary?.todayDebit) },
        ],
        getRows: (data) => data?.banks ?? [],
        rowKey: (row) => row._id,
        columns: [
          { key: "bankName", header: "Bank", emphasis: true },
          { key: "accountNumber", header: "Account", render: (row) => maskAccountNumber(row.accountNumber) },
          { key: "branchName", header: "Branch", render: (row) => row.branchName || "—" },
          { key: "todayCredit", header: "Today Credit", render: (row) => formatINR(row.todayCredit) },
          { key: "todayDebit", header: "Today Debit", render: (row) => formatINR(row.todayDebit) },
          { key: "currentBalance", header: "Balance", emphasis: true, render: (row) => formatINR(row.currentBalance) },
        ],
      },
      {
        key: "payments",
        label: "Payment Report",
        icon: CreditCard,
        description: "All recorded payments with mode, status and amount.",
        fetch: getPaymentReportApi,
        hasBackendSearch: true,
        hasDateFilter: true,
        getCards: (data) => [
          { icon: TrendingUp, label: "Received", value: formatINR(data?.summary?.received) },
          { icon: AlertCircle, label: "Pending", value: formatINR(data?.summary?.pending) },
          { icon: CreditCard, label: "Transactions", value: data?.summary?.paymentCount ?? 0 },
        ],
        getRows: (data) => data?.payments ?? [],
        rowKey: (row) => row._id,
        columns: [
          { key: "paymentNumber", header: "Reference", emphasis: true, render: (row) => row.paymentNumber || row.referenceNumber || "—" },
          { key: "customer", header: "Customer", render: (row) => row.customer?.customerName ?? "—" },
          { key: "paymentMode", header: "Mode", render: (row) => (row.paymentMode || "").replace("_", " ") },
          { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
          { key: "paymentDate", header: "Date", render: (row) => formatDate(row.paymentDate) },
          { key: "amount", header: "Amount", emphasis: true, render: (row) => formatINR(row.amount) },
        ],
      },
    ],
  },
  {
    label: "INSIGHTS",
    reports: [
      {
        key: "top-customers",
        label: "Top Customers",
        icon: Users,
        description: "Customers ranked by invoiced business volume.",
        fetch: getTopCustomersApi,
        hasBackendSearch: false,
        hasDateFilter: true,
        clientSearchFields: (row) => [row.customerName],
        getCards: (data) => [
          { icon: TrendingUp, label: "Tracked business", value: formatINR(data?.summary?.trackedBusiness) },
          { icon: Users, label: "Customers", value: data?.summary?.customerCount ?? 0 },
          { icon: Users, label: "Top account", value: data?.summary?.topAccount || "—" },
        ],
        getRows: (data) => data?.customers ?? [],
        rowKey: (row) => row._id,
        columns: [
          { key: "customerName", header: "Customer", emphasis: true, render: (row) => row.customerName || "—" },
          { key: "invoiceCount", header: "Invoices" },
          { key: "outstanding", header: "Outstanding", render: (row) => formatINR(row.outstanding) },
          { key: "totalSales", header: "Business", emphasis: true, render: (row) => formatINR(row.totalSales) },
        ],
      },
      {
        key: "top-products",
        label: "Top Products",
        icon: Package,
        description: "Best-selling products by invoiced revenue.",
        fetch: getTopProductsApi,
        hasBackendSearch: false,
        hasDateFilter: true,
        clientSearchFields: (row) => [row.productName],
        getCards: (data) => [
          { icon: TrendingUp, label: "Product revenue", value: formatINR(data?.summary?.productRevenue) },
          { icon: Package, label: "Products", value: data?.summary?.productCount ?? 0 },
          { icon: Package, label: "Best seller", value: data?.summary?.bestSeller || "—" },
        ],
        getRows: (data) => data?.products ?? [],
        rowKey: (row) => row._id,
        columns: [
          { key: "productName", header: "Product", emphasis: true, render: (row) => row.productName || "—" },
          { key: "quantity", header: "Qty Sold" },
          { key: "revenue", header: "Revenue", emphasis: true, render: (row) => formatINR(row.revenue) },
        ],
      },
      {
        key: "quotation-conversion",
        label: "Quotation Conversion Report",
        icon: TrendingUp,
        description: "Funnel of quotations by status and overall conversion rate.",
        fetch: getQuotationConversionApi,
        hasBackendSearch: false,
        hasDateFilter: true,
        clientSearchFields: (row) => [row.status],
        getCards: (data) => [
          { icon: TrendingUp, label: "Conversion rate", value: `${data?.conversionRate ?? 0}%` },
          { icon: FileText, label: "Converted", value: `${data?.converted ?? 0} / ${data?.totalQuotations ?? 0}` },
          { icon: TrendingUp, label: "Converted value", value: formatINR(data?.convertedValue) },
        ],
        getRows: (data) => data?.statuses ?? [],
        rowKey: (row) => row.status,
        columns: [
          { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
          { key: "count", header: "Count" },
          { key: "share", header: "Share", render: (row) => `${row.share}%` },
          { key: "value", header: "Value", emphasis: true, render: (row) => formatINR(row.value) },
        ],
      },
    ],
  },
];

export const ALL_REPORTS = REPORT_GROUPS.flatMap((group) => group.reports);
