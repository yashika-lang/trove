import { z } from "zod";

const createProductSchema = z.object({
  productName: z
    .string()
    .trim()
    .min(1, "Product name is required."),

  sku: z
    .string()
    .trim()
    .min(1, "SKU is required."),

  hsnCode: z
    .string()
    .trim()
    .min(1, "HSN code is required."),

  category: z
    .string()
    .trim()
    .min(1, "Category is required."),

  unit: z
    .string()
    .trim()
    .min(1, "Unit is required."),

  price: z
    .number()
    .min(0, "Price cannot be negative."),

  gst: z
    .number()
    .min(0, "GST cannot be negative."),

  openingStock: z
    .number()
    .min(0, "Opening stock cannot be negative.")
    .default(0),

  description: z
    .string()
    .trim()
    .optional(),

  status: z
    .enum(["ACTIVE", "INACTIVE"])
    .default("ACTIVE"),
});

export {
  createProductSchema,
};