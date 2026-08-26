import Settings from "../models/settings.model.js";
import Company from "../models/company.model.js";
import Bank from "../models/bank.model.js";
import DocumentTemplate from "../models/documentTemplate.model.js";

const getSettings = async (companyId) => {
  return Settings.findOne({ company: companyId }).lean();
};

const getCompany = async (companyId) => {
  return Company.findById(companyId).lean();
};

const createSettings = async (companyId) => {
  return Settings.create({ company: companyId });
};

const updateCompany = async (companyId, data) => {
  return Company.findByIdAndUpdate(
    companyId,
    { $set: data },
    { new: true, runValidators: true }
  ).lean();
};

const updateSettings = async (companyId, section, data) => {
  const setData = {};

  for (const [key, value] of Object.entries(data || {})) {
    setData[`${section}.${key}`] = value;
  }

  return Settings.findOneAndUpdate(
    { company: companyId },
    { $set: setData },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  ).lean();
};

const getBanks = async (companyId) => {
  return Bank.find({ company: companyId })
    .sort({ isDefault: -1, createdAt: -1 })
    .lean();
};

const createBank = async (companyId, data) => {
  return Bank.create({
    ...data,
    company: companyId,
  });
};

const getBankById = async (companyId, bankId) => {
  return Bank.findOne({
    _id: bankId,
    company: companyId,
  });
};

const updateBank = async (companyId, bankId, data) => {
  return Bank.findOneAndUpdate(
    { _id: bankId, company: companyId },
    { $set: data },
    { new: true, runValidators: true }
  );
};

const deleteBank = async (companyId, bankId) => {
  return Bank.findOneAndDelete({
    _id: bankId,
    company: companyId,
  });
};

const unsetDefaultBanks = async (companyId) => {
  return Bank.updateMany(
    { company: companyId, isDefault: true },
    { $set: { isDefault: false } }
  );
};

const getTemplates = async (companyId, type) => {
  const query = { company: companyId };
  if (type) query.type = type;

  return DocumentTemplate.find(query)
    .sort({ isDefault: -1, createdAt: -1 })
    .lean();
};

const createTemplate = async (companyId, data) => {
  return DocumentTemplate.create({
    ...data,
    company: companyId,
  });
};

const getTemplateById = async (companyId, templateId) => {
  return DocumentTemplate.findOne({
    _id: templateId,
    company: companyId,
  });
};

const updateTemplate = async (companyId, templateId, data) => {
  return DocumentTemplate.findOneAndUpdate(
    { _id: templateId, company: companyId },
    { $set: data },
    { new: true, runValidators: true }
  );
};

const deleteTemplate = async (companyId, templateId) => {
  return DocumentTemplate.findOneAndDelete({
    _id: templateId,
    company: companyId,
  });
};

const unsetDefaultTemplates = async (companyId, type) => {
  return DocumentTemplate.updateMany(
    { company: companyId, type, isDefault: true },
    { $set: { isDefault: false } }
  );
};

export {
  getSettings,
  getCompany,
  createSettings,
  updateCompany,
  updateSettings,
  getBanks,
  createBank,
  getBankById,
  updateBank,
  deleteBank,
  unsetDefaultBanks,
  getTemplates,
  createTemplate,
  getTemplateById,
  updateTemplate,
  deleteTemplate,
  unsetDefaultTemplates,
};
