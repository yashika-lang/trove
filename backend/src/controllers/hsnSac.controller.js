import asyncHandler from "../exceptions/asyncHandler.js";
import ApiResponse from "../exceptions/ApiResponse.js";

import HsnSacService from "../services/hsnSac.service.js";

const service =
  new HsnSacService();


// ==========================================
// CREATE HSN / SAC
// ==========================================

const createHsnSacController =
  asyncHandler(async (req, res) => {

    const result =
      await service.createHsnSac(
        req.body,
        req.user
      );

    return res.status(201).json(
      new ApiResponse(
        201,
        result,
        "HSN/SAC code created successfully."
      )
    );
  });


// ==========================================
// GET HSN / SAC CODES
// ==========================================

const getHsnSacController =
  asyncHandler(async (req, res) => {

    const {
      search,
      type,
      page,
      limit,
    } = req.query;

    const result =
      await service.getHsnSacCodes(
        req.user,
        {
          search,
          type,
          page,
          limit,
        }
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        result,
        "HSN/SAC codes fetched successfully."
      )
    );
  });


// ==========================================
// GET HSN / SAC BY ID
// ==========================================

const getHsnSacByIdController =
  asyncHandler(async (req, res) => {

    const result =
      await service.getHsnSacById(
        req.params.entryId,
        req.user
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        result,
        "HSN/SAC code fetched successfully."
      )
    );
  });


// ==========================================
// UPDATE HSN / SAC
// ==========================================

const updateHsnSacController =
  asyncHandler(async (req, res) => {

    const result =
      await service.updateHsnSac(
        req.params.entryId,
        req.body,
        req.user
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        result,
        "HSN/SAC code updated successfully."
      )
    );
  });


// ==========================================
// DELETE HSN / SAC
// ==========================================

const deleteHsnSacController =
  asyncHandler(async (req, res) => {

    const result =
      await service.deleteHsnSac(
        req.params.entryId,
        req.user
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        result,
        "HSN/SAC code deleted successfully."
      )
    );
  });


export {
  createHsnSacController,
  getHsnSacController,
  getHsnSacByIdController,
  updateHsnSacController,
  deleteHsnSacController,
};