import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";
import Quotation from "../models/quotation.model.js";
import Invoice from "../models/invoice.model.js";

const RESULT_LIMIT = 5;

// Scoped to exactly what each role can already reach via its own module
// routes (backend/src/routes/*.routes.js authorizeRoles), so search never
// surfaces something the requester couldn't open anyway.
const SEARCHABLE_BY_ROLE = {
  admin: ["customers", "products", "quotations", "invoices"],
  sales: ["customers", "products", "quotations", "invoices"],
  accountant: ["invoices"],
};

const search = async (user, query) => {
  const companyId = user.company;
  const role = String(user.role || "").toLowerCase();
  const allowed = SEARCHABLE_BY_ROLE[role] ?? [];
  const regex = { $regex: query, $options: "i" };

  const tasks = [];

  if (allowed.includes("customers")) {
    tasks.push(
      Customer.find({ company: companyId, customerName: regex })
        .limit(RESULT_LIMIT)
        .select("customerName email phone")
        .then((rows) =>
          rows.map((c) => ({
            type: "customer",
            id: c._id,
            label: c.customerName,
            sublabel: c.email,
          }))
        )
    );
  }

  if (allowed.includes("products")) {
    tasks.push(
      Product.find({ company: companyId, productName: regex })
        .limit(RESULT_LIMIT)
        .select("productName sku")
        .then((rows) =>
          rows.map((p) => ({
            type: "product",
            id: p._id,
            label: p.productName,
            sublabel: p.sku,
          }))
        )
    );
  }

  if (allowed.includes("quotations")) {
    tasks.push(
      Quotation.find({ company: companyId, quotationNumber: regex })
        .limit(RESULT_LIMIT)
        .select("quotationNumber status total")
        .then((rows) =>
          rows.map((q) => ({
            type: "quotation",
            id: q._id,
            label: q.quotationNumber,
            sublabel: `${q.status} · ₹${q.total}`,
          }))
        )
    );
  }

  if (allowed.includes("invoices")) {
    tasks.push(
      // Accountant can't open the Customers module, but the Invoices/
      // Payments screens they DO have access to already show customer
      // names — so searching by customer name here (to land on that
      // customer's invoice) doesn't expose anything new, just matches
      // what's already visible to them.
      Customer.find({ company: companyId, customerName: regex })
        .select("_id")
        .then((customers) =>
          Invoice.find({
            company: companyId,
            $or: [
              { invoiceNumber: regex },
              { customer: { $in: customers.map((c) => c._id) } },
            ],
          })
            .limit(RESULT_LIMIT)
            .select("invoiceNumber status total customer")
            .populate("customer", "customerName")
        )
        .then((rows) =>
          rows.map((i) => ({
            type: "invoice",
            id: i._id,
            label: i.invoiceNumber,
            sublabel: `${i.customer?.customerName ? i.customer.customerName + " · " : ""}${i.status} · ₹${i.total}`,
          }))
        )
    );
  }

  const grouped = await Promise.all(tasks);
  return grouped.flat();
};

export { search };
