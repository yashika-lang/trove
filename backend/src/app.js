import express from "express"; 
import cors from "cors";
import cookieParser from "cookie-parser";
import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import customerRoutes from "./routes/customer.routes.js";
import productRoutes from "./routes/product.routes.js";
import quotationRoutes from "./routes/quotation.routes.js";
import invoiceRoutes from "./routes/invoice.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import bankRoutes from "./routes/bank.routes.js";
import bankTransactionRoutes from "./routes/bankTransaction.routes.js";
import bankImportRoutes from "./routes/bankImport.routes.js";
import reconciliationRoutes from "./routes/reconciliation.routes.js";
import ledgerRoutes from "./routes/ledger.routes.js";
import bankDashboardRoutes from "./routes/bankDashboard.routes.js";
import cashLedgerRoutes from "./routes/cashLedger.routes.js";
import gstLedgerRoutes from "./routes/gstLedger.routes.js";

import gstDashboardRoutes from "./routes/gstDashboard.routes.js";
import gstTransactionRoutes from "./routes/gstTransaction.routes.js";
import hsnSacRoutes from "./routes/hsnSac.routes.js";
import taxRateRoutes from "./routes/taxRate.routes.js";
import itcRoutes from "./routes/itc.routes.js";
import gstReconciliationRoutes from "./routes/gstReconciliation.routes.js";
import gstReturnRoutes from "./routes/gstReturn.routes.js";
import gstSettingsRoutes from "./routes/gstSettings.routes.js";
import gstAuditLogRoutes from "./routes/gstAuditLog.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import salesDashboardRoutes
  from "./routes/salesDashboard.routes.js";

import accountantDashboardRoutes
  from "./routes/accountantDashboard.routes.js";
  import reportRoutes from "./routes/report.routes.js";

import reportExportRoutes
  from "./routes/reportExport.routes.js";
  import profileRoutes from "./routes/profile.routes.js";
  import settingsRoutes from "./routes/settings.routes.js";

/*import authRoutes from "./routes/auth.routes.js"; */

import { notFound } from "./middleware/notFound.middleware.js";
import globalErrorHandler from "./exceptions/globalErrorHandler.js";


const app = express(); // it returns an instance of express application say : get , post put , delete etc 

// CORS
app.use( // middleware to handle cross- origin requests 
  cors({ 
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

// Body Parsers
app.use(express.json()); // it converts the incoming request body to json format and makes it available in req.body

app.use(express.urlencoded({ extended: true })); // it parses the incoming request body with URL-encoded format

// Cookies
app.use(cookieParser()); // it parses the cookies attached to the client request object and makes them available in req.cookies

// Static Files
app.use(express.static("public")); // it serves static files from the "public" directory, allowing access to files like images, CSS, and JavaScript in that directory

// Routes
/* app.use("/api/v1/auth", authRoutes); */

app.use("/api/v1/health", healthRoutes);
app.use("/api/v1/auth", authRoutes); // it mounts the authRoutes router on the "/api/v1/auth" path, so any requests to that path will be handled by the authRoutes router
app.use("/api/v1/customers", customerRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/quotations", quotationRoutes);
app.use("/api/v1/invoices", invoiceRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/banks", bankRoutes);
app.use(
  "/api/v1/bank-transactions",
  bankTransactionRoutes
);
app.use(
  "/api/v1/bank-import",
  bankImportRoutes
);
app.use(
  "/api/v1/reconciliation",
  reconciliationRoutes
);
app.use(
  "/api/v1/ledger",
  ledgerRoutes
);
app.use(
  "/api/v1/bank-dashboard",
  bankDashboardRoutes
);
app.use(
  "/api/v1/cash-ledger",
  cashLedgerRoutes
);
app.use(
  "/api/v1/gst-ledger",
  gstLedgerRoutes
);
app.use(
  "/api/v1/gst-dashboard",
  gstDashboardRoutes
);

app.use(
  "/api/v1/gst-transactions",
  gstTransactionRoutes
);

app.use(
  "/api/v1/hsn-sac",
  hsnSacRoutes
);

app.use(
  "/api/v1/tax-rates",
  taxRateRoutes
);

app.use(
  "/api/v1/itc",
  itcRoutes
);

app.use(
  "/api/v1/gst-reconciliation",
  gstReconciliationRoutes
);

app.use(
  "/api/v1/gst-returns",
  gstReturnRoutes
);

app.use(
  "/api/v1/gst-settings",
  gstSettingsRoutes
);

app.use(
  "/api/v1/gst-audit-logs",
  gstAuditLogRoutes
);
app.use(
  "/api/v1/dashboard",
  dashboardRoutes
);
app.use(
  "/api/v1/sales-dashboard",
  salesDashboardRoutes
);

app.use(
  "/api/v1/accountant-dashboard",
  accountantDashboardRoutes
);
app.use(
  "/api/v1/reports",
  reportRoutes
);
app.use(
  "/api/v1/reports-export",
  reportExportRoutes
);
app.use(
  "/api/v1/profile",
  profileRoutes
);
app.use("/api/v1/settings", settingsRoutes);
// 404 Middleware
app.use(notFound); 
// Global Error Handler
app.use(globalErrorHandler); 

export default app; 
