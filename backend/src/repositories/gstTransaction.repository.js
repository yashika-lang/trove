import GSTTransaction from "../models/gstTransaction.model.js";

class GSTTransactionRepository {
  async create(data) {
    return await GSTTransaction.create(data);
  }

  async findAll({
    companyId,
    type,
    search,
    startDate,
    endDate,
    page = 1,
    limit = 20,
  }) {
    const filter = {
      company: companyId,
    };

    if (type && type !== "ALL") {
      filter.type = type;
    }

    if (search) {
      filter.$or = [
        {
          documentNumber: {
            $regex: search,
            $options: "i",
          },
        },
        {
          gstin: {
            $regex: search,
            $options: "i",
          },
        },
        {
          supplierName: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    if (startDate || endDate) {
      filter.date = {};

      if (startDate) {
        filter.date.$gte = new Date(startDate);
      }

      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }

    const skip =
      (Number(page) - 1) * Number(limit);

    const [entries, total] =
      await Promise.all([
        GSTTransaction.find(filter)
          .populate(
            "customer",
            "customerName gstin state"
          )
          .sort({ date: -1 })
          .skip(skip)
          .limit(Number(limit)),

        GSTTransaction.countDocuments(filter),
      ]);

    return {
      entries,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(
          total / Number(limit)
        ),
      },
    };
  }

  async findById(id, companyId) {
    return await GSTTransaction.findOne({
      _id: id,
      company: companyId,
    }).populate(
      "customer",
      "customerName gstin state"
    );
  }

  async delete(id, companyId) {
    return await GSTTransaction.findOneAndDelete({
      _id: id,
      company: companyId,
    });
  }

  async getStats(companyId, startDate, endDate) {
    const match = {
      company: companyId,
    };

    if (startDate || endDate) {
      match.date = {};

      if (startDate) {
        match.date.$gte = new Date(startDate);
      }

      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        match.date.$lte = end;
      }
    }

    const result =
      await GSTTransaction.aggregate([
        {
          $match: match,
        },
        {
          $group: {
            _id: "$type",

            taxableAmount: {
              $sum: "$taxableAmount",
            },

            cgst: {
              $sum: "$cgst",
            },

            sgst: {
              $sum: "$sgst",
            },

            igst: {
              $sum: "$igst",
            },

            totalTax: {
              $sum: "$totalTax",
            },
          },
        },
      ]);

    return result;
  }
}

export default GSTTransactionRepository;