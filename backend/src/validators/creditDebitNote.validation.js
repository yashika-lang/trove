import { z } from "zod";

const createNoteSchema = z.object({
  invoiceId: z.string().min(1, "Invoice is required"),

  type: z.enum(["CREDIT_NOTE", "DEBIT_NOTE"]),

  reason: z.string().trim().min(3, "Reason is required"),

  items: z
    .array(
      z.object({
        product: z.string().min(1, "Product is required"),
        quantity: z.number().min(1, "Quantity must be at least 1"),
      })
    )
    .min(1, "At least one product is required"),
});

export { createNoteSchema };
