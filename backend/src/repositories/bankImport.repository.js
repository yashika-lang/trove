import BankTransaction from "../models/bankTransaction.model.js";


// ==========================================
// CREATE BANK TRANSACTION
// ==========================================

const createImportedBankTransaction = async (
  transactionData
) => {
  return await BankTransaction.create(
    transactionData
  );
};


// ==========================================
// FIND TRANSACTION BY REFERENCE
// ==========================================

const findTransactionByReference = async (
  companyId,
  bankAccountId,
  referenceNumber
) => {
  return await BankTransaction.findOne({
    company: companyId,
    bankAccount: bankAccountId,
    referenceNumber,
  });
};


// ==========================================
// GET TRANSACTION NUMBERS
// ==========================================

const getTransactionNumbers = async (
  companyId
) => {
  return await BankTransaction.find({
    company: companyId,
    transactionNumber: {
      $regex: /^BT-\d+$/,
    },
  })
    .select("transactionNumber")
    .lean();
};


export {
  createImportedBankTransaction,
  findTransactionByReference,
  getTransactionNumbers,
};