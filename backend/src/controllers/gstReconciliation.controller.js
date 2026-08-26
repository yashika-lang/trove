import asyncHandler from "../exceptions/asyncHandler.js";
import ApiResponse from "../exceptions/ApiResponse.js";

import GSTReconciliationService from "../services/gstReconciliation.service.js";

const service =
  new GSTReconciliationService();


// ==========================================
// GET GST RECONCILIATION TRANSACTIONS
// ==========================================

const getGSTReconciliationTransactionsController =
  asyncHandler(async (req, res) => {

    const {
      reconciliationStatus,
      type,
      gstin,
      search,
      startDate,
      endDate,
      page,
      limit,
    } = req.query;

    const result =
      await service.getTransactions(
        req.user,
        {
          reconciliationStatus,
          type,
          gstin,
          search,
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
        "GST reconciliation transactions fetched successfully."
      )
    );
  });


// ==========================================
// STATS
// ==========================================

const getGSTReconciliationStatsController =
  asyncHandler(async (req, res) => {

    const result =
      await service.getStats(
        req.user
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        result,
        "GST reconciliation statistics fetched successfully."
      )
    );
  });


// ==========================================
// GET TRANSACTION BY ID
// ==========================================

const getGSTReconciliationTransactionByIdController =
  asyncHandler(async (req, res) => {

    const result =
      await service.getById(
        req.params.transactionId,
        req.user
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        result,
        "GST reconciliation transaction fetched successfully."
      )
    );
  });


// ==========================================
// MARK MATCHED
// ==========================================

const markGSTTransactionMatchedController =
  asyncHandler(async (req, res) => {

    const result =
      await service.markMatched(
        req.params.transactionId,
        req.user
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        result,
        "GST transaction marked as matched."
      )
    );
  });


// ==========================================
// MARK MISMATCH
// ==========================================

const markGSTTransactionMismatchController =
  asyncHandler(async (req, res) => {

    const result =
      await service.markMismatch(
        req.params.transactionId,
        req.user,
        req.body.difference
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        result,
        "GST transaction marked as mismatch."
      )
    );
  });


// ==========================================
// CREATE RECONCILIATION RECORD
// ==========================================

const createGSTReconciliationController =
  asyncHandler(async (req, res) => {

    const result =
      await service.createRecord(
        req.body,
        req.user
      );

    return res.status(201).json(
      new ApiResponse(
        201,
        result,
        "GST reconciliation record created successfully."
      )
    );
  });


// ==========================================
// GET RECONCILIATION RECORDS
// ==========================================

const getGSTReconciliationsController =
  asyncHandler(async (req, res) => {

    const {
      status,
      period,
      search,
    } = req.query;

    const result =
      await service.getRecords(
        req.user,
        {
          status,
          period,
          search,
        }
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        result,
        "GST reconciliation records fetched successfully."
      )
    );
  });


// ==========================================
// GET RECORD BY ID
// ==========================================

const getGSTReconciliationByIdController =
  asyncHandler(async (req, res) => {

    const result =
      await service.getRecordById(
        req.params.reconciliationId,
        req.user
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        result,
        "GST reconciliation record fetched successfully."
      )
    );
  });


// ==========================================
// UPDATE RECORD
// ==========================================

const updateGSTReconciliationController =
  asyncHandler(async (req, res) => {

    const result =
      await service.updateRecord(
        req.params.reconciliationId,
        req.body,
        req.user
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        result,
        "GST reconciliation record updated successfully."
      )
    );
  });


// ==========================================
// RECORD STATS
// ==========================================

const getGSTReconciliationRecordStatsController =
  asyncHandler(async (req, res) => {

    const result =
      await service.getRecordStats(
        req.user,
        { period: req.query.period }
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        result,
        "GST reconciliation record statistics fetched successfully."
      )
    );
  });


// ==========================================
// RE-RUN MATCH
// ==========================================

const rerunGSTReconciliationMatchController =
  asyncHandler(async (req, res) => {

    const result =
      await service.rerunMatch(
        req.user,
        { period: req.body?.period }
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        result,
        "Reconciliation match re-run successfully."
      )
    );
  });


export {
  getGSTReconciliationTransactionsController,
  getGSTReconciliationStatsController,
  getGSTReconciliationTransactionByIdController,
  markGSTTransactionMatchedController,
  markGSTTransactionMismatchController,
  createGSTReconciliationController,
  getGSTReconciliationsController,
  getGSTReconciliationByIdController,
  updateGSTReconciliationController,
  getGSTReconciliationRecordStatsController,
  rerunGSTReconciliationMatchController,
};