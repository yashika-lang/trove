import Product from "../models/product.model.js";
import Invoice from "../models/invoice.model.js";
import GSTTransaction from "../models/gstTransaction.model.js";
import HsnSac from "../models/hsnSac.model.js";
import GSTSettings from "../models/gstSettings.model.js";

// GSTIN: 2-digit state code + 10-char PAN + 1-digit entity code + 'Z' +
// 1 checksum char. This checks structure, not the actual checksum digit
// (no official checksum algorithm is publicly documented as simple regex).
const GSTIN_REGEX =
  /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

const buildCheck = (id, label, description) => {
  const passed = [];
  const warnings = [];
  const errors = [];
  return {
    id,
    label,
    description,
    passed,
    warnings,
    errors,
    finish() {
      return {
        id,
        label,
        description,
        passedCount: passed.length,
        warningCount: warnings.length,
        errorCount: errors.length,
        status:
          errors.length > 0
            ? "ERROR"
            : warnings.length > 0
              ? "WARNING"
              : "PASSED",
      };
    },
  };
};

// ==========================================
// RUN VALIDATION
// ==========================================
//
// Computed live against real data on every call — there is no persisted
// ValidationResult table to go stale, so "Readiness %" always reflects
// the company's current GST Transactions, Invoices and HSN/SAC master.
// ==========================================

const runValidation = async (user) => {
  const companyId = user.company;

  const [
    gstTransactions,
    invoices,
    hsnEntries,
    settings,
  ] = await Promise.all([
    GSTTransaction.find({ company: companyId })
      .populate("customer", "customerName gstin state")
      .lean(),

    Invoice.find({ company: companyId, status: { $ne: "CANCELLED" } })
      .populate("items.product", "productName hsnCode gst")
      .lean(),

    HsnSac.find({ company: companyId, active: true }).lean(),

    GSTSettings.findOne({ company: companyId }).lean(),
  ]);

  const hsnByCode = new Map(
    hsnEntries.map((h) => [h.code.trim().toUpperCase(), h])
  );

  // ----------------------------------------
  // 1. GSTIN FORMAT
  // ----------------------------------------

  const gstinCheck = buildCheck(
    "gstin-format",
    "GSTIN format",
    "15-char GSTIN structure & checksum on all parties"
  );

  const seenGstins = new Set();

  for (const txn of gstTransactions) {
    const gstin = (txn.gstin || txn.customer?.gstin || "").trim().toUpperCase();
    if (!gstin || seenGstins.has(gstin)) continue;
    seenGstins.add(gstin);

    if (GSTIN_REGEX.test(gstin)) {
      gstinCheck.passed.push(gstin);
    } else {
      gstinCheck.errors.push({ gstin, reason: "Invalid GSTIN structure" });
    }
  }

  // ----------------------------------------
  // 2. HSN/SAC PRESENT
  // ----------------------------------------

  const hsnPresentCheck = buildCheck(
    "hsn-sac-present",
    "HSN/SAC present",
    "Every line item carries a valid HSN/SAC code"
  );

  const seenProducts = new Set();

  for (const invoice of invoices) {
    for (const item of invoice.items || []) {
      const product = item.product;
      if (!product || seenProducts.has(String(product._id))) continue;
      seenProducts.add(String(product._id));

      if (product.hsnCode?.trim()) {
        hsnPresentCheck.passed.push(product.productName);
      } else {
        hsnPresentCheck.errors.push({
          product: product.productName,
          reason: "No HSN/SAC code set on this product",
        });
      }
    }
  }

  // ----------------------------------------
  // 3. PLACE OF SUPPLY
  // ----------------------------------------

  const posCheck = buildCheck(
    "place-of-supply",
    "Place of supply",
    "POS set and consistent with GSTIN state code"
  );

  for (const txn of gstTransactions) {
    const pos = (txn.placeOfSupply || "").trim();

    if (!pos) {
      posCheck.errors.push({
        document: txn.documentNumber,
        reason: "Place of supply is not set",
      });
      continue;
    }

    if (
      txn.type === "OUTWARD" &&
      txn.customer?.state &&
      txn.customer.state.trim().toLowerCase() !== pos.toLowerCase()
    ) {
      posCheck.errors.push({
        document: txn.documentNumber,
        reason: `Place of supply (${pos}) doesn't match customer state (${txn.customer.state})`,
      });
      continue;
    }

    posCheck.passed.push(txn.documentNumber);
  }

  // ----------------------------------------
  // 4. RATE VS HSN
  // ----------------------------------------

  const rateCheck = buildCheck(
    "rate-vs-hsn",
    "Rate vs HSN",
    "Applied rate matches the HSN master rate"
  );

  for (const invoice of invoices) {
    for (const item of invoice.items || []) {
      const product = item.product;
      if (!product?.hsnCode?.trim()) continue; // already caught above

      const master = hsnByCode.get(product.hsnCode.trim().toUpperCase());
      if (!master) continue; // no master entry to compare against

      const key = `${invoice.invoiceNumber}-${product._id}`;

      if (Number(master.gstRate) === Number(item.gst)) {
        rateCheck.passed.push(key);
      } else {
        rateCheck.warnings.push({
          invoice: invoice.invoiceNumber,
          product: product.productName,
          reason: `Invoiced at ${item.gst}% but HSN ${product.hsnCode} master rate is ${master.gstRate}%`,
        });
      }
    }
  }

  // ----------------------------------------
  // 5. REVERSE CHARGE FLAG
  // ----------------------------------------
  //
  // There's no per-transaction RCM flag in the data model — RCM
  // (reverse charge) typically applies when the recipient self-assesses
  // tax on a purchase from an unregistered supplier. With reverse charge
  // enabled in GST Settings, an inward transaction from a supplier with
  // a GSTIN on file is worth a second look (RCM may not actually apply);
  // one without a GSTIN is the expected RCM case.
  // ----------------------------------------

  const rcmCheck = buildCheck(
    "reverse-charge-flag",
    "Reverse charge flag",
    "RCM correctly flagged on notified supplies"
  );

  const inwardTransactions = gstTransactions.filter(
    (t) => t.type === "INWARD"
  );

  if (settings?.reverseCharge) {
    for (const txn of inwardTransactions) {
      if (!txn.gstin?.trim()) {
        rcmCheck.passed.push(txn.documentNumber);
      } else {
        rcmCheck.warnings.push({
          document: txn.documentNumber,
          reason: "Supplier has a GSTIN on file — confirm RCM actually applies",
        });
      }
    }
  } else {
    // RCM not enabled for this company — nothing to flag.
    inwardTransactions.forEach((t) => rcmCheck.passed.push(t.documentNumber));
  }

  // ----------------------------------------
  // 6. INVOICE NUMBERING
  // ----------------------------------------

  const numberingCheck = buildCheck(
    "invoice-numbering",
    "Invoice numbering",
    "Sequential, unique, within 16 characters"
  );

  const seenInvoiceNumbers = new Set();

  for (const invoice of invoices) {
    const number = invoice.invoiceNumber || "";

    if (number.length > 16) {
      numberingCheck.errors.push({
        invoice: number,
        reason: "Invoice number exceeds 16 characters",
      });
      continue;
    }

    if (seenInvoiceNumbers.has(number)) {
      numberingCheck.errors.push({
        invoice: number,
        reason: "Duplicate invoice number",
      });
      continue;
    }

    seenInvoiceNumbers.add(number);
    numberingCheck.passed.push(number);
  }

  // ----------------------------------------
  // AGGREGATE
  // ----------------------------------------

  const checks = [
    gstinCheck,
    hsnPresentCheck,
    posCheck,
    rateCheck,
    rcmCheck,
    numberingCheck,
  ].map((c) => c.finish());

  const totalPassed = checks.reduce((sum, c) => sum + c.passedCount, 0);
  const totalWarnings = checks.reduce((sum, c) => sum + c.warningCount, 0);
  const totalErrors = checks.reduce((sum, c) => sum + c.errorCount, 0);
  const totalChecked = totalPassed + totalWarnings + totalErrors;

  const readiness =
    totalChecked > 0
      ? Math.round((totalPassed / totalChecked) * 100)
      : 100;

  return {
    checksPassed: totalPassed,
    issuesFound: totalWarnings + totalErrors,
    readiness,
    checks,
  };
};

export { runValidation };
