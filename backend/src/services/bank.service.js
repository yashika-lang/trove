import ApiError from "../exceptions/ApiError.js";

import {
  createBank as createBankRepository,
  getAllBanks as getAllBanksRepository,
  getBankById as getBankByIdRepository,
  updateBank as updateBankRepository,
  getBankStats as getBankStatsRepository,
  getActiveBankByAccountNumber as getActiveBankByAccountNumberRepository,
} from "../repositories/bank.repository.js";


// ==========================================
// CREATE BANK
// ==========================================

const createBank = async (bankData, user) => {

  const companyId = user.company;


  // ----------------------------------------
  // VALIDATE COMPANY
  // ----------------------------------------

  if (!companyId) {
    throw new ApiError(
      401,
      "User company information is missing."
    );
  }


  // ----------------------------------------
  // ACCOUNT NUMBER REQUIRED
  // ----------------------------------------

  if (
    !bankData.accountNumber ||
    !String(
      bankData.accountNumber
    ).trim()
  ) {
    throw new ApiError(
      400,
      "Account number is required."
    );
  }


  const accountNumber =
    String(
      bankData.accountNumber
    ).trim();


  // ----------------------------------------
  // DUPLICATE ACTIVE ACCOUNT
  // ----------------------------------------

  const existingBank =
    await getActiveBankByAccountNumberRepository(
      companyId,
      accountNumber
    );


  if (existingBank) {
    throw new ApiError(
      409,
      "An active bank account with this account number already exists."
    );
  }


  // ----------------------------------------
  // CREATE BANK
  // ----------------------------------------

  const bank =
    await createBankRepository({
      ...bankData,

      accountNumber,

      currentBalance:
        bankData.openingBalance || 0,

      company:
        companyId,

      createdBy:
        user._id,
    });


  return bank;
};


// ==========================================
// GET ALL BANKS
// ==========================================

const getAllBanks = async (user, filters = {}) => {
  const companyId = user.company;

  const query = {};

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.accountType) {
    query.accountType = filters.accountType;
  }

  return await getAllBanksRepository(
    companyId,
    query
  );
};


// ==========================================
// GET BANK BY ID
// ==========================================

const getBankById = async (bankId, user) => {
  const bank = await getBankByIdRepository(
    bankId,
    user.company
  );

  if (!bank) {
    throw new ApiError(
      404,
      "Bank account not found."
    );
  }

  return bank;
};


// ==========================================
// UPDATE BANK
// ==========================================

const updateBank = async (
  bankId,
  updateData,
  user
) => {

  // ----------------------------------------
  // FIND EXISTING BANK
  // ----------------------------------------

  const existingBank =
    await getBankByIdRepository(
      bankId,
      user.company
    );


  if (!existingBank) {
    throw new ApiError(
      404,
      "Bank account not found."
    );
  }


  // ----------------------------------------
  // PROTECT CURRENT BALANCE
  // ----------------------------------------

  delete updateData.currentBalance;


  // ----------------------------------------
  // ACCOUNT NUMBER UPDATE
  // ----------------------------------------

  if (
    updateData.accountNumber !==
    undefined
  ) {

    const accountNumber =
      String(
        updateData.accountNumber
      ).trim();


    if (!accountNumber) {
      throw new ApiError(
        400,
        "Account number cannot be empty."
      );
    }


    // --------------------------------------
    // CHECK DUPLICATE
    // --------------------------------------

    const duplicateBank =
      await getActiveBankByAccountNumberRepository(
        user.company,
        accountNumber
      );


    if (
      duplicateBank &&
      String(
        duplicateBank._id
      ) !==
      String(existingBank._id)
    ) {

      throw new ApiError(
        409,
        "An active bank account with this account number already exists."
      );
    }


    updateData.accountNumber =
      accountNumber;
  }


  // ----------------------------------------
  // UPDATE
  // ----------------------------------------

  const updatedBank =
    await updateBankRepository(
      bankId,
      user.company,
      updateData
    );


  return updatedBank;
};


// ==========================================
// DELETE / DEACTIVATE BANK
// ==========================================

const deleteBank = async (bankId, user) => {
  const bank =
    await getBankByIdRepository(
      bankId,
      user.company
    );

  if (!bank) {
    throw new ApiError(
      404,
      "Bank account not found."
    );
  }

  /*
   * A bank account with transactions should
   * not simply disappear from accounting history.
   *
   * For now, mark it inactive.
   */
  bank.status = "INACTIVE";

  await bank.save();

  return bank;
};


// ==========================================
// BANK STATS
// ==========================================

const getBankStats = async (user) => {
  return await getBankStatsRepository(
    user.company
  );
};


export {
  createBank,
  getAllBanks,
  getBankById,
  updateBank,
  deleteBank,
  getBankStats,
};