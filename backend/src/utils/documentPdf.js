import PDFDocument from "pdfkit";

const formatINR = (value) => `Rs. ${Number(value ?? 0).toLocaleString("en-IN")}`;
const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "-";

// Renders a Quotation or Invoice mongoose document (populated: customer,
// items.product) into a PDF buffer. Used for both the quotation and
// invoice per-document "Download PDF" actions.
const buildDocumentPdf = ({ kind, doc }) => {
  return new Promise((resolve, reject) => {
    try {
      const pdf = new PDFDocument({ margin: 50, size: "A4" });
      const chunks = [];

      pdf.on("data", (chunk) => chunks.push(chunk));
      pdf.on("end", () => resolve(Buffer.concat(chunks)));

      const number = kind === "invoice" ? doc.invoiceNumber : doc.quotationNumber;
      const dateField = kind === "invoice" ? doc.invoiceDate : doc.quotationDate;
      const dateLabel = kind === "invoice" ? "Invoice Date" : "Quotation Date";
      const secondDateField = kind === "invoice" ? doc.dueDate : doc.validUntil;
      const secondDateLabel = kind === "invoice" ? "Due Date" : "Valid Until";

      pdf.fontSize(20).text(kind === "invoice" ? "Tax Invoice" : "Quotation", { align: "right" });
      pdf.fontSize(11).fillColor("#555").text(number, { align: "right" });
      pdf.moveDown(1.5);

      pdf.fillColor("#000").fontSize(11);
      pdf.text(`Bill To: ${doc.customer?.customerName ?? "-"}`);
      pdf.fillColor("#555").fontSize(9);
      pdf.text(doc.customer?.billingAddress ?? "");
      pdf.text(`GSTIN: ${doc.customer?.gstin ?? "-"}  ·  State: ${doc.customer?.state ?? "-"}`);
      pdf.moveDown(1);

      pdf.fillColor("#000").fontSize(10);
      pdf.text(`${dateLabel}: ${formatDate(dateField)}      ${secondDateLabel}: ${formatDate(secondDateField)}`);
      pdf.moveDown(1);

      // Items table
      const tableTop = pdf.y;
      const cols = { product: 50, hsn: 220, qty: 290, rate: 340, gst: 410, amount: 470 };
      pdf.fontSize(9).fillColor("#555");
      pdf.text("Product", cols.product, tableTop);
      pdf.text("HSN", cols.hsn, tableTop);
      pdf.text("Qty", cols.qty, tableTop);
      pdf.text("Rate", cols.rate, tableTop);
      pdf.text("GST%", cols.gst, tableTop);
      pdf.text("Amount", cols.amount, tableTop);
      pdf.moveTo(50, tableTop + 14).lineTo(545, tableTop + 14).strokeColor("#ddd").stroke();

      let y = tableTop + 20;
      pdf.fillColor("#000").fontSize(9);
      for (const item of doc.items ?? []) {
        pdf.text(item.product?.productName ?? "-", cols.product, y, { width: 160 });
        pdf.text(item.product?.hsnCode ?? "-", cols.hsn, y);
        pdf.text(String(item.quantity), cols.qty, y);
        pdf.text(formatINR(item.rate), cols.rate, y);
        pdf.text(String(item.gst), cols.gst, y);
        pdf.text(formatINR(item.amount), cols.amount, y);
        y += 18;
      }

      pdf.moveTo(50, y + 4).lineTo(545, y + 4).strokeColor("#ddd").stroke();
      y += 14;

      const totalsLine = (label, value, bold = false) => {
        pdf.fontSize(bold ? 11 : 9).fillColor(bold ? "#000" : "#555");
        pdf.text(label, 380, y);
        pdf.text(value, cols.amount, y);
        y += bold ? 18 : 14;
      };

      totalsLine("Subtotal", formatINR(doc.subtotal));
      if (doc.cgst > 0) totalsLine("CGST", formatINR(doc.cgst));
      if (doc.sgst > 0) totalsLine("SGST", formatINR(doc.sgst));
      if (doc.igst > 0) totalsLine("IGST", formatINR(doc.igst));
      totalsLine("Total", formatINR(doc.total), true);

      if (kind === "invoice") {
        totalsLine("Amount Paid", formatINR(doc.amountPaid));
        totalsLine("Balance Due", formatINR(doc.balanceDue), true);
      }

      if (doc.notes) {
        y += 10;
        pdf.fontSize(9).fillColor("#555").text("Notes", 50, y);
        pdf.fillColor("#000").text(doc.notes, 50, y + 12, { width: 495 });
        y = pdf.y + 10;
      }

      if (doc.termsAndConditions) {
        pdf.fontSize(9).fillColor("#555").text("Terms & Conditions", 50, y);
        pdf.fillColor("#000").text(doc.termsAndConditions, 50, y + 12, { width: 495 });
      }

      pdf.end();
    } catch (error) {
      reject(error);
    }
  });
};

// Renders a Payment mongoose document (populated: customer, invoice) as a
// simple one-page receipt. Used by the payment "Print Receipt / PDF" action.
const buildPaymentReceiptPdf = (payment) => {
  return new Promise((resolve, reject) => {
    try {
      const pdf = new PDFDocument({ margin: 50, size: "A4" });
      const chunks = [];

      pdf.on("data", (chunk) => chunks.push(chunk));
      pdf.on("end", () => resolve(Buffer.concat(chunks)));

      pdf.fontSize(20).text("Payment Receipt", { align: "right" });
      pdf.fontSize(11).fillColor("#555").text(payment.paymentNumber, { align: "right" });
      pdf.moveDown(1.5);

      pdf.fillColor("#000").fontSize(11);
      pdf.text(`Received From: ${payment.customer?.customerName ?? "-"}`);
      pdf.fillColor("#555").fontSize(9);
      pdf.text(payment.customer?.email ?? "");
      pdf.moveDown(1);

      const row = (label, value) => {
        pdf.fontSize(10).fillColor("#555").text(label, 50, pdf.y, { continued: true, width: 150 });
        pdf.fillColor("#000").text(value ?? "-");
        pdf.moveDown(0.4);
      };

      row("Date", formatDate(payment.paymentDate));
      row("Invoice", payment.invoice?.invoiceNumber ?? "On account");
      row("Amount", formatINR(payment.amount));
      row("Payment Mode", payment.paymentMode);
      row("Status", payment.status);
      if (payment.utr) row("UTR", payment.utr);
      if (payment.referenceNumber) row("Reference Number", payment.referenceNumber);
      if (payment.remarks) row("Remarks", payment.remarks);

      pdf.end();
    } catch (error) {
      reject(error);
    }
  });
};

export { buildDocumentPdf, buildPaymentReceiptPdf };
