import GSTAuditLog from "../models/gstAuditLog.model.js";

// ==========================================
// CREATE AUDIT LOG
// ==========================================

const createGSTAuditLog = async (
  data
) => {
  return await GSTAuditLog.create(data);
};


// ==========================================
// GET AUDIT LOGS
// ==========================================

const getGSTAuditLogs = async (
  companyId,
  filters = {},
  skip = 0,
  limit = 20
) => {
  const query = {
    company: companyId,
  };

  if (filters.action) {
    query.action =
      filters.action;
  }

  if (filters.entityType) {
    query.entityType =
      filters.entityType;
  }

  if (filters.performedBy) {
    query.performedBy =
      filters.performedBy;
  }

  const [
    logs,
    total,
  ] = await Promise.all([
    GSTAuditLog.find(query)
      .populate(
        "performedBy",
        "fullName email"
      )
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit)
      .lean(),

    GSTAuditLog.countDocuments(
      query
    ),
  ]);

  return {
    logs,
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
// GET AUDIT LOG BY ID
// ==========================================

const getGSTAuditLogById = async (
  logId,
  companyId
) => {
  return await GSTAuditLog.findOne({
    _id: logId,
    company: companyId,
  })
    .populate(
      "performedBy",
      "fullName email"
    )
    .lean();
};


export {
  createGSTAuditLog,
  getGSTAuditLogs,
  getGSTAuditLogById,
};