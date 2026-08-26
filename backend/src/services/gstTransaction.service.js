import mongoose from "mongoose";
import ApiError from "../exceptions/ApiError.js";

import GSTTransactionRepository from "../repositories/gstTransaction.repository.js";
import Customer from "../models/customer.model.js";
import Company from "../models/company.model.js";

import calculateGST from "../utils/gstCalculator.js";

const gstTransactionRepository =
  new GSTTransactionRepository();


class GSTTransactionService {

  constructor() {
    this.repository =
      new GSTTransactionRepository();
  }


  // ==========================================
  // CREATE GST TRANSACTION
  // ==========================================

  async createGSTTransaction(
    data,
    user
  ) {

    const {
      date,
      documentNumber,
      documentType,
      type,
      customer,
      supplierName,
      gstin,
      placeOfSupply,
      taxRate,
      taxableAmount,
      cess = 0,
      invoice,
      quotation,
      source = "MANUAL",
    } = data;


    // ----------------------------------------
    // REQUIRED FIELDS
    // ----------------------------------------

    if (!date) {
      throw new ApiError(
        400,
        "Transaction date is required."
      );
    }


    if (!documentNumber?.trim()) {
      throw new ApiError(
        400,
        "Document number is required."
      );
    }


    if (!documentType) {
      throw new ApiError(
        400,
        "Document type is required."
      );
    }


    if (!type) {
      throw new ApiError(
        400,
        "Transaction type is required."
      );
    }


    if (
      ![
        "OUTWARD",
        "INWARD",
      ].includes(type)
    ) {
      throw new ApiError(
        400,
        "Invalid GST transaction type."
      );
    }


    if (
      ![
        "INVOICE",
        "PURCHASE",
        "CREDIT_NOTE",
        "DEBIT_NOTE",
      ].includes(documentType)
    ) {
      throw new ApiError(
        400,
        "Invalid document type."
      );
    }


    // ----------------------------------------
    // NUMBER VALIDATION
    // ----------------------------------------

    const rate =
      Number(taxRate);

    const taxable =
      Number(taxableAmount);

    const cessAmount =
      Number(cess);


    if (
      Number.isNaN(rate) ||
      rate < 0
    ) {
      throw new ApiError(
        400,
        "Invalid GST rate."
      );
    }


    if (
      Number.isNaN(taxable) ||
      taxable < 0
    ) {
      throw new ApiError(
        400,
        "Invalid taxable amount."
      );
    }


    if (
      Number.isNaN(cessAmount) ||
      cessAmount < 0
    ) {
      throw new ApiError(
        400,
        "Invalid cess amount."
      );
    }


    // ----------------------------------------
    // COMPANY
    // ----------------------------------------

    const company =
      await Company.findById(
        user.company
      ).lean();


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
    // CUSTOMER
    // ----------------------------------------

    let customerData = null;


    if (customer) {

      if (
        !mongoose.Types.ObjectId.isValid(
          customer
        )
      ) {
        throw new ApiError(
          400,
          "Invalid customer ID."
        );
      }


      customerData =
        await Customer.findOne({
          _id: customer,
          company: user.company,
        }).lean();


      if (!customerData) {
        throw new ApiError(
          404,
          "Customer not found."
        );
      }


      if (!customerData.state) {
        throw new ApiError(
          400,
          "Customer state is required for GST calculation."
        );
      }
    }


    // ----------------------------------------
    // STATE FOR GST
    // ----------------------------------------

    const customerState =
      customerData?.state ||
      placeOfSupply;


    if (!customerState) {
      throw new ApiError(
        400,
        "Customer state or place of supply is required."
      );
    }


    // ----------------------------------------
    // CALCULATE GST
    // ----------------------------------------

    const gst =
      calculateGST({
        taxableAmount:
          taxable,

        gstRate:
          rate,

        companyState:
          company.state,

        customerState,
      });


    const totalTax =
      gst.totalGST +
      cessAmount;


    const totalAmount =
      taxable +
      totalTax;


    // ----------------------------------------
    // DUPLICATE DOCUMENT CHECK
    // ----------------------------------------

    const existing =
      await this.repository.findAll({
        companyId:
          user.company,

        search:
          documentNumber.trim(),

        page: 1,

        limit: 100,
      });


    const duplicate =
      existing.entries.find(
        (entry) =>
          entry.documentNumber
            ?.toLowerCase() ===
          documentNumber
            .trim()
            .toLowerCase()
      );


    if (duplicate) {
      throw new ApiError(
        409,
        "GST transaction with this document number already exists."
      );
    }


    // ----------------------------------------
    // CREATE
    // ----------------------------------------

    const transactionData = {

      date,

      documentNumber:
        documentNumber.trim(),

      documentType,

      type,


      customer:
        customer || null,


      supplierName:
        supplierName?.trim() || "",


      gstin:
        gstin
          ?.trim()
          .toUpperCase() ||
        customerData?.gstin ||
        "",


      placeOfSupply:
        customerState,


      taxRate:
        rate,


      taxableAmount:
        taxable,


      cgst:
        gst.cgst,


      sgst:
        gst.sgst,


      igst:
        gst.igst,


      cess:
        cessAmount,


      totalTax,


      totalAmount,


      status:
        "GENERATED",


      source,


      invoice:
        invoice || null,


      quotation:
        quotation || null,


      company:
        user.company,


      createdBy:
        user._id,
    };


    return await this.repository.create(
      transactionData
    );
  }


  // ==========================================
  // GET GST TRANSACTIONS
  // ==========================================

  async getGSTTransactions(
    user,
    filters = {}
  ) {

    const page =
      Math.max(
        Number(filters.page) || 1,
        1
      );


    const limit =
      Math.min(
        Math.max(
          Number(filters.limit) || 20,
          1
        ),
        100
      );


    return await this.repository.findAll({

      companyId:
        user.company,

      type:
        filters.type,

      search:
        filters.search,

      startDate:
        filters.startDate,

      endDate:
        filters.endDate,

      page,

      limit,
    });
  }


  // ==========================================
  // GET GST TRANSACTION BY ID
  // ==========================================

  async getGSTTransactionById(
    transactionId,
    user
  ) {

    if (
      !mongoose.Types.ObjectId.isValid(
        transactionId
      )
    ) {
      throw new ApiError(
        400,
        "Invalid GST transaction ID."
      );
    }


    const transaction =
      await this.repository.findById(
        transactionId,
        user.company
      );


    if (!transaction) {
      throw new ApiError(
        404,
        "GST transaction not found."
      );
    }


    return transaction;
  }


  // ==========================================
  // UPDATE GST TRANSACTION
  // ==========================================

  async updateGSTTransaction(
    transactionId,
    data,
    user
  ) {

    if (
      !mongoose.Types.ObjectId.isValid(
        transactionId
      )
    ) {
      throw new ApiError(
        400,
        "Invalid GST transaction ID."
      );
    }


    const existingTransaction =
      await this.getGSTTransactionById(
        transactionId,
        user
      );


    // Filed transactions should not
    // be modified

    if (
      existingTransaction.status ===
      "FILED"
    ) {
      throw new ApiError(
        400,
        "Filed GST transactions cannot be updated."
      );
    }


    // ----------------------------------------
    // BASIC FIELDS
    // ----------------------------------------

    const updateData = {};


    if (
      data.date !== undefined
    ) {
      updateData.date =
        data.date;
    }


    if (
      data.documentNumber !== undefined
    ) {

      if (
        !data.documentNumber?.trim()
      ) {
        throw new ApiError(
          400,
          "Document number cannot be empty."
        );
      }


      updateData.documentNumber =
        data.documentNumber.trim();
    }


    if (
      data.documentType !== undefined
    ) {

      const allowedDocumentTypes = [
        "INVOICE",
        "PURCHASE",
        "CREDIT_NOTE",
        "DEBIT_NOTE",
      ];


      if (
        !allowedDocumentTypes.includes(
          data.documentType
        )
      ) {
        throw new ApiError(
          400,
          "Invalid document type."
        );
      }


      updateData.documentType =
        data.documentType;
    }


    if (
      data.type !== undefined
    ) {

      if (
        ![
          "OUTWARD",
          "INWARD",
        ].includes(data.type)
      ) {
        throw new ApiError(
          400,
          "Invalid GST transaction type."
        );
      }


      updateData.type =
        data.type;
    }


    // ----------------------------------------
    // CUSTOMER
    // ----------------------------------------

    let customerData = null;


    if (
      data.customer !== undefined
    ) {

      if (data.customer) {

        if (
          !mongoose.Types.ObjectId.isValid(
            data.customer
          )
        ) {
          throw new ApiError(
            400,
            "Invalid customer ID."
          );
        }


        customerData =
          await Customer.findOne({
            _id: data.customer,
            company: user.company,
          }).lean();


        if (!customerData) {
          throw new ApiError(
            404,
            "Customer not found."
          );
        }


        if (!customerData.state) {
          throw new ApiError(
            400,
            "Customer state is required for GST calculation."
          );
        }


        updateData.customer =
          data.customer;


        updateData.placeOfSupply =
          customerData.state;


        if (customerData.gstin) {
          updateData.gstin =
            customerData.gstin;
        }

      } else {

        updateData.customer =
          null;
      }
    }


    // ----------------------------------------
    // SUPPLIER / GSTIN / PLACE OF SUPPLY
    // ----------------------------------------

    if (
      data.supplierName !== undefined
    ) {

      updateData.supplierName =
        data.supplierName
          ?.trim() || "";
    }


    if (
      data.gstin !== undefined
    ) {

      updateData.gstin =
        data.gstin
          ?.trim()
          .toUpperCase() || "";
    }


    if (
      data.placeOfSupply !== undefined
    ) {

      updateData.placeOfSupply =
        data.placeOfSupply
          ?.trim() || "";
    }


    // ----------------------------------------
    // TAX VALUES
    // ----------------------------------------

    if (
      data.taxRate !== undefined
    ) {

      const rate =
        Number(data.taxRate);


      if (
        Number.isNaN(rate) ||
        rate < 0
      ) {
        throw new ApiError(
          400,
          "Invalid GST rate."
        );
      }


      updateData.taxRate =
        rate;
    }


    if (
      data.taxableAmount !== undefined
    ) {

      const taxable =
        Number(
          data.taxableAmount
        );


      if (
        Number.isNaN(taxable) ||
        taxable < 0
      ) {
        throw new ApiError(
          400,
          "Invalid taxable amount."
        );
      }


      updateData.taxableAmount =
        taxable;
    }


    if (
      data.cess !== undefined
    ) {

      const cess =
        Number(data.cess);


      if (
        Number.isNaN(cess) ||
        cess < 0
      ) {
        throw new ApiError(
          400,
          "Invalid cess amount."
        );
      }


      updateData.cess =
        cess;
    }


    // ----------------------------------------
    // COMPANY
    // ----------------------------------------

    const company =
      await Company.findById(
        user.company
      ).lean();


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
    // GST STATE
    // ----------------------------------------

    const customerState =
      updateData.placeOfSupply ||
      existingTransaction.placeOfSupply;


    if (!customerState) {
      throw new ApiError(
        400,
        "Place of supply is required for GST calculation."
      );
    }


    // ----------------------------------------
    // RECALCULATE GST
    // ----------------------------------------

    const taxableAmount =
      updateData.taxableAmount ??
      existingTransaction.taxableAmount;


    const taxRate =
      updateData.taxRate ??
      existingTransaction.taxRate;


    const cess =
      updateData.cess ??
      existingTransaction.cess ??
      0;


    const gst =
      calculateGST({

        taxableAmount:
          Number(taxableAmount),

        gstRate:
          Number(taxRate),

        companyState:
          company.state,

        customerState,
      });


    const totalTax =
      gst.totalGST +
      Number(cess);


    const totalAmount =
      Number(taxableAmount) +
      totalTax;


    updateData.cgst =
      gst.cgst;


    updateData.sgst =
      gst.sgst;


    updateData.igst =
      gst.igst;


    updateData.totalTax =
      totalTax;


    updateData.totalAmount =
      totalAmount;


    // ----------------------------------------
    // UPDATE
    // ----------------------------------------

    return await this.repository.update(
      transactionId,
      user.company,
      updateData
    );
  }


  // ==========================================
  // DELETE GST TRANSACTION
  // ==========================================

  async deleteGSTTransaction(
    transactionId,
    user
  ) {

    if (
      !mongoose.Types.ObjectId.isValid(
        transactionId
      )
    ) {
      throw new ApiError(
        400,
        "Invalid GST transaction ID."
      );
    }


    const transaction =
      await this.getGSTTransactionById(
        transactionId,
        user
      );


    if (
      transaction.status ===
      "FILED"
    ) {
      throw new ApiError(
        400,
        "Filed GST transactions cannot be deleted."
      );
    }


    const deleted =
      await this.repository.delete(
        transactionId,
        user.company
      );


    if (!deleted) {
      throw new ApiError(
        404,
        "GST transaction could not be deleted."
      );
    }


    return deleted;
  }


  // ==========================================
  // GST TRANSACTION STATS
  // ==========================================

  async getGSTTransactionStats(
    user,
    filters = {}
  ) {

    const result =
      await this.repository.getStats(
        user.company,
        filters.startDate,
        filters.endDate
      );


    const stats = {

      outward: {
        taxableAmount: 0,
        cgst: 0,
        sgst: 0,
        igst: 0,
        totalTax: 0,
      },

      inward: {
        taxableAmount: 0,
        cgst: 0,
        sgst: 0,
        igst: 0,
        totalTax: 0,
      },

      total: {
        taxableAmount: 0,
        cgst: 0,
        sgst: 0,
        igst: 0,
        totalTax: 0,
      },
    };


    for (
      const item of result
    ) {

      const key =
        item._id === "OUTWARD"
          ? "outward"
          : item._id === "INWARD"
          ? "inward"
          : null;


      if (!key) {
        continue;
      }


      stats[key] = {

        taxableAmount:
          item.taxableAmount || 0,

        cgst:
          item.cgst || 0,

        sgst:
          item.sgst || 0,

        igst:
          item.igst || 0,

        totalTax:
          item.totalTax || 0,
      };
    }


    // ----------------------------------------
    // TOTALS
    // ----------------------------------------

    stats.total = {

      taxableAmount:
        stats.outward.taxableAmount +
        stats.inward.taxableAmount,

      cgst:
        stats.outward.cgst +
        stats.inward.cgst,

      sgst:
        stats.outward.sgst +
        stats.inward.sgst,

      igst:
        stats.outward.igst +
        stats.inward.igst,

      totalTax:
        stats.outward.totalTax +
        stats.inward.totalTax,
    };


    return stats;
  }
}


// ==========================================
// EXPORT CLASS
// ==========================================

export {
  GSTTransactionService,
};


// ==========================================
// CREATE
// ==========================================

export const createGSTTransaction =
  async (
    data,
    user
  ) => {

    const service =
      new GSTTransactionService();

    return await service.createGSTTransaction(
      data,
      user
    );
  };


// ==========================================
// GET ALL
// ==========================================

export const getGSTTransactions =
  async (
    user,
    filters = {}
  ) => {

    const service =
      new GSTTransactionService();

    return await service.getGSTTransactions(
      user,
      filters
    );
  };


// ==========================================
// GET BY ID
// ==========================================

export const getGSTTransactionById =
  async (
    transactionId,
    user
  ) => {

    const service =
      new GSTTransactionService();

    return await service.getGSTTransactionById(
      transactionId,
      user
    );
  };


// ==========================================
// UPDATE
// ==========================================

export const updateGSTTransaction =
  async (
    transactionId,
    data,
    user
  ) => {

    const service =
      new GSTTransactionService();

    return await service.updateGSTTransaction(
      transactionId,
      data,
      user
    );
  };


// ==========================================
// DELETE
// ==========================================

export const deleteGSTTransaction =
  async (
    transactionId,
    user
  ) => {

    const service =
      new GSTTransactionService();

    return await service.deleteGSTTransaction(
      transactionId,
      user
    );
  };


// ==========================================
// CREATE FROM INVOICE (system-triggered)
// ==========================================
//
// Every outward GST transaction should reflect a real invoice — without
// this hook, the whole GST module (Dashboard, Transactions, ITC,
// Reconciliation, Returns) only ever showed manually-entered rows,
// completely disconnected from actual invoiced sales. Called right after
// invoice creation with the invoice's own already-computed tax fields, so
// there is no second GST calculation to drift out of sync with the
// invoice itself.
//
// Never throws — a GST-sync failure must not fail invoice creation, the
// same "never blocks the primary operation" contract notificationService
// already follows.
// ==========================================

export const createGSTTransactionFromInvoice =
  async (
    invoice,
    customer,
    user
  ) => {

    try {

      const totalTax =
        Number(invoice.cgst || 0) +
        Number(invoice.sgst || 0) +
        Number(invoice.igst || 0);

      const taxable =
        Number(invoice.subtotal || 0);

      // Single blended rate for this document — GSTTransaction (like the
      // manual-entry GST Transactions page it powers) stores one rate per
      // document, not per line item.
      const taxRate =
        taxable > 0
          ? Math.round(
              (totalTax / taxable) * 100
            )
          : 0;

      await gstTransactionRepository.create({

        date:
          invoice.invoiceDate,

        documentNumber:
          invoice.invoiceNumber,

        documentType: "INVOICE",

        type: "OUTWARD",

        customer:
          customer?._id || invoice.customer,

        gstin:
          customer?.gstin || undefined,

        placeOfSupply:
          customer?.state || undefined,

        taxRate,

        taxableAmount: taxable,

        cgst:
          Number(invoice.cgst || 0),

        sgst:
          Number(invoice.sgst || 0),

        igst:
          Number(invoice.igst || 0),

        cess: 0,

        totalTax,

        totalAmount:
          Number(invoice.total || 0),

        status: "GENERATED",

        source: "INVOICE",

        invoice: invoice._id,

        company: user.company,

        createdBy: user._id,

      });

    } catch {
      // Swallow — see comment above.
    }

  };


// ==========================================
// STATS
// ==========================================

export const getGSTTransactionStats =
  async (
    user,
    filters = {}
  ) => {

    const service =
      new GSTTransactionService();

    return await service.getGSTTransactionStats(
      user,
      filters
    );
  };