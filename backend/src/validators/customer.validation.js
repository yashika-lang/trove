import { z } from "zod";

export const createCustomerSchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(2, "Customer name must be at least 2 characters long."),

  contactPerson: z
    .string()
    .trim()
    .min(2, "Contact person must be at least 2 characters long."),

  phone: z
    .string()
    .trim()
    .min(10, "Phone number must be at least 10 characters long."),

  email: z
    .string()
    .trim()
    .email("Invalid email address."),

  gstin: z
    .string()
    .trim()
    .min(15, "GSTIN must be 15 characters long.")
    .max(15, "GSTIN must be 15 characters long."),

  billingAddress: z
    .string()
    .trim()
    .min(5, "Billing address is required."),

  creditLimit: z
    .number()
    .min(0, "Credit limit cannot be negative.")
    .optional(),

  status: z
    .enum(["ACTIVE", "INACTIVE"])
    .optional(),

  notes: z
    .string()
    .trim()
    .optional(),
});