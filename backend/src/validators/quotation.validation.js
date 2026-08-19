import { z } from "zod";

const quotationItemSchema = z.object({
  product: z.string().min(1, "Product is required"),

  quantity: z
    .number()
    .min(1, "Quantity must be at least 1"),

  rate: z
    .number()
    .min(0, "Rate cannot be negative"),

  gst: z
    .number()
    .min(0, "GST cannot be negative"),
});

const createQuotationSchema = z.object({
  customer: z
    .string()
    .min(1, "Customer is required"),

  quotationDate: z
    .string()
    .min(1, "Quotation date is required"),

  validUntil: z
    .string()
    .min(1, "Valid until date is required"),

  items: z
    .array(quotationItemSchema)
    .min(1, "At least one product is required"),

  notes: z
    .string()
    .optional(),

  termsAndConditions: z
    .string()
    .optional(),
});

export {
  createQuotationSchema,
};