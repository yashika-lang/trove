import asyncHandler from "../exceptions/asyncHandler.js";
import ApiResponse from "../exceptions/ApiResponse.js";

import ITCService from "../services/itc.service.js";

const service =
  new ITCService();


// ==========================================
// CREATE ITC
// ==========================================

const createITCController =
  asyncHandler(async (req, res) => {

    const result =
      await service.createITC(
        req.body,
        req.user
      );

    return res.status(201).json(
      new ApiResponse(
        201,
        result,
        "ITC entry created successfully."
      )
    );
  });


// ==========================================
// GET ITC
// ==========================================

const getITCController =
  asyncHandler(async (req, res) => {

    const {
      search,
      eligibility,
      claimStatus,
      startDate,
      endDate,
      page,
      limit,
    } = req.query;

    const result =
      await service.getITCEntries(
        req.user,
        {
          search,
          eligibility,
          claimStatus,
          startDate,
          endDate,
          page,
          limit,
        }
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        result,
        "ITC entries fetched successfully."
      )
    );
  });


// ==========================================
// GET ITC BY ID
// ==========================================

const getITCByIdController =
  asyncHandler(async (req, res) => {

    const result =
      await service.getITCById(
        req.params.entryId,
        req.user
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        result,
        "ITC entry fetched successfully."
      )
    );
  });


// ==========================================
// CLAIM ITC
// ==========================================

const claimITCController =
  asyncHandler(async (req, res) => {

    const result =
      await service.claimITC(
        req.params.entryId,
        req.body.amount,
        req.user
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        result,
        "ITC claimed successfully."
      )
    );
  });


// ==========================================
// REVERSE ITC
// ==========================================

const reverseITCController =
  asyncHandler(async (req, res) => {

    const result =
      await service.reverseITC(
        req.params.entryId,
        req.body.amount,
        req.user
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        result,
        "ITC reversed successfully."
      )
    );
  });


// ==========================================
// ITC SUMMARY
// ==========================================

const getITCSummaryController =
  asyncHandler(async (req, res) => {

    const result =
      await service.getITCSummary(
        req.user
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        result,
        "ITC summary fetched successfully."
      )
    );
  });


export {
  createITCController,
  getITCController,
  getITCByIdController,
  claimITCController,
  reverseITCController,
  getITCSummaryController,
};