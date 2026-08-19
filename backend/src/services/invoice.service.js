import mongoose from "mongoose";
import InvoiceRepository from "../repositories/invoice.repository.js";
import QuotationRepository from "../repositories/quotation.repository.js";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";
import Company from "../models/company.model.js";
import ApiError from "../exceptions/ApiError.js";

class InvoiceService {
  constructor() {
    this.invoiceRepository = new InvoiceRepository();
    this.quotationRepository = new QuotationRepository();
  }

  // ==========================================
  // CALCULATE GST
  // ==========================================

  calculateGST(
    totalGST,
    companyState,
    customerState
  ) {
    const sameState =
      companyState?.trim().toLowerCase() ===
      customerState?.trim().toLowerCase();

    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    if (sameState) {
      // Intra-state
      cgst = totalGST / 2;
      sgst = totalGST / 2;
    } else {
      // Inter-state
      igst = totalGST;
    }

    return {
      cgst,
      sgst,
      igst,
    };
  }

  // ==========================================
  // CREATE DIRECT INVOICE
  // ==========================================

  async createInvoice(
    invoiceData,
    companyId,
    userId
  ) {
    const {
      customer,
      invoiceDate,
      dueDate,
      items,
      notes,
      termsAndConditions,
    } = invoiceData;

    // ----------------------------------------
    // CHECK CUSTOMER
    // ----------------------------------------

    const customerExists =
      await Customer.findOne({
        _id: customer,
        company: companyId,
      });

    if (!customerExists) {
      throw new ApiError(
        404,
        "Customer not found."
      );
    }

    if (!customerExists.state) {
      throw new ApiError(
        400,
        "Customer state is required for GST calculation."
      );
    }

    // ----------------------------------------
    // CHECK COMPANY
    // ----------------------------------------

    const company =
      await Company.findById(companyId);

    if (!company) {
      throw new ApiError(
        404,
        "Company not found."
      );
    }

    if (!company.state) {
      throw new ApiError(
        400,
        "Company state is required for GST calculation."
      );
    }

    // ----------------------------------------
    // CHECK DATES
    // ----------------------------------------

    if (
      new Date(dueDate) <=
      new Date(invoiceDate)
    ) {
      throw new ApiError(
        400,
        "Due date must be after invoice date."
      );
    }

    // ----------------------------------------
    // CALCULATE ITEMS
    // ----------------------------------------

    let subtotal = 0;
    let totalGST = 0;

    const processedItems = [];

    for (const item of items) {
      const product =
        await Product.findOne({
          _id: item.product,
          company: companyId,
        });

      if (!product) {
        throw new ApiError(
          404,
          "Product not found."
        );
      }

      const amount =
        item.quantity * product.price;

      const itemGST =
        (amount * product.gst) / 100;

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

    // ----------------------------------------
    // GST CALCULATION
    // ----------------------------------------

    const {
      cgst,
      sgst,
      igst,
    } = this.calculateGST(
      totalGST,
      company.state,
      customerExists.state
    );

    // ----------------------------------------
    // TOTAL
    // ----------------------------------------

    const total =
      subtotal +
      cgst +
      sgst +
      igst;

    // ----------------------------------------
    // GENERATE INVOICE NUMBER
    // ----------------------------------------

    const lastInvoice =
      await this.invoiceRepository
        .findLastInvoice(companyId);

    let nextNumber = 1;

    if (lastInvoice) {
      const lastNumber =
        parseInt(
          lastInvoice.invoiceNumber
            .replace("INV-", ""),
          10
        );

      nextNumber =
        lastNumber + 1;
    }

    const invoiceNumber =
      `INV-${String(nextNumber)
        .padStart(4, "0")}`;

    // ----------------------------------------
    // FINAL INVOICE DATA
    // ----------------------------------------

    const finalInvoiceData = {
      invoiceNumber,
      customer,
      quotation: null,
      invoiceDate,
      dueDate,
      items: processedItems,
      subtotal,
      cgst,
      sgst,
      igst,
      total,
      amountPaid: 0,
      balanceDue: total,
      status: "DRAFT",
      notes,
      termsAndConditions,
      company: companyId,
      createdBy: userId,
    };

    return await this.invoiceRepository
      .createInvoice(
        finalInvoiceData
      );
  }

  // ==========================================
  // GET ALL INVOICES
  // ==========================================

  async getAllInvoices({
    companyId,
    search,
    status,
    page,
    limit,
  }) {
    return await this.invoiceRepository
      .findInvoices({
        companyId,
        search,
        status,
        page,
        limit,
      });
  }

  // ==========================================
  // GET INVOICE BY ID
  // ==========================================

  async getInvoiceById(
    invoiceId,
    companyId
  ) {
    if (
      !mongoose.Types.ObjectId.isValid(
        invoiceId
      )
    ) {
      throw new ApiError(
        400,
        "Invalid invoice ID."
      );
    }

    const invoice =
      await this.invoiceRepository
        .findInvoiceById(
          invoiceId,
          companyId
        );

    if (!invoice) {
      throw new ApiError(
        404,
        "Invoice not found."
      );
    }

    return invoice;
  }

  // ==========================================
  // UPDATE INVOICE
  // ==========================================

  async updateInvoice(
    invoiceId,
    companyId,
    updateData
  ) {
    const invoice =
      await this.getInvoiceById(
        invoiceId,
        companyId
      );

    if (
      ["PAID", "CANCELLED"].includes(
        invoice.status
      )
    ) {
      throw new ApiError(
        400,
        `Invoice with status ${invoice.status} cannot be updated.`
      );
    }

    const {
      customer,
      invoiceDate,
      dueDate,
      items,
      notes,
      termsAndConditions,
    } = updateData;

    // ----------------------------------------
    // COMPANY
    // ----------------------------------------

    const company =
      await Company.findById(
        companyId
      );

    if (!company) {
      throw new ApiError(
        404,
        "Company not found."
      );
    }

    if (!company.state) {
      throw new ApiError(
        400,
        "Company state is required for GST calculation."
      );
    }

    // ----------------------------------------
    // FINAL CUSTOMER
    // ----------------------------------------

    const finalCustomerId =
      customer ||
      invoice.customer;

    const customerExists =
      await Customer.findOne({
        _id: finalCustomerId,
        company: companyId,
      });

    if (!customerExists) {
      throw new ApiError(
        404,
        "Customer not found."
      );
    }

    if (!customerExists.state) {
      throw new ApiError(
        400,
        "Customer state is required for GST calculation."
      );
    }

    // ----------------------------------------
    // CHECK DATES
    // ----------------------------------------

    const finalInvoiceDate =
      invoiceDate ||
      invoice.invoiceDate;

    const finalDueDate =
      dueDate ||
      invoice.dueDate;

    if (
      new Date(finalDueDate) <=
      new Date(finalInvoiceDate)
    ) {
      throw new ApiError(
        400,
        "Due date must be after invoice date."
      );
    }

    // ----------------------------------------
    // BASIC UPDATE DATA
    // ----------------------------------------

    const finalUpdateData = {
      ...(customer && {
        customer,
      }),

      ...(invoiceDate && {
        invoiceDate,
      }),

      ...(dueDate && {
        dueDate,
      }),

      ...(notes !== undefined && {
        notes,
      }),

      ...(termsAndConditions !== undefined && {
        termsAndConditions,
      }),
    };

    // ----------------------------------------
    // RECALCULATE ITEMS + GST
    // ----------------------------------------

    if (items) {
      let subtotal = 0;
      let totalGST = 0;

      const processedItems = [];

      for (const item of items) {
        const product =
          await Product.findOne({
            _id: item.product,
            company: companyId,
          });

        if (!product) {
          throw new ApiError(
            404,
            "Product not found."
          );
        }

        const amount =
          item.quantity *
          product.price;

        const itemGST =
          (amount * product.gst) /
          100;

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

      // --------------------------------------
      // GST CALCULATION
      // --------------------------------------

      const {
        cgst,
        sgst,
        igst,
      } = this.calculateGST(
        totalGST,
        company.state,
        customerExists.state
      );

      const total =
        subtotal +
        cgst +
        sgst +
        igst;

      finalUpdateData.items =
        processedItems;

      finalUpdateData.subtotal =
        subtotal;

      finalUpdateData.cgst =
        cgst;

      finalUpdateData.sgst =
        sgst;

      finalUpdateData.igst =
        igst;

      finalUpdateData.total =
        total;

      finalUpdateData.balanceDue =
        total - invoice.amountPaid;
    }

    // ----------------------------------------
    // CUSTOMER CHANGED BUT ITEMS DID NOT
    // ----------------------------------------

    else if (customer) {
      const oldTotalGST =
        (invoice.cgst || 0) +
        (invoice.sgst || 0) +
        (invoice.igst || 0);

      const {
        cgst,
        sgst,
        igst,
      } = this.calculateGST(
        oldTotalGST,
        company.state,
        customerExists.state
      );

      const total =
        invoice.subtotal +
        cgst +
        sgst +
        igst;

      finalUpdateData.cgst =
        cgst;

      finalUpdateData.sgst =
        sgst;

      finalUpdateData.igst =
        igst;

      finalUpdateData.total =
        total;

      finalUpdateData.balanceDue =
        total - invoice.amountPaid;
    }

    return await this.invoiceRepository
      .updateInvoice(
        invoiceId,
        companyId,
        finalUpdateData
      );
  }

  // ==========================================
  // UPDATE INVOICE STATUS
  // ==========================================

  async updateInvoiceStatus(
    invoiceId,
    companyId,
    status
  ) {
    const invoice =
      await this.getInvoiceById(
        invoiceId,
        companyId
      );

    if (
      invoice.status === "CANCELLED"
    ) {
      throw new ApiError(
        400,
        "Cancelled invoice status cannot be changed."
      );
    }

    if (
      invoice.status === "PAID" &&
      status !== "PAID"
    ) {
      throw new ApiError(
        400,
        "Paid invoice status cannot be changed."
      );
    }

    return await this.invoiceRepository
      .updateInvoice(
        invoiceId,
        companyId,
        {
          status,
        }
      );
  }

  // ==========================================
  // DELETE INVOICE
  // ==========================================

  async deleteInvoice(
    invoiceId,
    companyId
  ) {
    const invoice =
      await this.getInvoiceById(
        invoiceId,
        companyId
      );

    if (
      invoice.status !== "DRAFT"
    ) {
      throw new ApiError(
        400,
        "Only draft invoices can be deleted."
      );
    }

    return await this.invoiceRepository
      .deleteInvoice(
        invoiceId,
        companyId
      );
  }

  // ==========================================
  // GET INVOICE STATS
  // ==========================================

  async getInvoiceStats(
    companyId
  ) {
    const stats =
      await this.invoiceRepository
        .getInvoiceStats(
          companyId
        );

    return (
      stats[0] || {
        totalInvoices: 0,
        paid: 0,
        outstanding: 0,
        overdue: 0,
      }
    );
  }

  // ==========================================
  // CREATE INVOICE FROM QUOTATION
  // ==========================================

  async createInvoiceFromQuotation(
    quotationId,
    companyId,
    userId,
    dueDate
  ) {
    // ----------------------------------------
    // VALIDATE QUOTATION ID
    // ----------------------------------------

    if (
      !mongoose.Types.ObjectId.isValid(
        quotationId
      )
    ) {
      throw new ApiError(
        400,
        "Invalid quotation ID."
      );
    }

    // ----------------------------------------
    // GET QUOTATION
    // ----------------------------------------

    const quotation =
      await this.quotationRepository
        .findQuotationById(
          quotationId,
          companyId
        );

    if (!quotation) {
      throw new ApiError(
        404,
        "Quotation not found."
      );
    }

    // ----------------------------------------
    // CHECK QUOTATION STATUS
    // ----------------------------------------

    if (
      quotation.status !== "APPROVED"
    ) {
      throw new ApiError(
        400,
        "Only approved quotations can be converted into an invoice."
      );
    }

    // ----------------------------------------
    // PREVENT DUPLICATE CONVERSION
    // ----------------------------------------

    if (
      quotation.convertedInvoice
    ) {
      throw new ApiError(
        400,
        "Quotation has already been converted into an invoice."
      );
    }

    // ----------------------------------------
    // DUE DATE
    // ----------------------------------------

    if (!dueDate) {
      throw new ApiError(
        400,
        "Due date is required."
      );
    }

    if (
      new Date(dueDate) <=
      new Date(
        quotation.quotationDate
      )
    ) {
      throw new ApiError(
        400,
        "Due date must be after quotation date."
      );
    }

    // ----------------------------------------
    // GENERATE INVOICE NUMBER
    // ----------------------------------------

    const lastInvoice =
      await this.invoiceRepository
        .findLastInvoice(
          companyId
        );

    let nextNumber = 1;

    if (lastInvoice) {
      const lastNumber =
        parseInt(
          lastInvoice.invoiceNumber
            .replace("INV-", ""),
          10
        );

      nextNumber =
        lastNumber + 1;
    }

    const invoiceNumber =
      `INV-${String(nextNumber)
        .padStart(4, "0")}`;

    // ----------------------------------------
    // GET GST VALUES FROM QUOTATION
    // ----------------------------------------

    const cgst =
      quotation.cgst || 0;

    const sgst =
      quotation.sgst || 0;

    const igst =
      quotation.igst || 0;

    const total =
      quotation.subtotal +
      cgst +
      sgst +
      igst;

    // ----------------------------------------
    // FINAL INVOICE DATA
    // ----------------------------------------

    const finalInvoiceData = {
      invoiceNumber,

      customer:
        quotation.customer._id ||
        quotation.customer,

      quotation:
        quotation._id,

      invoiceDate:
        new Date(),

      dueDate,

      items:
        quotation.items,

      subtotal:
        quotation.subtotal,

      cgst,

      sgst,

      igst,

      total,

      amountPaid: 0,

      balanceDue:
        total,

      status:
        "GENERATED",

      notes:
        quotation.notes,

      termsAndConditions:
        quotation.termsAndConditions,

      company:
        companyId,

      createdBy:
        userId,
    };

    // ----------------------------------------
    // CREATE INVOICE
    // ----------------------------------------

    const invoice =
      await this.invoiceRepository
        .createInvoice(
          finalInvoiceData
        );

    // ----------------------------------------
    // MARK QUOTATION AS CONVERTED
    // ----------------------------------------

    await this.quotationRepository
      .updateQuotation(
        quotation._id,
        companyId,
        {
          status: "CONVERTED",
          convertedInvoice:
            invoice._id,
        }
      );

    // ----------------------------------------
    // RETURN CREATED INVOICE
    // ----------------------------------------

    return await this.getInvoiceById(
      invoice._id,
      companyId
    );
  }
}

export default InvoiceService;