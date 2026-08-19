import { z } from "zod";

// CREATE INVOICE
const createInvoiceSchema = z.object({
  customer: z
    .string()
    .min(1, "Customer is required"),

  invoiceDate: z
    .string()
    .min(1, "Invoice date is required"),

  dueDate: z
    .string()
    .min(1, "Due date is required"),

  items: z
    .array(
      z.object({
        product: z
          .string()
          .min(1, "Product is required"),

        quantity: z
          .number()
          .min(1, "Quantity must be at least 1"),
      })
    )
    .min(1, "At least one product is required"),

  notes: z
    .string()
    .optional(),

  termsAndConditions: z
    .string()
    .optional(),
});


// UPDATE INVOICE
const updateInvoiceSchema = z.object({
  customer: z
    .string()
    .min(1, "Customer is required")
    .optional(),

  invoiceDate: z
    .string()
    .min(1, "Invoice date is required")
    .optional(),

  dueDate: z
    .string()
    .min(1, "Due date is required")
    .optional(),

  items: z
    .array(
      z.object({
        product: z
          .string()
          .min(1, "Product is required"),

        quantity: z
          .number()
          .min(1, "Quantity must be at least 1"),
      })
    )
    .min(1, "At least one product is required")
    .optional(),

  notes: z
    .string()
    .optional(),

  termsAndConditions: z
    .string()
    .optional(),
});


// UPDATE INVOICE STATUS
const updateInvoiceStatusSchema = z.object({
  status: z.enum([
    "DRAFT",
    "GENERATED",
    "PENDING",
    "PARTIALLY_PAID",
    "PAID",
    "OVERDUE",
    "CANCELLED",
  ]),
});


// CREATE INVOICE FROM QUOTATION
const createInvoiceFromQuotationSchema = z.object({
  dueDate: z
    .string()
    .min(1, "Due date is required"),
});


export {
  createInvoiceSchema,
  updateInvoiceSchema,
  updateInvoiceStatusSchema,
  createInvoiceFromQuotationSchema,
};