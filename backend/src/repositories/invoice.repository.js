import Invoice from "../models/invoice.model.js";
import Customer from "../models/customer.model.js";
import Quotation from "../models/quotation.model.js";

class InvoiceRepository {
  // CREATE INVOICE
  async createInvoice(invoiceData) {
    return await Invoice.create(invoiceData);
  }

  // FIND LAST INVOICE
  async findLastInvoice(companyId) {
    return await Invoice.findOne({
      company: companyId,
    }).sort({ createdAt: -1 });
  }

  // GET ALL INVOICES
  async findInvoices({
    companyId,
    search,
    status,
    page,
    limit,
  }) {
    const filter = {
      company: companyId,
    };

    if (status) {
      filter.status = status;
    }

    if (search) {
      // Mirrors the same customer-name + document-number lookup already
      // used in quotation.repository.js findQuotations.
      const [matchingCustomers, matchingQuotations] = await Promise.all([
        Customer.find({
          company: companyId,
          customerName: { $regex: search, $options: "i" },
        }).select("_id"),

        Quotation.find({
          company: companyId,
          quotationNumber: { $regex: search, $options: "i" },
        }).select("_id"),
      ]);

      filter.$or = [
        { invoiceNumber: { $regex: search, $options: "i" } },
        { customer: { $in: matchingCustomers.map((c) => c._id) } },
        { quotation: { $in: matchingQuotations.map((q) => q._id) } },
      ];
    }

    const skip = (page - 1) * limit;

    const [invoices, total] = await Promise.all([
      Invoice.find(filter)
        .populate("customer")
        .populate("quotation")
        .populate("items.product")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      Invoice.countDocuments(filter),
    ]);

    return {
      invoices,
      total,
    };
  }

  // GET INVOICE BY ID
  async findInvoiceById(invoiceId, companyId) {
    return await Invoice.findOne({
      _id: invoiceId,
      company: companyId,
    })
      .populate("customer")
      .populate("quotation")
      .populate("items.product");
  }

  // UPDATE INVOICE
  async updateInvoice(
    invoiceId,
    companyId,
    updateData
  ) {
    return await Invoice.findOneAndUpdate(
      {
        _id: invoiceId,
        company: companyId,
      },
      updateData,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("customer")
      .populate("quotation")
      .populate("items.product");
  }

  // DELETE INVOICE
  async deleteInvoice(invoiceId, companyId) {
    return await Invoice.findOneAndDelete({
      _id: invoiceId,
      company: companyId,
    });
  }

  // GET INVOICE STATS
  async getInvoiceStats(companyId) {
    return await Invoice.aggregate([
      {
        $match: {
          company: companyId,
        },
      },
      {
        $group: {
          _id: null,

          totalInvoices: {
            $sum: 1,
          },

          paid: {
            $sum: {
              $cond: [
                {
                  $eq: ["$status", "PAID"],
                },
                1,
                0,
              ],
            },
          },

          // Excludes CANCELLED so this agrees with the dashboard's and the
          // customer's own outstanding figures (dashboard.repository.js /
          // customer.repository.js recalculateOutstanding), which both
          // already exclude cancelled invoices from "money owed."
          outstanding: {
            $sum: {
              $cond: [
                { $eq: ["$status", "CANCELLED"] },
                0,
                "$balanceDue",
              ],
            },
          },

          overdue: {
            $sum: {
              $cond: [
                {
                  $eq: ["$status", "OVERDUE"],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalInvoices: 1,
          paid: 1,
          outstanding: 1,
          overdue: 1,
        },
      },
    ]);
  }
}

export default InvoiceRepository;