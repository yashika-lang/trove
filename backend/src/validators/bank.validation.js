import { z } from "zod";

// CREATE BANK
const createBankSchema = z.object({
  bankName: z
    .string()
    .min(1, "Bank name is required"),

  accountNumber: z
    .string()
    .min(1, "Account number is required"),

  accountHolderName: z
    .string()
    .min(1, "Account holder name is required"),

  ifscCode: z
    .string()
    .min(1, "IFSC code is required"),

  branchName: z
    .string()
    .optional()
    .nullable(),

  accountType: z.enum([
    "CURRENT",
    "SAVINGS",
  ]).optional(),

  openingBalance: z
    .number()
    .min(0, "Opening balance cannot be negative")
    .optional(),

  status: z.enum([
    "ACTIVE",
    "INACTIVE",
  ]).optional(),
});


// UPDATE BANK
const updateBankSchema = z.object({
  bankName: z
    .string()
    .min(1, "Bank name is required")
    .optional(),

  accountNumber: z
    .string()
    .min(1, "Account number is required")
    .optional(),

  accountHolderName: z
    .string()
    .min(1, "Account holder name is required")
    .optional(),

  ifscCode: z
    .string()
    .min(1, "IFSC code is required")
    .optional(),

  branchName: z
    .string()
    .optional()
    .nullable(),

  accountType: z
    .enum([
      "CURRENT",
      "SAVINGS",
    ])
    .optional(),

  openingBalance: z
    .number()
    .min(0, "Opening balance cannot be negative")
    .optional(),

  status: z
    .enum([
      "ACTIVE",
      "INACTIVE",
    ])
    .optional(),
});


export {
  createBankSchema,
  updateBankSchema,
};