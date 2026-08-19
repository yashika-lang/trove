import asyncHandler from "../exceptions/asyncHandler.js";
import ApiResponse from "../exceptions/ApiResponse.js";

import {
  createBank as createBankService,
  getAllBanks as getAllBanksService,
  getBankById as getBankByIdService,
  updateBank as updateBankService,
  deleteBank as deleteBankService,
  getBankStats as getBankStatsService,
} from "../services/bank.service.js";

// ==========================================
// CREATE BANK
// ==========================================

const createBank = asyncHandler(async (req, res) => {
  const bank = await createBankService(
    req.body,
    req.user
  );

  return res.status(201).json(
    new ApiResponse(
      201,
      bank,
      "Bank account created successfully."
    )
  );
});


// ==========================================
// GET ALL BANKS
// ==========================================

const getAllBanks = asyncHandler(async (req, res) => {
  const {
    status,
    accountType,
  } = req.query;

  const banks = await getAllBanksService(
    req.user,
    {
      status,
      accountType,
    }
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        banks,
        total: banks.length,
      },
      "Bank accounts fetched successfully."
    )
  );
});


// ==========================================
// GET BANK BY ID
// ==========================================

const getBankById = asyncHandler(async (req, res) => {
  const bank = await getBankByIdService(
    req.params.bankId,
    req.user
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      bank,
      "Bank account fetched successfully."
    )
  );
});


// ==========================================
// UPDATE BANK
// ==========================================

const updateBank = asyncHandler(async (req, res) => {
  const bank = await updateBankService(
    req.params.bankId,
    req.body,
    req.user
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      bank,
      "Bank account updated successfully."
    )
  );
});


// ==========================================
// DELETE / DEACTIVATE BANK
// ==========================================

const deleteBank = asyncHandler(async (req, res) => {
  const bank = await deleteBankService(
    req.params.bankId,
    req.user
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      bank,
      "Bank account deactivated successfully."
    )
  );
});


// ==========================================
// BANK STATS
// ==========================================

const getBankStats = asyncHandler(async (req, res) => {
  const stats = await getBankStatsService(
    req.user
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      stats,
      "Bank statistics fetched successfully."
    )
  );
});


export {
  createBank,
  getAllBanks,
  getBankById,
  updateBank,
  deleteBank,
  getBankStats,
};