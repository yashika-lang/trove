import Bank from "../models/bank.model.js";

const createBank = async (bankData) => {
  return await Bank.create(bankData);
};

const getAllBanks = async (companyId, filters = {}) => {
  const query = {
    company: companyId,
    ...filters,
  };

  return await Bank.find(query)
    .sort({ createdAt: -1 });
};

const getBankById = async (bankId, companyId) => {
  return await Bank.findOne({
    _id: bankId,
    company: companyId,
  });
};
// ==========================================
// GET ACTIVE BANK BY ACCOUNT NUMBER
// ==========================================

const getActiveBankByAccountNumber = async (
  companyId,
  accountNumber
) => {
  return await Bank.findOne({
    company: companyId,
    accountNumber,
    status: "ACTIVE",
  });
};

const updateBank = async (bankId, companyId, updateData) => {
  return await Bank.findOneAndUpdate(
    {
      _id: bankId,
      company: companyId,
    },
    updateData,
    {
      new: true,
      runValidators: true,
    }
  );
};

const deleteBank = async (bankId, companyId) => {
  return await Bank.findOneAndDelete({
    _id: bankId,
    company: companyId,
  });
};

const getBankStats = async (companyId) => {
  const result = await Bank.aggregate([
    {
      $match: {
        company: companyId,
        status: "ACTIVE",
      },
    },
    {
      $group: {
        _id: null,
        totalBalance: { $sum: "$currentBalance" },
        bankCount: { $sum: 1 },
      },
    },
  ]);

  return (
    result[0] || {
      totalBalance: 0,
      bankCount: 0,
    }
  );
};

export {
  createBank,
  getAllBanks,
  getBankById,
  getActiveBankByAccountNumber,
  updateBank,
  deleteBank,
  getBankStats,
};