import ApiError from "../exceptions/ApiError.js";

import {
  createCashLedgerEntry,
  getAllCashLedgerEntries,
  countCashLedgerEntries,
  getCashLedgerEntryById,
  updateCashLedgerEntry,
  deleteCashLedgerEntry,
  getCashLedgerTotals,
  getLastCashBalance,
} from "../repositories/cashLedger.repository.js";


// ==========================================
// VALID ENTRY TYPES
// ==========================================

const CASH_ENTRY_TYPES = [
  "CASH_RECEIPT",
  "CASH_SALE",
  "CASH_EXPENSE",
  "CASH_PAYMENT",
  "CASH_DEPOSIT",
  "CASH_WITHDRAWAL",
  "OPENING_BALANCE",
];


// ==========================================
// CREDIT ENTRY TYPES
// ==========================================

const CREDIT_TYPES = [
  "CASH_RECEIPT",
  "CASH_SALE",
  "CASH_WITHDRAWAL",
];


// ==========================================
// DEBIT ENTRY TYPES
// ==========================================

const DEBIT_TYPES = [
  "CASH_EXPENSE",
  "CASH_PAYMENT",
  "CASH_DEPOSIT",
];


// ==========================================
// VALIDATE DATE
// ==========================================

const parseDate = (
  value,
  fieldName
) => {

  if (!value) {
    throw new ApiError(
      400,
      `${fieldName} is required.`
    );
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new ApiError(
      400,
      `Invalid ${fieldName}.`
    );
  }

  return date;
};


// ==========================================
// CREATE CASH LEDGER ENTRY
// ==========================================

const createCashLedger = async (
  ledgerData,
  user
) => {

  // ----------------------------------------
  // COMPANY VALIDATION
  // ----------------------------------------

  if (!user?.company) {
    throw new ApiError(
      401,
      "User company information is missing."
    );
  }


  // ----------------------------------------
  // TYPE VALIDATION
  // ----------------------------------------

  const type =
    String(
      ledgerData.type || ""
    )
      .trim()
      .toUpperCase();


  if (
    !CASH_ENTRY_TYPES.includes(type)
  ) {
    throw new ApiError(
      400,
      "Invalid cash ledger entry type."
    );
  }


  // ----------------------------------------
  // DATE VALIDATION
  // ----------------------------------------

  const transactionDate =
    parseDate(
      ledgerData.transactionDate,
      "Transaction date"
    );


  // ----------------------------------------
  // DESCRIPTION VALIDATION
  // ----------------------------------------

  const description =
    String(
      ledgerData.description || ""
    ).trim();


  if (!description) {
    throw new ApiError(
      400,
      "Description is required."
    );
  }


  // ----------------------------------------
  // AMOUNT VALIDATION
  // ----------------------------------------

  const amount =
    Number(
      ledgerData.amount
    );


  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    throw new ApiError(
      400,
      "Amount must be greater than 0."
    );
  }


  // ----------------------------------------
  // DETERMINE DEBIT / CREDIT
  // ----------------------------------------

  let debit = 0;
  let credit = 0;


  if (
    CREDIT_TYPES.includes(type)
  ) {
    credit = amount;
  }


  if (
    DEBIT_TYPES.includes(type)
  ) {
    debit = amount;
  }


  // ----------------------------------------
  // OPENING BALANCE
  // ----------------------------------------

  if (
    type === "OPENING_BALANCE"
  ) {

    const existingOpening =
      await getAllCashLedgerEntries(
        user.company,
        {
          type: "OPENING_BALANCE",
        },
        0,
        1
      );


    if (existingOpening.length) {
      throw new ApiError(
        409,
        "Opening balance already exists for this company."
      );
    }


    credit = amount;
    debit = 0;
  }


  // ----------------------------------------
  // GET PREVIOUS BALANCE
  // ----------------------------------------

  const previousBalance =
    await getLastCashBalance(
      user.company
    );


  // ----------------------------------------
  // CALCULATE NEW BALANCE
  // ----------------------------------------

  let balance;


  if (credit > 0) {

    balance =
      previousBalance +
      credit;

  } else {

    balance =
      previousBalance -
      debit;
  }


  // ----------------------------------------
  // PREVENT NEGATIVE CASH
  // ----------------------------------------

  if (balance < 0) {
    throw new ApiError(
      400,
      "Insufficient cash balance."
    );
  }


  // ----------------------------------------
  // CREATE ENTRY
  // ----------------------------------------

  const entry =
    await createCashLedgerEntry({

      transactionDate,

      type,

      referenceNumber:
        ledgerData.referenceNumber
          ? String(
              ledgerData.referenceNumber
            ).trim()
          : null,

      description,

      debit,

      credit,

      balance,

      source:
        ledgerData.source || {
          type: "MANUAL",
          id: null,
        },

      customer:
        ledgerData.customer || null,

      company:
        user.company,

      createdBy:
        user._id,
    });


  return entry;
};


// ==========================================
// GET CASH LEDGER
// ==========================================

const getCashLedger = async (
  user,
  filters = {}
) => {

  if (!user?.company) {
    throw new ApiError(
      401,
      "User company information is missing."
    );
  }


  const query = {};


  // ----------------------------------------
  // TYPE FILTER
  // ----------------------------------------

  if (filters.type) {

    if (
      !CASH_ENTRY_TYPES.includes(
        String(
          filters.type
        )
          .trim()
          .toUpperCase()
      )
    ) {
      throw new ApiError(
        400,
        "Invalid cash ledger type."
      );
    }

    query.type =
      String(
        filters.type
      )
        .trim()
        .toUpperCase();
  }


  // ----------------------------------------
  // SEARCH
  // ----------------------------------------

  if (filters.search) {

    const search =
      String(
        filters.search
      ).trim();


    query.$or = [
      {
        referenceNumber: {
          $regex: search,
          $options: "i",
        },
      },
      {
        description: {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }


  // ----------------------------------------
  // DATE FILTER
  // ----------------------------------------

  if (
    filters.startDate ||
    filters.endDate
  ) {

    query.transactionDate = {};


    if (filters.startDate) {

      const startDate =
        parseDate(
          filters.startDate,
          "start date"
        );

      startDate.setHours(
        0,
        0,
        0,
        0
      );

      query.transactionDate.$gte =
        startDate;
    }


    if (filters.endDate) {

      const endDate =
        parseDate(
          filters.endDate,
          "end date"
        );

      endDate.setHours(
        23,
        59,
        59,
        999
      );

      query.transactionDate.$lte =
        endDate;
    }


    if (
      query.transactionDate.$gte &&
      query.transactionDate.$lte &&
      query.transactionDate.$gte >
        query.transactionDate.$lte
    ) {
      throw new ApiError(
        400,
        "Start date cannot be after end date."
      );
    }
  }


  // ----------------------------------------
  // PAGINATION
  // ----------------------------------------

  const page =
    Math.max(
      Number(filters.page) || 1,
      1
    );


  const limit =
    Math.min(
      Math.max(
        Number(filters.limit) || 10,
        1
      ),
      100
    );


  const skip =
    (page - 1) * limit;


  // ----------------------------------------
  // FETCH DATA
  // ----------------------------------------

  const [
    entries,
    total,
  ] = await Promise.all([
    getAllCashLedgerEntries(
      user.company,
      query,
      skip,
      limit
    ),

    countCashLedgerEntries(
      user.company,
      query
    ),
  ]);


  // ----------------------------------------
  // TOTALS
  // ----------------------------------------

  const totals =
    await getCashLedgerTotals(
      user.company,
      query
    );


  // ----------------------------------------
  // CLOSING BALANCE
  // ----------------------------------------

  const closingBalance =
    await getLastCashBalance(
      user.company
    );


  return {

    entries,

    summary: {

      totalDebit:
        totals.totalDebit || 0,

      totalCredit:
        totals.totalCredit || 0,

      closingBalance,

      entryCount:
        totals.entryCount || 0,
    },

    pagination: {

      page,

      limit,

      total,

      totalPages:
        Math.ceil(
          total / limit
        ),
    },
  };
};


// ==========================================
// GET CASH LEDGER ENTRY BY ID
// ==========================================

const getCashLedgerById = async (
  entryId,
  user
) => {

  const entry =
    await getCashLedgerEntryById(
      entryId,
      user.company
    );


  if (!entry) {
    throw new ApiError(
      404,
      "Cash ledger entry not found."
    );
  }


  return entry;
};


// ==========================================
// UPDATE CASH LEDGER ENTRY
// ==========================================

const updateCashLedger = async (
  entryId,
  updateData,
  user
) => {

  const existingEntry =
    await getCashLedgerEntryById(
      entryId,
      user.company
    );


  if (!existingEntry) {
    throw new ApiError(
      404,
      "Cash ledger entry not found."
    );
  }


  // ----------------------------------------
  // FINANCIAL ENTRIES SHOULD NOT BE
  // DIRECTLY MODIFIED
  // ----------------------------------------

  if (
    updateData.amount !== undefined ||
    updateData.debit !== undefined ||
    updateData.credit !== undefined ||
    updateData.balance !== undefined ||
    updateData.type !== undefined
  ) {
    throw new ApiError(
      400,
      "Financial ledger fields cannot be modified directly. Create a reversal entry instead."
    );
  }


  // ----------------------------------------
  // PROTECT ACCOUNTING FIELDS
  // ----------------------------------------

  delete updateData.company;
  delete updateData.createdBy;
  delete updateData.source;


  const updatedEntry =
    await updateCashLedgerEntry(
      entryId,
      user.company,
      updateData
    );


  return updatedEntry;
};


// ==========================================
// DELETE CASH LEDGER ENTRY
// ==========================================

const deleteCashLedger = async (
  entryId,
  user
) => {

  const existingEntry =
    await getCashLedgerEntryById(
      entryId,
      user.company
    );


  if (!existingEntry) {
    throw new ApiError(
      404,
      "Cash ledger entry not found."
    );
  }


  // ----------------------------------------
  // DO NOT DELETE OPENING BALANCE
  // ----------------------------------------

  if (
    existingEntry.type ===
    "OPENING_BALANCE"
  ) {
    throw new ApiError(
      400,
      "Opening balance cannot be deleted."
    );
  }


  // ----------------------------------------
  // DELETE
  // ----------------------------------------

  const deletedEntry =
    await deleteCashLedgerEntry(
      entryId,
      user.company
    );


  return deletedEntry;
};


// ==========================================
// CASH LEDGER STATS
// ==========================================

const getCashLedgerStats = async (
  user
) => {

  const totals =
    await getCashLedgerTotals(
      user.company
    );


  const closingBalance =
    await getLastCashBalance(
      user.company
    );


  return {

    totalDebit:
      totals.totalDebit || 0,

    totalCredit:
      totals.totalCredit || 0,

    entryCount:
      totals.entryCount || 0,

    closingBalance,
  };
};


// ==========================================
// EXPORT
// ==========================================

export {
  createCashLedger,
  getCashLedger,
  getCashLedgerById,
  updateCashLedger,
  deleteCashLedger,
  getCashLedgerStats,
};