import mongoose from "mongoose";
import QuotationRepository from "../repositories/quotation.repository.js";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";
import Company from "../models/company.model.js";
import ApiError from "../exceptions/ApiError.js";
import { notificationService } from "./notification.service.js";

class QuotationService {
  constructor() {
    this.quotationRepository =
      new QuotationRepository();
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
      // Intra-state supply
      cgst = totalGST / 2;
      sgst = totalGST / 2;
    } else {
      // Inter-state supply
      igst = totalGST;
    }

    return {
      cgst,
      sgst,
      igst,
    };
  }

  // ==========================================
  // CREATE QUOTATION
  // ==========================================

  async createQuotation(
    quotationData,
    companyId,
    userId
  ) {
    const {
      customer,
      quotationDate,
      validUntil,
      items,
      notes,
      termsAndConditions,
    } = quotationData;

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
      new Date(validUntil) <=
      new Date(quotationDate)
    ) {
      throw new ApiError(
        400,
        "Valid until date must be after quotation date."
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
    // GENERATE QUOTATION NUMBER
    // ----------------------------------------

    const lastQuotation =
      await this.quotationRepository
        .findLastQuotation(companyId);

    let nextNumber = 1;

    if (lastQuotation) {
      const lastNumber =
        parseInt(
          lastQuotation.quotationNumber
            .replace("QTN-", ""),
          10
        );

      nextNumber =
        lastNumber + 1;
    }

    const quotationNumber =
      `QTN-${String(nextNumber)
        .padStart(4, "0")}`;

    // ----------------------------------------
    // FINAL QUOTATION DATA
    // ----------------------------------------

    const finalQuotationData = {
      quotationNumber,
      customer,
      quotationDate,
      validUntil,
      items: processedItems,
      subtotal,
      cgst,
      sgst,
      igst,
      total,
      status: "DRAFT",
      notes,
      termsAndConditions,
      company: companyId,
      createdBy: userId,
    };

    return await this.quotationRepository
      .createQuotation(
        finalQuotationData
      );
  }

  // ==========================================
  // GET ALL QUOTATIONS
  // ==========================================

  async getAllQuotations({
    companyId,
    search,
    status,
    page,
    limit,
  }) {
    return await this.quotationRepository
      .findQuotations({
        companyId,
        search,
        status,
        page,
        limit,
      });
  }

  // ==========================================
  // GET QUOTATION BY ID
  // ==========================================

  async getQuotationById(
    quotationId,
    companyId
  ) {
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

    return quotation;
  }

  // ==========================================
  // UPDATE QUOTATION
  // ==========================================

  async updateQuotation(
    quotationId,
    companyId,
    updateData
  ) {
    const quotation =
      await this.getQuotationById(
        quotationId,
        companyId
      );

    if (
      [
        "APPROVED",
        "CONVERTED",
        "REJECTED",
      ].includes(quotation.status)
    ) {
      throw new ApiError(
        400,
        `Quotation with status ${quotation.status} cannot be updated.`
      );
    }

    const {
      customer,
      quotationDate,
      validUntil,
      items,
      notes,
      termsAndConditions,
    } = updateData;

    // ----------------------------------------
    // FIND COMPANY
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
    // FIND FINAL CUSTOMER
    // ----------------------------------------

    const finalCustomerId =
      customer ||
      quotation.customer;

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

    const finalQuotationDate =
      quotationDate ||
      quotation.quotationDate;

    const finalValidUntil =
      validUntil ||
      quotation.validUntil;

    if (
      new Date(finalValidUntil) <=
      new Date(finalQuotationDate)
    ) {
      throw new ApiError(
        400,
        "Valid until date must be after quotation date."
      );
    }

    // ----------------------------------------
    // BASIC UPDATE DATA
    // ----------------------------------------

    const finalUpdateData = {
      ...(customer && {
        customer,
      }),

      ...(quotationDate && {
        quotationDate,
      }),

      ...(validUntil && {
        validUntil,
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
    }

    // ----------------------------------------
    // CUSTOMER CHANGED BUT ITEMS DID NOT
    // ----------------------------------------

    else if (customer) {
      const oldTotalGST =
        (quotation.cgst || 0) +
        (quotation.sgst || 0) +
        (quotation.igst || 0);

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
        quotation.subtotal +
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
    }

    return await this.quotationRepository
      .updateQuotation(
        quotationId,
        companyId,
        finalUpdateData
      );
  }

  // ==========================================
  // DELETE QUOTATION
  // ==========================================

  async deleteQuotation(
    quotationId,
    companyId
  ) {
    const quotation =
      await this.getQuotationById(
        quotationId,
        companyId
      );

    if (
      quotation.status !== "DRAFT"
    ) {
      throw new ApiError(
        400,
        "Only draft quotations can be deleted."
      );
    }

    return await this.quotationRepository
      .deleteQuotation(
        quotationId,
        companyId
      );
  }

  // ==========================================
  // UPDATE QUOTATION STATUS
  // ==========================================

  async updateQuotationStatus(
    quotationId,
    companyId,
    status
  ) {
    const quotation =
      await this.getQuotationById(
        quotationId,
        companyId
      );

    const allowedStatuses = [
      "DRAFT",
      "SENT",
      "APPROVED",
      "REJECTED",
      "CONVERTED",
    ];

    if (
      !allowedStatuses.includes(status)
    ) {
      throw new ApiError(
        400,
        "Invalid quotation status."
      );
    }

    if (
      [
        "APPROVED",
        "CONVERTED",
        "REJECTED",
      ].includes(quotation.status)
    ) {
      throw new ApiError(
        400,
        `Quotation with status ${quotation.status} cannot be updated.`
      );
    }

    const updated = await this.quotationRepository
      .updateQuotation(
        quotationId,
        companyId,
        {
          status,
        }
      );

    if (status === "APPROVED") {
      await notificationService.notify({
        companyId,
        type: "QUOTATION_APPROVED",
        title: `Quotation ${updated.quotationNumber} approved`,
        message: updated.customer?.customerName
          ? updated.customer.customerName
          : "Customer",
        relatedId: updated._id,
      });
    }

    return updated;
  }

  // ==========================================
  // GET STATS
  // ==========================================

  async getQuotationStats(
    companyId
  ) {
    const stats =
      await this.quotationRepository
        .getQuotationStats(
          companyId
        );

    return (
      stats[0] || {
        totalQuotations: 0,
        approved: 0,
        awaitingResponse: 0,
        pipelineValue: 0,
      }
    );
  }
}

export default QuotationService;