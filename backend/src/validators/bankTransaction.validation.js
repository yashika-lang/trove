import { z } from "zod";

// CREATE BANK TRANSACTION
const createBankTransactionSchema = z.object({
  bankAccount: z
    .string()
    .min(1, "Bank account is required"),

  transactionDate: z
    .string()
    .min(1, "Transaction date is required"),

  type: z.enum(
    ["CREDIT", "DEBIT"],
    {
      message: "Transaction type must be CREDIT or DEBIT",
    }
  ),

  amount: z
    .number()
    .min(0.01, "Amount must be greater than 0"),

  narration: z
    .string()
    .min(1, "Narration is required"),

  referenceNumber: z
    .string()
    .optional()
    .nullable(),

  payment: z
    .string()
    .optional()
    .nullable(),

  reconciliationStatus: z
    .enum([
      "UNRECONCILED",
      "RECONCILED",
    ])
    .optional(),
});


// UPDATE BANK TRANSACTION
const updateBankTransactionSchema = z.object({
  bankAccount: z
    .string()
    .min(1, "Bank account is required")
    .optional(),

  transactionDate: z
    .string()
    .min(1, "Transaction date is required")
    .optional(),

  type: z
    .enum([
      "CREDIT",
      "DEBIT",
    ])
    .optional(),

  amount: z
    .number()
    .min(0.01, "Amount must be greater than 0")
    .optional(),

  narration: z
    .string()
    .min(1, "Narration is required")
    .optional(),

  referenceNumber: z
    .string()
    .optional()
    .nullable(),

  reconciliationStatus: z
    .enum([
      "UNRECONCILED",
      "RECONCILED",
    ])
    .optional(),
});


// RECONCILE TRANSACTION
const reconcileBankTransactionSchema = z.object({
  reconciliationStatus: z.enum([
    "RECONCILED",
    "UNRECONCILED",
  ]),
});


export {
  createBankTransactionSchema,
  updateBankTransactionSchema,
  reconcileBankTransactionSchema,
};