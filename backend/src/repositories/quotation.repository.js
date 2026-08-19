import Quotation from "../models/quotation.model.js";
import Customer from "../models/customer.model.js";

class QuotationRepository {
  async createQuotation(quotationData) {
    return await Quotation.create(quotationData);
  }

  async findQuotationById(quotationId, companyId) {
    return await Quotation.findOne({
      _id: quotationId,
      company: companyId,
    })
      .populate("customer")
      .populate("items.product");
  }

  async findQuotations({
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
    const matchingCustomers = await Customer.find({
      company: companyId,
      customerName: {
        $regex: search,
        $options: "i",
      },
    }).select("_id");

    const customerIds = matchingCustomers.map(
      (customer) => customer._id
    );

    filter.$or = [
      {
        quotationNumber: {
          $regex: search,
          $options: "i",
        },
      },
      {
        customer: {
          $in: customerIds,
        },
      },
    ];
  }

  const skip = (page - 1) * limit;

  const [quotations, total] = await Promise.all([
    Quotation.find(filter)
      .populate("customer")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    Quotation.countDocuments(filter),
  ]);

  return {
    quotations,
    total,
  };
}

  async updateQuotation(quotationId, companyId, updateData) {
    return await Quotation.findOneAndUpdate(
      {
        _id: quotationId,
        company: companyId,
      },
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );
  }

  async deleteQuotation(quotationId, companyId) {
    return await Quotation.findOneAndDelete({
      _id: quotationId,
      company: companyId,
    });
  }
  async findLastQuotation(companyId) {
    return await Quotation.findOne({
      company: companyId,
    }).sort({ createdAt: -1 });
  }

  async getQuotationStats(companyId) {
    return await Quotation.aggregate([
      {
        $match: {
          company: companyId,
        },
      },
      {
        $group: {
          _id: null,

          totalQuotations: {
            $sum: 1,
          },

          approved: {
            $sum: {
              $cond: [
                { $eq: ["$status", "APPROVED"] },
                1,
                0,
              ],
            },
          },

          awaitingResponse: {
            $sum: {
              $cond: [
                { $eq: ["$status", "SENT"] },
                1,
                0,
              ],
            },
          },

          pipelineValue: {
            $sum: {
              $cond: [
                {
                  $in: [
                    "$status",
                    ["DRAFT", "SENT", "APPROVED"],
                  ],
                },
                "$total",
                0,
              ],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalQuotations: 1,
          approved: 1,
          awaitingResponse: 1,
          pipelineValue: 1,
        },
      },
    ]);
  }
}

export default QuotationRepository;