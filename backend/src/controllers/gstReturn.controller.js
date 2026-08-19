import asyncHandler from "../exceptions/asyncHandler.js";
import ApiResponse from "../exceptions/ApiResponse.js";

import GSTReturnService from "../services/gstReturn.service.js";

const service =
  new GSTReturnService();


// ==========================================
// CREATE GST RETURN
// ==========================================

const createGSTReturnController =
  asyncHandler(async (req, res) => {

    const result =
      await service.createReturn(
        req.body,
        req.user
      );

    return res.status(201).json(
      new ApiResponse(
        201,
        result,
        "GST return created successfully."
      )
    );
  });


// ==========================================
// GET GST RETURNS
// ==========================================

const getGSTReturnsController =
  asyncHandler(async (req, res) => {

    const {
      returnType,
      period,
      status,
      page,
      limit,
    } = req.query;

    const result =
      await service.getReturns(
        req.user,
        {
          returnType,
          period,
          status,
          page,
          limit,
        }
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        result,
        "GST returns fetched successfully."
      )
    );
  });


// ==========================================
// GET RETURN BY ID
// ==========================================

const getGSTReturnByIdController =
  asyncHandler(async (req, res) => {

    const result =
      await service.getReturnById(
        req.params.returnId,
        req.user
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        result,
        "GST return fetched successfully."
      )
    );
  });


// ==========================================
// UPDATE RETURN
// ==========================================

const updateGSTReturnController =
  asyncHandler(async (req, res) => {

    const result =
      await service.updateReturn(
        req.params.returnId,
        req.body,
        req.user
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        result,
        "GST return updated successfully."
      )
    );
  });


// ==========================================
// GST RETURN STATS
// ==========================================

const getGSTReturnStatsController =
  asyncHandler(async (req, res) => {

    const result =
      await service.getStats(
        req.user
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        result,
        "GST return statistics fetched successfully."
      )
    );
  });


export {
  createGSTReturnController,
  getGSTReturnsController,
  getGSTReturnByIdController,
  updateGSTReturnController,
  getGSTReturnStatsController,
};