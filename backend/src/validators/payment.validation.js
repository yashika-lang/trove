import { z } from "zod";

// CREATE PAYMENT
const createPaymentSchema = z.object({
  customer: z
    .string()
    .min(1, "Customer is required"),

  invoice: z
    .string()
    .optional()
    .nullable(),

  amount: z
    .number()
    .positive("Amount must be greater than 0"),

  paymentDate: z
    .string()
    .min(1, "Payment date is required"),

  paymentMode: z.enum([
    "CASH",
    "UPI",
    "CREDIT_CARD",
    "DEBIT_CARD",
    "WALLET",
    "BANK_TRANSFER",
  ]),

  status: z.enum([
    "PAID",
    "PARTIALLY_PAID",
    "PENDING",
    "FAILED",
    "REFUNDED",
  ]).optional(),

  utr: z
    .string()
    .optional()
    .nullable(),

  referenceNumber: z
    .string()
    .optional()
    .nullable(),

  remarks: z
    .string()
    .optional()
    .nullable(),
});


// UPDATE PAYMENT
const updatePaymentSchema = z.object({
  customer: z
    .string()
    .min(1, "Customer is required")
    .optional(),

  invoice: z
    .string()
    .optional()
    .nullable(),

  amount: z
    .number()
    .positive("Amount must be greater than 0")
    .optional(),

  paymentDate: z
    .string()
    .min(1, "Payment date is required")
    .optional(),

  paymentMode: z
    .enum([
      "CASH",
      "UPI",
      "CREDIT_CARD",
      "DEBIT_CARD",
      "WALLET",
      "BANK_TRANSFER",
    ])
    .optional(),

  status: z
    .enum([
      "PAID",
      "PARTIALLY_PAID",
      "PENDING",
      "FAILED",
      "REFUNDED",
    ])
    .optional(),

  utr: z
    .string()
    .optional()
    .nullable(),

  referenceNumber: z
    .string()
    .optional()
    .nullable(),

  remarks: z
    .string()
    .optional()
    .nullable(),
});


// UPDATE PAYMENT STATUS
const updatePaymentStatusSchema = z.object({
  status: z.enum([
    "PAID",
    "PARTIALLY_PAID",
    "PENDING",
    "FAILED",
    "REFUNDED",
  ]),
});


export {
  createPaymentSchema,
  updatePaymentSchema,
  updatePaymentStatusSchema,
};