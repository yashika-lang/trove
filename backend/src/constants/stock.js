// Single source of truth for what counts as "low stock" across the app.
// Previously this "10" was duplicated three times independently — once as
// product.repository.js's default parameter, once as a literal passed from
// product.service.js, and once as a separate hardcoded constant in the
// frontend's ProductsPage — with no guarantee any of the three would ever
// be changed together.
export const LOW_STOCK_THRESHOLD = 10;

// The Product model only stores a single `openingStock` number (see
// backend/src/models/product.model.js) — there is no separate
// currentStock/quantity field, and no inventory-deduction logic anywhere
// in the app (invoices/quotations don't decrement it). "Stock status" is
// therefore always derived from this one field.
export function computeStockStatus(openingStock) {
  if (openingStock <= 0) return "OUT_OF_STOCK";
  if (openingStock <= LOW_STOCK_THRESHOLD) return "LOW_STOCK";
  return "IN_STOCK";
}
