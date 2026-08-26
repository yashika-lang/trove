import ApiError from "../exceptions/ApiError.js";
import { parse } from "csv-parse/sync";

import Bank from "../models/bank.model.js";
import { notificationService } from "./notification.service.js";

import {
  createImportedBankTransaction,
  findTransactionByReference,
  getTransactionNumbers,
} from "../repositories/bankImport.repository.js";


// ==========================================
// GENERATE TRANSACTION NUMBER
// Company-wise BT-0001, BT-0002...
// ==========================================

const generateTransactionNumber = async (
  companyId
) => {

  const transactions =
    await getTransactionNumbers(
      companyId
    );

  let maxNumber = 0;

  for (const transaction of transactions) {

    const number = parseInt(
      String(
        transaction.transactionNumber
      ).replace("BT-", ""),
      10
    );

    if (
      !Number.isNaN(number) &&
      number > maxNumber
    ) {
      maxNumber = number;
    }
  }

  return `BT-${String(
    maxNumber + 1
  ).padStart(4, "0")}`;
};


// ==========================================
// IMPORT BANK STATEMENT
// ==========================================

const importBankStatement = async (
  fileBuffer,
  bankAccountId,
  user
) => {

  // ========================================
  // 1. VALIDATE USER COMPANY
  // ========================================

  if (!user?.company) {
    throw new ApiError(
      401,
      "User company information is missing."
    );
  }


  // ========================================
  // 2. VALIDATE BANK ACCOUNT
  // ========================================

  if (!bankAccountId) {
    throw new ApiError(
      400,
      "Bank account is required."
    );
  }


  // ========================================
  // 3. FIND ACTIVE BANK
  // COMPANY-SCOPED
  // ========================================

  const bank = await Bank.findOne({
    _id: bankAccountId,
    company: user.company,
    status: "ACTIVE",
  });

  if (!bank) {
    throw new ApiError(
      404,
      "Active bank account not found."
    );
  }


  // ========================================
  // 4. VALIDATE FILE
  // ========================================

  if (
    !fileBuffer ||
    !Buffer.isBuffer(fileBuffer) ||
    fileBuffer.length === 0
  ) {
    throw new ApiError(
      400,
      "CSV file is required."
    );
  }


  // ========================================
  // 5. PARSE CSV
  // ========================================

  let rows;

  try {

    rows = parse(
      fileBuffer.toString("utf-8"),
      {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        bom: true,
      }
    );

  } catch (error) {

    throw new ApiError(
      400,
      "Invalid CSV file."
    );
  }


  // ========================================
  // 6. EMPTY CSV
  // ========================================

  if (
    !Array.isArray(rows) ||
    rows.length === 0
  ) {
    throw new ApiError(
      400,
      "CSV file contains no transactions."
    );
  }


  // ========================================
  // 7. PREPARE DATA
  // ========================================

  const transactions = [];

  const csvReferences = new Set();

  let balanceChange = 0;


  // ========================================
  // 8. VALIDATE EVERY CSV ROW
  // ========================================

  for (
    let index = 0;
    index < rows.length;
    index++
  ) {

    const row = rows[index];

    // CSV header = row 1
    // First data row = row 2
    const rowNumber = index + 2;


    // --------------------------------------
    // TRANSACTION DATE
    // --------------------------------------

    const rawDate =
      String(
        row.transactionDate || ""
      ).trim();

    if (!rawDate) {
      throw new ApiError(
        400,
        `Transaction date is required in CSV row ${rowNumber}.`
      );
    }


    const transactionDate =
      new Date(rawDate);

    if (
      Number.isNaN(
        transactionDate.getTime()
      )
    ) {
      throw new ApiError(
        400,
        `Invalid transaction date in CSV row ${rowNumber}.`
      );
    }


    // --------------------------------------
    // TYPE
    // --------------------------------------

    const type =
      String(
        row.type || ""
      )
        .trim()
        .toUpperCase();

    if (
      !["CREDIT", "DEBIT"].includes(type)
    ) {
      throw new ApiError(
        400,
        `Transaction type must be CREDIT or DEBIT in CSV row ${rowNumber}.`
      );
    }


    // --------------------------------------
    // AMOUNT
    // --------------------------------------

    const rawAmount =
      String(
        row.amount ?? ""
      ).trim();

    const amount =
      Number(rawAmount);

    if (
      !rawAmount ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      throw new ApiError(
        400,
        `Transaction amount must be greater than 0 in CSV row ${rowNumber}.`
      );
    }


    // --------------------------------------
    // NARRATION
    // --------------------------------------

    const narration =
      String(
        row.narration || ""
      ).trim();

    if (!narration) {
      throw new ApiError(
        400,
        `Narration is required in CSV row ${rowNumber}.`
      );
    }


    // --------------------------------------
    // REFERENCE NUMBER
    // --------------------------------------

    const referenceNumber =
      row.referenceNumber !== undefined &&
      row.referenceNumber !== null
        ? String(
            row.referenceNumber
          ).trim()
        : null;


    // --------------------------------------
    // DUPLICATE REFERENCE
    // INSIDE CURRENT CSV
    // --------------------------------------

    if (referenceNumber) {

      if (
        csvReferences.has(
          referenceNumber
        )
      ) {
        throw new ApiError(
          409,
          `Duplicate reference number found inside CSV: ${referenceNumber}`
        );
      }

      csvReferences.add(
        referenceNumber
      );
    }


    // --------------------------------------
    // PREPARE TRANSACTION
    // --------------------------------------

    transactions.push({

      transactionDate,

      type,

      amount,

      narration,

      referenceNumber,

      bankAccount:
        bank._id,

      company:
        user.company,

      createdBy:
        user._id,

      reconciliationStatus:
        "UNRECONCILED",
    });


    // --------------------------------------
    // BALANCE CHANGE
    // --------------------------------------

    if (type === "CREDIT") {

      balanceChange += amount;

    } else {

      balanceChange -= amount;
    }
  }


  // ========================================
  // 9. CHECK EXISTING DB REFERENCES
  // ========================================

  for (
    const transaction
    of transactions
  ) {

    if (
      !transaction.referenceNumber
    ) {
      continue;
    }


    const existingTransaction =
      await findTransactionByReference(
        user.company,
        bank._id,
        transaction.referenceNumber
      );


    if (existingTransaction) {

      throw new ApiError(
        409,
        `Duplicate transaction found for reference number: ${transaction.referenceNumber}`
      );
    }
  }


  // ========================================
  // 10. CHECK BANK BALANCE
  // ========================================

  const previousBalance =
    Number(
      bank.currentBalance || 0
    );

  const newBalance =
    previousBalance +
    balanceChange;


  if (newBalance < 0) {

    throw new ApiError(
      400,
      "Import would result in insufficient bank balance."
    );
  }


  // ========================================
  // 11. GENERATE TRANSACTIONS
  // ========================================

  const createdTransactions = [];

  // Compute the starting number once, then increment in memory for the
  // rest of the batch — previously this re-scanned every existing
  // transaction on every single loop iteration (O(n^2) DB reads for an
  // n-row CSV).
  const firstTransactionNumber =
    await generateTransactionNumber(
      user.company
    );

  let nextNumber = parseInt(
    firstTransactionNumber.replace("BT-", ""),
    10
  );

  let runningBalance = previousBalance;

  for (
    const transactionData
    of transactions
  ) {

    const transactionNumber =
      `BT-${String(nextNumber).padStart(4, "0")}`;

    nextNumber += 1;

    runningBalance =
      transactionData.type === "CREDIT"
        ? runningBalance + transactionData.amount
        : runningBalance - transactionData.amount;

    const transaction =
      await createImportedBankTransaction({

        ...transactionData,

        transactionNumber,

        balanceAfterTransaction:
          runningBalance,
      });


    createdTransactions.push(
      transaction
    );
  }


  // ========================================
  // 12. UPDATE BANK BALANCE
  // ========================================

  bank.currentBalance =
    newBalance;

  await bank.save();


  // ========================================
  // 13. CALCULATE SUMMARY
  // ========================================

  const totalCredit =
    transactions.reduce(
      (sum, transaction) => {

        if (
          transaction.type === "CREDIT"
        ) {
          return (
            sum +
            transaction.amount
          );
        }

        return sum;
      },
      0
    );


  const totalDebit =
    transactions.reduce(
      (sum, transaction) => {

        if (
          transaction.type === "DEBIT"
        ) {
          return (
            sum +
            transaction.amount
          );
        }

        return sum;
      },
      0
    );


  // ========================================
  // 14. NOTIFY
  // ========================================
  // A bulk import is a noteworthy event worth surfacing — unlike a single
  // manual bank entry, it can silently move a large balance and is worth an
  // audit trail entry in the notification feed.

  await notificationService.notify({
    companyId: user.company,
    type: "BANK_IMPORT_COMPLETED",
    title: "Bank statement imported",
    message: `${createdTransactions.length} transaction(s) imported into ${bank.bankName} (A/c ${bank.accountNumber}).`,
    relatedId: bank._id,
  });


  // ========================================
  // 15. RETURN IMPORT RESULT
  // ========================================

  return {

    importedCount:
      createdTransactions.length,

    totalCredit,

    totalDebit,

    balanceChange,

    previousBalance,

    newBalance,

    transactions:
      createdTransactions,
  };
};


// ==========================================
// EXPORT
// ==========================================

export {
  importBankStatement,
};