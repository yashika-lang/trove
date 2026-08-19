import ITC from "../models/itc.model.js";

// ==========================================
// CREATE ITC ENTRY
// ==========================================

const createITC = async (data) => {
  return await ITC.create(data);
};


// ==========================================
// GET ITC ENTRIES
// ==========================================

const getITCEntries = async (
  companyId,
  filters = {},
  skip = 0,
  limit = 10
) => {
  const query = {
    company: companyId,
  };

  if (
    filters.eligibility &&
    filters.eligibility !== "ALL"
  ) {
    query.eligibility =
      filters.eligibility;
  }

  if (
    filters.claimStatus &&
    filters.claimStatus !== "ALL"
  ) {
    query.claimStatus =
      filters.claimStatus;
  }

  if (filters.search) {
    query.$or = [
      {
        documentNumber: {
          $regex: filters.search,
          $options: "i",
        },
      },
      {
        supplierName: {
          $regex: filters.search,
          $options: "i",
        },
      },
      {
        gstin: {
          $regex: filters.search,
          $options: "i",
        },
      },
    ];
  }

  const [
    entries,
    total,
  ] = await Promise.all([
    ITC.find(query)
      .populate(
        "transaction"
      )
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit)
      .lean(),

    ITC.countDocuments(query),
  ]);

  return {
    entries,
    pagination: {
      total,
      page:
        Math.floor(skip / limit) + 1,
      limit,
      totalPages:
        Math.ceil(total / limit),
    },
  };
};


// ==========================================
// GET ITC BY ID
// ==========================================

const getITCById = async (
  entryId,
  companyId
) => {
  return await ITC.findOne({
    _id: entryId,
    company: companyId,
  })
    .populate("transaction")
    .lean();
};


// ==========================================
// UPDATE ITC
// ==========================================

const updateITC = async (
  entryId,
  companyId,
  updateData
) => {
  return await ITC.findOneAndUpdate(
    {
      _id: entryId,
      company: companyId,
    },
    {
      $set: updateData,
    },
    {
      new: true,
      runValidators: true,
    }
  )
    .populate("transaction")
    .lean();
};


// ==========================================
// DELETE ITC
// ==========================================

const deleteITC = async (
  entryId,
  companyId
) => {
  return await ITC.findOneAndDelete({
    _id: entryId,
    company: companyId,
  });
};


// ==========================================
// ITC SUMMARY
// ==========================================

const getITCSummary = async (
  companyId
) => {
  const result =
    await ITC.aggregate([
      {
        $match: {
          company: companyId,
        },
      },

      {
        $group: {
          _id: null,

          available: {
            $sum: {
              $add: [
                "$cgstAvailable",
                "$sgstAvailable",
                "$igstAvailable",
                "$cessAvailable",
              ],
            },
          },

          claimed: {
            $sum: "$claimed",
          },

          reversed: {
            $sum: "$reversed",
          },
        },
      },
    ]);

  if (!result.length) {
    return {
      available: 0,
      claimed: 0,
      reversed: 0,
      netCredit: 0,
    };
  }

  const data = result[0];

  return {
    available: data.available,
    claimed: data.claimed,
    reversed: data.reversed,
    netCredit:
      data.claimed -
      data.reversed,
  };
};


export {
  createITC,
  getITCEntries,
  getITCById,
  updateITC,
  deleteITC,
  getITCSummary,
};