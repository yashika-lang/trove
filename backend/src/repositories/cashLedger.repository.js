import CashLedger from "../models/cashLedger.model.js";


// ==========================================
// CREATE CASH LEDGER ENTRY
// ==========================================

const createCashLedgerEntry = async (
  ledgerData
) => {
  return await CashLedger.create(
    ledgerData
  );
};


// ==========================================
// GET ALL CASH LEDGER ENTRIES
// ==========================================

const getAllCashLedgerEntries = async (
  companyId,
  query = {},
  skip = 0,
  limit = 10
) => {
  return await CashLedger.find({
    company: companyId,
    ...query,
  })
    .populate(
      "customer",
      "customerName phone email"
    )
    .populate(
      "createdBy",
      "name email"
    )
    .sort({
      transactionDate: -1,
      createdAt: -1,
    })
    .skip(skip)
    .limit(limit)
    .lean();
};


// ==========================================
// COUNT CASH LEDGER ENTRIES
// ==========================================

const countCashLedgerEntries = async (
  companyId,
  query = {}
) => {
  return await CashLedger.countDocuments({
    company: companyId,
    ...query,
  });
};


// ==========================================
// GET CASH LEDGER ENTRY BY ID
// ==========================================

const getCashLedgerEntryById = async (
  entryId,
  companyId
) => {
  return await CashLedger.findOne({
    _id: entryId,
    company: companyId,
  })
    .populate(
      "customer",
      "customerName phone email"
    )
    .populate(
      "createdBy",
      "name email"
    );
};


// ==========================================
// UPDATE CASH LEDGER ENTRY
// ==========================================

const updateCashLedgerEntry = async (
  entryId,
  companyId,
  updateData
) => {
  return await CashLedger.findOneAndUpdate(
    {
      _id: entryId,
      company: companyId,
    },
    updateData,
    {
      new: true,
      runValidators: true,
    }
  );
};


// ==========================================
// DELETE CASH LEDGER ENTRY
// ==========================================

const deleteCashLedgerEntry = async (
  entryId,
  companyId
) => {
  return await CashLedger.findOneAndDelete({
    _id: entryId,
    company: companyId,
  });
};


// ==========================================
// GET CASH LEDGER TOTALS
// ==========================================

const getCashLedgerTotals = async (
  companyId,
  query = {}
) => {

  const result =
    await CashLedger.aggregate([
      {
        $match: {
          company: companyId,
          ...query,
        },
      },

      {
        $group: {
          _id: null,

          totalDebit: {
            $sum: "$debit",
          },

          totalCredit: {
            $sum: "$credit",
          },

          entryCount: {
            $sum: 1,
          },
        },
      },
    ]);


  return (
    result[0] || {
      totalDebit: 0,
      totalCredit: 0,
      entryCount: 0,
    }
  );
};


// ==========================================
// GET LAST CASH BALANCE
// ==========================================

const getLastCashBalance = async (
  companyId
) => {

  const entry =
    await CashLedger.findOne({
      company: companyId,
    })
      .sort({
        transactionDate: -1,
        createdAt: -1,
      })
      .select("balance")
      .lean();


  return entry?.balance || 0;
};


// ==========================================
// EXPORT
// ==========================================

export {
  createCashLedgerEntry,
  getAllCashLedgerEntries,
  countCashLedgerEntries,
  getCashLedgerEntryById,
  updateCashLedgerEntry,
  deleteCashLedgerEntry,
  getCashLedgerTotals,
  getLastCashBalance,
};