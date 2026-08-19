import GSTReturn from "../models/gstReturn.model.js";

// ==========================================
// CREATE GST RETURN
// ==========================================

const createGSTReturn = async (
  data
) => {
  return await GSTReturn.create(data);
};


// ==========================================
// GET ALL GST RETURNS
// ==========================================

const getGSTReturns = async (
  companyId,
  filters = {}
) => {
  const query = {
    company: companyId,
  };

  if (
    filters.returnType &&
    filters.returnType !== "ALL"
  ) {
    query.returnType =
      filters.returnType;
  }

  if (
    filters.status &&
    filters.status !== "ALL"
  ) {
    query.status =
      filters.status;
  }

  if (filters.period) {
    query.period = filters.period;
  }

  return await GSTReturn.find(query)
    .sort({
      dueDate: 1,
      createdAt: -1,
    })
    .lean();
};


// ==========================================
// GET GST RETURN BY ID
// ==========================================

const getGSTReturnById = async (
  returnId,
  companyId
) => {
  return await GSTReturn.findOne({
    _id: returnId,
    company: companyId,
  }).lean();
};


// ==========================================
// UPDATE GST RETURN
// ==========================================

const updateGSTReturn = async (
  returnId,
  companyId,
  updateData
) => {
  return await GSTReturn.findOneAndUpdate(
    {
      _id: returnId,
      company: companyId,
    },
    {
      $set: updateData,
    },
    {
      new: true,
      runValidators: true,
    }
  ).lean();
};


// ==========================================
// GET RETURN STATS
// ==========================================

const getGSTReturnStats = async (
  companyId
) => {
  const result =
    await GSTReturn.aggregate([
      {
        $match: {
          company: companyId,
        },
      },

      {
        $group: {
          _id: "$status",

          count: {
            $sum: 1,
          },

          liability: {
            $sum: "$liability",
          },
        },
      },
    ]);

  return result;
};


export {
  createGSTReturn,
  getGSTReturns,
  getGSTReturnById,
  updateGSTReturn,
  getGSTReturnStats,
};