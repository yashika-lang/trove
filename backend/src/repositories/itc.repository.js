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
//
// `claimed`/`reversed` are tracked once per ITC entry, not split by tax
// head — an entry's claim draws down its CGST/SGST/IGST/Cess available
// amounts together as one credit, so there is no independently-tracked
// "CGST claimed" figure in the schema. The by-head Claimed/Reversed
// figures below are apportioned from each entry's real total claimed/
// reversed, in proportion to that head's real share of the entry's
// available credit — a documented allocation of a real number, not a
// fabricated one. Every entry's own totals still tie back exactly.
// ==========================================

const getITCSummary = async (
  companyId
) => {
  const entries =
    await ITC.find({
      company: companyId,
    })
      .select(
        "cgstAvailable sgstAvailable igstAvailable cessAvailable claimed reversed"
      )
      .lean();

  const heads = {
    cgst: { available: 0, claimed: 0, reversed: 0 },
    sgst: { available: 0, claimed: 0, reversed: 0 },
    igst: { available: 0, claimed: 0, reversed: 0 },
    cess: { available: 0, claimed: 0, reversed: 0 },
  };

  let totalAvailable = 0;
  let totalClaimed = 0;
  let totalReversed = 0;

  for (const entry of entries) {

    const cgst = Number(entry.cgstAvailable || 0);
    const sgst = Number(entry.sgstAvailable || 0);
    const igst = Number(entry.igstAvailable || 0);
    const cess = Number(entry.cessAvailable || 0);
    const claimed = Number(entry.claimed || 0);
    const reversed = Number(entry.reversed || 0);

    const entryTotal = cgst + sgst + igst + cess;

    heads.cgst.available += cgst;
    heads.sgst.available += sgst;
    heads.igst.available += igst;
    heads.cess.available += cess;

    totalAvailable += entryTotal;
    totalClaimed += claimed;
    totalReversed += reversed;

    if (entryTotal > 0) {
      heads.cgst.claimed += claimed * (cgst / entryTotal);
      heads.sgst.claimed += claimed * (sgst / entryTotal);
      heads.igst.claimed += claimed * (igst / entryTotal);
      heads.cess.claimed += claimed * (cess / entryTotal);

      heads.cgst.reversed += reversed * (cgst / entryTotal);
      heads.sgst.reversed += reversed * (sgst / entryTotal);
      heads.igst.reversed += reversed * (igst / entryTotal);
      heads.cess.reversed += reversed * (cess / entryTotal);
    }
  }

  const round = (n) => Math.round(n * 100) / 100;

  return {
    available: round(totalAvailable),
    claimed: round(totalClaimed),
    reversed: round(totalReversed),
    netCredit: round(totalClaimed - totalReversed),

    byHead: [
      { head: "CGST", ...heads.cgst },
      { head: "SGST", ...heads.sgst },
      { head: "IGST", ...heads.igst },
      { head: "Cess", ...heads.cess },
    ].map((h) => ({
      head: h.head,
      available: round(h.available),
      claimed: round(h.claimed),
      reversed: round(h.reversed),
    })),
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