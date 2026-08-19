import mongoose from "mongoose";
import ApiError from "../exceptions/ApiError.js";

import TaxRateRepository from "../repositories/taxRate.repository.js";

class TaxRateService {
  constructor() {
    this.repository = new TaxRateRepository();
  }

  // ==========================================
  // CREATE TAX RATE
  // ==========================================

  async createTaxRate(data, user) {
    const {
      rate,
      cgst,
      sgst,
      igst,
      label,
      description,
    } = data;

    const taxRate = Number(rate);
    const cgstRate = Number(cgst);
    const sgstRate = Number(sgst);
    const igstRate = Number(igst);

    if (
      Number.isNaN(taxRate) ||
      taxRate < 0
    ) {
      throw new ApiError(
        400,
        "Invalid tax rate."
      );
    }

    if (
      Number.isNaN(cgstRate) ||
      cgstRate < 0
    ) {
      throw new ApiError(
        400,
        "Invalid CGST rate."
      );
    }

    if (
      Number.isNaN(sgstRate) ||
      sgstRate < 0
    ) {
      throw new ApiError(
        400,
        "Invalid SGST rate."
      );
    }

    if (
      Number.isNaN(igstRate) ||
      igstRate < 0
    ) {
      throw new ApiError(
        400,
        "Invalid IGST rate."
      );
    }

    if (
      cgstRate + sgstRate !== taxRate
    ) {
      throw new ApiError(
        400,
        "CGST and SGST must together equal the tax rate."
      );
    }

    if (igstRate !== taxRate) {
      throw new ApiError(
        400,
        "IGST must equal the tax rate."
      );
    }

    return await this.repository.create({
      rate: taxRate,
      cgst: cgstRate,
      sgst: sgstRate,
      igst: igstRate,
      label: label?.trim() || `${taxRate}%`,
      description:
        description?.trim() || "",
      active: true,
      company: user.company,
      createdBy: user._id,
    });
  }

  // ==========================================
  // GET TAX RATES
  // ==========================================

  async getTaxRates(user) {
    return await this.repository.findAll(
      user.company
    );
  }

  // ==========================================
  // GET TAX RATE BY ID
  // ==========================================

  async getTaxRateById(
    rateId,
    user
  ) {
    if (
      !mongoose.Types.ObjectId.isValid(
        rateId
      )
    ) {
      throw new ApiError(
        400,
        "Invalid tax rate ID."
      );
    }

    const rate =
      await this.repository.findById(
        rateId,
        user.company
      );

    if (!rate) {
      throw new ApiError(
        404,
        "Tax rate not found."
      );
    }

    return rate;
  }

  // ==========================================
  // UPDATE TAX RATE
  // ==========================================

  async updateTaxRate(
    rateId,
    data,
    user
  ) {
    await this.getTaxRateById(
      rateId,
      user
    );

    const updateData = {};

    if (data.rate !== undefined) {
      const rate = Number(data.rate);

      if (
        Number.isNaN(rate) ||
        rate < 0
      ) {
        throw new ApiError(
          400,
          "Invalid tax rate."
        );
      }

      updateData.rate = rate;
    }

    if (data.cgst !== undefined) {
      const cgst = Number(data.cgst);

      if (
        Number.isNaN(cgst) ||
        cgst < 0
      ) {
        throw new ApiError(
          400,
          "Invalid CGST rate."
        );
      }

      updateData.cgst = cgst;
    }

    if (data.sgst !== undefined) {
      const sgst = Number(data.sgst);

      if (
        Number.isNaN(sgst) ||
        sgst < 0
      ) {
        throw new ApiError(
          400,
          "Invalid SGST rate."
        );
      }

      updateData.sgst = sgst;
    }

    if (data.igst !== undefined) {
      const igst = Number(data.igst);

      if (
        Number.isNaN(igst) ||
        igst < 0
      ) {
        throw new ApiError(
          400,
          "Invalid IGST rate."
        );
      }

      updateData.igst = igst;
    }

    const finalRate =
      updateData.rate !== undefined
        ? updateData.rate
        : undefined;

    const finalCGST =
      updateData.cgst !== undefined
        ? updateData.cgst
        : undefined;

    const finalSGST =
      updateData.sgst !== undefined
        ? updateData.sgst
        : undefined;

    const finalIGST =
      updateData.igst !== undefined
        ? updateData.igst
        : undefined;

    if (
      finalRate !== undefined &&
      finalCGST !== undefined &&
      finalSGST !== undefined &&
      finalCGST + finalSGST !== finalRate
    ) {
      throw new ApiError(
        400,
        "CGST and SGST must equal the tax rate."
      );
    }

    if (
      finalRate !== undefined &&
      finalIGST !== undefined &&
      finalIGST !== finalRate
    ) {
      throw new ApiError(
        400,
        "IGST must equal the tax rate."
      );
    }

    if (data.label !== undefined) {
      updateData.label =
        data.label.trim();
    }

    if (
      data.description !== undefined
    ) {
      updateData.description =
        data.description.trim();
    }

    if (data.active !== undefined) {
      updateData.active =
        Boolean(data.active);
    }

    return await this.repository.update(
      rateId,
      user.company,
      updateData
    );
  }

  // ==========================================
  // DELETE TAX RATE
  // ==========================================

  async deleteTaxRate(
    rateId,
    user
  ) {
    await this.getTaxRateById(
      rateId,
      user
    );

    const deleted =
      await this.repository.delete(
        rateId,
        user.company
      );

    if (!deleted) {
      throw new ApiError(
        404,
        "Tax rate could not be deleted."
      );
    }

    return deleted;
  }
}

export default TaxRateService;