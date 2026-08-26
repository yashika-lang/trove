import CreditDebitNoteRepository from "../repositories/creditDebitNote.repository.js";
import Invoice from "../models/invoice.model.js";
import Product from "../models/product.model.js";
import Company from "../models/company.model.js";
import Customer from "../models/customer.model.js";
import ApiError from "../exceptions/ApiError.js";

const PREFIX = { CREDIT_NOTE: "CN", DEBIT_NOTE: "DN" };

class CreditDebitNoteService {
  constructor() {
    this.repository = new CreditDebitNoteRepository();
  }

  // Same intra-state (CGST+SGST) / inter-state (IGST) split used by
  // quotation.service.js / invoice.service.js.
  calculateGST(totalGST, companyState, customerState) {
    const sameState =
      companyState?.trim().toLowerCase() === customerState?.trim().toLowerCase();

    if (sameState) {
      return { cgst: totalGST / 2, sgst: totalGST / 2, igst: 0 };
    }
    return { cgst: 0, sgst: 0, igst: totalGST };
  }

  async create({ invoiceId, type, reason, items }, companyId, userId) {
    if (!PREFIX[type]) {
      throw new ApiError(400, "Invalid note type.");
    }

    const invoice = await Invoice.findOne({ _id: invoiceId, company: companyId });
    if (!invoice) {
      throw new ApiError(404, "Invoice not found.");
    }

    const customer = await Customer.findOne({
      _id: invoice.customer,
      company: companyId,
    });
    if (!customer) {
      throw new ApiError(404, "Customer not found.");
    }

    const company = await Company.findById(companyId);
    if (!company?.state) {
      throw new ApiError(400, "Company state is required for GST calculation.");
    }

    let subtotal = 0;
    let totalGST = 0;
    const processedItems = [];

    for (const item of items) {
      const product = await Product.findOne({ _id: item.product, company: companyId });
      if (!product) {
        throw new ApiError(404, "Product not found.");
      }

      const amount = item.quantity * product.price;
      const itemGST = (amount * product.gst) / 100;

      subtotal += amount;
      totalGST += itemGST;

      processedItems.push({
        product: product._id,
        quantity: item.quantity,
        rate: product.price,
        gst: product.gst,
        amount,
      });
    }

    const { cgst, sgst, igst } = this.calculateGST(totalGST, company.state, customer.state);
    const total = subtotal + cgst + sgst + igst;

    const last = await this.repository.findLast(companyId, type);
    let nextNumber = 1;
    if (last) {
      nextNumber = parseInt(last.noteNumber.replace(`${PREFIX[type]}-`, ""), 10) + 1;
    }
    const noteNumber = `${PREFIX[type]}-${String(nextNumber).padStart(4, "0")}`;

    return await this.repository.create({
      noteNumber,
      type,
      invoice: invoice._id,
      customer: customer._id,
      reason,
      items: processedItems,
      subtotal,
      cgst,
      sgst,
      igst,
      total,
      status: "ISSUED",
      company: companyId,
      createdBy: userId,
    });
  }

  async getAll({ companyId, invoice, type, page = 1, limit = 10 }) {
    return await this.repository.findByCompany({ companyId, invoice, type, page, limit });
  }

  async getById(noteId, companyId) {
    const note = await this.repository.findById(noteId, companyId);
    if (!note) {
      throw new ApiError(404, "Note not found.");
    }
    return note;
  }
}

export default CreditDebitNoteService;
