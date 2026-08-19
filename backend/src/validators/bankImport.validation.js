import { z } from "zod";

const bankImportRowSchema = z.object({
  transactionDate: z
    .string()
    .min(1, "Transaction date is required"),

  type: z.enum(["CREDIT", "DEBIT"]),

  amount: z
    .number()
    .positive("Amount must be greater than 0"),

  narration: z
    .string()
    .min(1, "Narration is required"),

  referenceNumber: z
    .string()
    .optional()
    .nullable(),
});

export {
  bankImportRowSchema,
};