import asyncHandler from "../exceptions/asyncHandler.js";
import ApiResponse from "../exceptions/ApiResponse.js";
import QuotationService from "../services/quotation.service.js";

const quotationService = new QuotationService();

// CREATE QUOTATION
const createQuotation = asyncHandler(async (req, res) => {
  const quotation = await quotationService.createQuotation(
    req.body,
    req.user.company,
    req.user._id
  );

  return res.status(201).json(
    new ApiResponse(
      201,
      quotation,
      "Quotation created successfully."
    )
  );
});

// GET ALL QUOTATIONS
const getAllQuotations = asyncHandler(async (req, res) => {
  const {
    search,
    status,
    page = 1,
    limit = 10,
  } = req.query;

  const result = await quotationService.getAllQuotations({
    companyId: req.user.company,
    search,
    status,
    page: Number(page),
    limit: Number(limit),
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        quotations: result.quotations,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: result.total,
          totalPages: Math.ceil(
            result.total / Number(limit)
          ),
        },
      },
      "Quotations fetched successfully."
    )
  );
});

// GET QUOTATION BY ID
const getQuotationById = asyncHandler(async (req, res) => {
  const quotation = await quotationService.getQuotationById(
    req.params.quotationId,
    req.user.company
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      quotation,
      "Quotation fetched successfully."
    )
  );
});

// UPDATE QUOTATION
const updateQuotation = asyncHandler(async (req, res) => {
  const quotation = await quotationService.updateQuotation(
    req.params.quotationId,
    req.user.company,
    req.body
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      quotation,
      "Quotation updated successfully."
    )
  );
});

// DELETE QUOTATION
const deleteQuotation = asyncHandler(async (req, res) => {
  await quotationService.deleteQuotation(
    req.params.quotationId,
    req.user.company
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      null,
      "Quotation deleted successfully."
    )
  );
});

// UPDATE QUOTATION STATUS
const updateQuotationStatus = asyncHandler(
  async (req, res) => {
    const quotation =
      await quotationService.updateQuotationStatus(
        req.params.quotationId,
        req.user.company,
        req.body.status
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        quotation,
        "Quotation status updated successfully."
      )
    );
  }
);

// GET QUOTATION STATS
const getQuotationStats = asyncHandler(async (req, res) => {
  const stats = await quotationService.getQuotationStats(
    req.user.company
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      stats,
      "Quotation stats fetched successfully."
    )
  );
});

export {
  createQuotation,
  getAllQuotations,
  getQuotationById,
  updateQuotation,
  deleteQuotation,
  updateQuotationStatus,
  getQuotationStats,
};