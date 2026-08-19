import asyncHandler from "../exceptions/asyncHandler.js";
import ApiResponse from "../exceptions/ApiResponse.js";

import TaxRateService from "../services/taxRate.service.js";

const service =
  new TaxRateService();


// ==========================================
// CREATE TAX RATE
// ==========================================

const createTaxRateController =
  asyncHandler(async (req, res) => {

    const result =
      await service.createTaxRate(
        req.body,
        req.user
      );

    return res.status(201).json(
      new ApiResponse(
        201,
        result,
        "Tax rate created successfully."
      )
    );
  });


// ==========================================
// GET TAX RATES
// ==========================================

const getTaxRatesController =
  asyncHandler(async (req, res) => {

    const result =
      await service.getTaxRates(
        req.user
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        result,
        "Tax rates fetched successfully."
      )
    );
  });


// ==========================================
// GET TAX RATE BY ID
// ==========================================

const getTaxRateByIdController =
  asyncHandler(async (req, res) => {

    const result =
      await service.getTaxRateById(
        req.params.rateId,
        req.user
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        result,
        "Tax rate fetched successfully."
      )
    );
  });


// ==========================================
// UPDATE TAX RATE
// ==========================================

const updateTaxRateController =
  asyncHandler(async (req, res) => {

    const result =
      await service.updateTaxRate(
        req.params.rateId,
        req.body,
        req.user
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        result,
        "Tax rate updated successfully."
      )
    );
  });


// ==========================================
// DELETE TAX RATE
// ==========================================

const deleteTaxRateController =
  asyncHandler(async (req, res) => {

    const result =
      await service.deleteTaxRate(
        req.params.rateId,
        req.user
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        result,
        "Tax rate deleted successfully."
      )
    );
  });


export {
  createTaxRateController,
  getTaxRatesController,
  getTaxRateByIdController,
  updateTaxRateController,
  deleteTaxRateController,
};