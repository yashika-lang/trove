import mongoose from "mongoose";
import ApiError from "../exceptions/ApiError.js";

import {
  getSettings,
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
} from "../repositories/settings.repository.js";

const PAYMENT_METHODS = [
  "cash",
  "upi",
  "bankTransfer",
  "creditCard",
  "debitCard",
  "digitalWallet",
];

const PAYMENT_TERMS = [
  "DUE_ON_RECEIPT",
  "NET_7",
  "NET_15",
  "NET_30",
  "NET_45",
  "NET_60",
];

const TEMPLATE_TYPES = [
  "invoice",
  "quotation",
  "creditNote",
  "debitNote",
];

const validateCompanyId = (user) => {
  if (!user?.company) {
    throw new ApiError(401, "User company information is missing.");
  }
  return user.company;
};

const validateObjectId = (id, message) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, message);
  }
};

const getAllSettings = async (user) => {
  const companyId = validateCompanyId(user);

  let settings = await getSettings(companyId);

  if (!settings) {
    settings = await createSettings(companyId);
    settings = settings.toObject();
  }

  const [banks, templates] = await Promise.all([
    getBanks(companyId),
    getTemplates(companyId),
  ]);

  return {
    settings,
    banks,
    templates,
  };
};

const updateGeneralSettings = async (user, data) => {
  const companyId = validateCompanyId(user);

  const allowed = [
    "companyName",
    "email",
    "phone",
    "website",
    "address",
    "city",
    "state",
    "zipCode",
    "country",
    "logo",
  ];

  const update = {};
  for (const key of allowed) {
    if (data[key] !== undefined) update[key] = data[key];
  }

  if (!Object.keys(update).length) {
    throw new ApiError(400, "At least one general setting is required.");
  }

  if (update.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(update.email)) {
      throw new ApiError(400, "Please enter a valid company email.");
    }
    update.email = update.email.toLowerCase().trim();
  }

  return updateCompany(companyId, update);
};

const updateCompanyInfo = async (user, data) => {
  const companyId = validateCompanyId(user);

  const allowed = [
    "gstNumber",
    "panNumber",
    "businessType",
    "state",
    "currency",
    "timezone",
    "financialYearStart",
  ];

  const update = {};
  for (const key of allowed) {
    if (data[key] !== undefined) update[key] = data[key];
  }

  if (!Object.keys(update).length) {
    throw new ApiError(400, "At least one company information field is required.");
  }

  if (update.gstNumber) {
    update.gstNumber = update.gstNumber.trim().toUpperCase();
  }

  if (update.panNumber) {
    update.panNumber = update.panNumber.trim().toUpperCase();
  }

  return updateCompany(companyId, update);
};

const updateInvoiceQuotation = async (user, data) => {
  const update = { ...data };

  if (update.defaultPaymentTerms !== undefined &&
      !PAYMENT_TERMS.includes(update.defaultPaymentTerms)) {
    throw new ApiError(400, "Invalid default payment terms.");
  }

  for (const field of [
    "nextInvoiceNumber",
    "nextQuotationNumber",
    "dueDays",
  ]) {
    if (update[field] !== undefined) {
      const value = Number(update[field]);
      if (!Number.isInteger(value) || value < 0) {
        throw new ApiError(400, `${field} must be a non-negative integer.`);
      }
      update[field] = value;
    }
  }

  return updateSettings(user.company, "invoiceQuotation", update);
};

const updateGstTax = async (user, data) => {
  const update = { ...data };

  if (update.defaultGstRate !== undefined) {
    const rate = Number(update.defaultGstRate);
    if (Number.isNaN(rate) || rate < 0 || rate > 100) {
      throw new ApiError(400, "GST rate must be between 0 and 100.");
    }
    update.defaultGstRate = rate;
  }

  if (update.gstReminderDays !== undefined) {
    const days = Number(update.gstReminderDays);
    if (!Number.isInteger(days) || days < 0) {
      throw new ApiError(400, "GST reminder days must be a non-negative integer.");
    }
    update.gstReminderDays = days;
  }

  if (
    update.roundOffMethod !== undefined &&
    !["NORMAL", "UP", "DOWN"].includes(update.roundOffMethod)
  ) {
    throw new ApiError(400, "Invalid round off method.");
  }

  return updateSettings(user.company, "gstTax", update);
};

const updatePaymentPreferences = async (user, data) => {
  const update = { ...data };

  if (
    update.defaultPaymentMethod !== undefined &&
    !PAYMENT_METHODS.includes(update.defaultPaymentMethod)
  ) {
    throw new ApiError(400, "Invalid default payment method.");
  }

  if (
    update.defaultPaymentTerms !== undefined &&
    !PAYMENT_TERMS.includes(update.defaultPaymentTerms)
  ) {
    throw new ApiError(400, "Invalid default payment terms.");
  }

  return updateSettings(user.company, "paymentPreferences", update);
};

const updateNotifications = async (user, data) => {
  const allowedChannels = ["email", "sms", "whatsapp", "desktop"];
  const allowedEvents = [
    "invoiceCreated",
    "paymentReceived",
    "quotationSent",
    "gstReminders",
    "lowStockAlerts",
  ];

  if (data.channels) {
    for (const key of Object.keys(data.channels)) {
      if (!allowedChannels.includes(key)) {
        throw new ApiError(400, `Invalid notification channel: ${key}.`);
      }
    }
  }

  if (data.events) {
    for (const event of Object.keys(data.events)) {
      if (!allowedEvents.includes(event)) {
        throw new ApiError(400, `Invalid notification event: ${event}.`);
      }
      for (const channel of Object.keys(data.events[event] || {})) {
        if (!allowedChannels.includes(channel)) {
          throw new ApiError(400, `Invalid notification channel: ${channel}.`);
        }
      }
    }
  }

  return updateSettings(user.company, "notifications", data);
};

const updateSecurityPolicy = async (user, data) => {
  const update = { ...data };

  if (update.minimumPasswordLength !== undefined) {
    const length = Number(update.minimumPasswordLength);
    if (!Number.isInteger(length) || length < 6 || length > 128) {
      throw new ApiError(400, "Minimum password length must be between 6 and 128.");
    }
    update.minimumPasswordLength = length;
  }

  if (update.passwordExpirationDays !== undefined) {
    const days = Number(update.passwordExpirationDays);
    if (!Number.isInteger(days) || days < 0) {
      throw new ApiError(400, "Password expiration days must be a non-negative integer.");
    }
    update.passwordExpirationDays = days;
  }

  if (update.sessionTimeoutMinutes !== undefined) {
    const minutes = Number(update.sessionTimeoutMinutes);
    if (!Number.isInteger(minutes) || minutes < 5) {
      throw new ApiError(400, "Session timeout must be at least 5 minutes.");
    }
    update.sessionTimeoutMinutes = minutes;
  }

  return updateSettings(user.company, "securityPolicy", update);
};

const getBanksForUser = async (user) => {
  const companyId = validateCompanyId(user);
  return getBanks(companyId);
};

const createBankForUser = async (user, data) => {
  const companyId = validateCompanyId(user);

  const required = ["bankName", "accountNumber", "ifscCode"];
  for (const field of required) {
    if (!data[field]?.toString().trim()) {
      throw new ApiError(400, `${field} is required.`);
    }
  }

  const accountNumber = String(data.accountNumber).trim();
  const ifscCode = String(data.ifscCode).trim().toUpperCase();

  if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode)) {
    throw new ApiError(400, "Invalid IFSC code.");
  }

  if (data.isDefault) {
    await unsetDefaultBanks(companyId);
  }

  return createBank(companyId, {
    bankName: String(data.bankName).trim(),
    accountNumber,
    accountHolderName: String(data.accountHolderName || "").trim(),
    accountType: data.accountType || "SAVINGS",
    ifscCode,
    isDefault: Boolean(data.isDefault),
    currentBalance: Number(data.currentBalance || 0),
  });
};

const updateBankForUser = async (user, bankId, data) => {
  const companyId = validateCompanyId(user);
  validateObjectId(bankId, "Invalid bank account ID.");

  const bank = await getBankById(companyId, bankId);
  if (!bank) throw new ApiError(404, "Bank account not found.");

  const update = { ...data };

  if (update.ifscCode) {
    update.ifscCode = String(update.ifscCode).trim().toUpperCase();
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(update.ifscCode)) {
      throw new ApiError(400, "Invalid IFSC code.");
    }
  }

  if (update.isDefault === true) {
    await unsetDefaultBanks(companyId);
  }

  return updateBank(companyId, bankId, update);
};

const deleteBankForUser = async (user, bankId) => {
  const companyId = validateCompanyId(user);
  validateObjectId(bankId, "Invalid bank account ID.");

  const bank = await getBankById(companyId, bankId);
  if (!bank) throw new ApiError(404, "Bank account not found.");

  if (bank.isDefault) {
    throw new ApiError(400, "Default bank account cannot be deleted. Set another account as default first.");
  }

  return deleteBank(companyId, bankId);
};

const setDefaultBankForUser = async (user, bankId) => {
  const companyId = validateCompanyId(user);
  validateObjectId(bankId, "Invalid bank account ID.");

  const bank = await getBankById(companyId, bankId);
  if (!bank) throw new ApiError(404, "Bank account not found.");

  await unsetDefaultBanks(companyId);
  return updateBank(companyId, bankId, { isDefault: true });
};

const getTemplatesForUser = async (user, type) => {
  const companyId = validateCompanyId(user);

  if (type && !TEMPLATE_TYPES.includes(type)) {
    throw new ApiError(400, "Invalid document template type.");
  }

  return getTemplates(companyId, type);
};

const createTemplateForUser = async (user, data) => {
  const companyId = validateCompanyId(user);

  if (!TEMPLATE_TYPES.includes(data.type)) {
    throw new ApiError(400, "Invalid document template type.");
  }

  if (!data.name?.trim()) {
    throw new ApiError(400, "Template name is required.");
  }

  if (data.isDefault) {
    await unsetDefaultTemplates(companyId, data.type);
  }

  return createTemplate(companyId, {
    type: data.type,
    name: data.name.trim(),
    primaryColor: data.primaryColor,
    accentColor: data.accentColor,
    configuration: data.configuration || {},
    isDefault: Boolean(data.isDefault),
  });
};

const updateTemplateForUser = async (user, templateId, data) => {
  const companyId = validateCompanyId(user);
  validateObjectId(templateId, "Invalid document template ID.");

  const template = await getTemplateById(companyId, templateId);
  if (!template) throw new ApiError(404, "Document template not found.");

  if (data.type && !TEMPLATE_TYPES.includes(data.type)) {
    throw new ApiError(400, "Invalid document template type.");
  }

  const targetType = data.type || template.type;

  if (data.isDefault === true) {
    await unsetDefaultTemplates(companyId, targetType);
  }

  return updateTemplate(companyId, templateId, data);
};

const deleteTemplateForUser = async (user, templateId) => {
  const companyId = validateCompanyId(user);
  validateObjectId(templateId, "Invalid document template ID.");

  const template = await getTemplateById(companyId, templateId);
  if (!template) throw new ApiError(404, "Document template not found.");

  if (template.isDefault) {
    throw new ApiError(400, "Default template cannot be deleted. Set another template as default first.");
  }

  return deleteTemplate(companyId, templateId);
};

const setDefaultTemplateForUser = async (user, templateId) => {
  const companyId = validateCompanyId(user);
  validateObjectId(templateId, "Invalid document template ID.");

  const template = await getTemplateById(companyId, templateId);
  if (!template) throw new ApiError(404, "Document template not found.");

  await unsetDefaultTemplates(companyId, template.type);
  return updateTemplate(companyId, templateId, { isDefault: true });
};

export {
  getAllSettings,
  updateGeneralSettings,
  updateCompanyInfo,
  updateInvoiceQuotation,
  updateGstTax,
  updatePaymentPreferences,
  updateNotifications,
  updateSecurityPolicy,
  getBanksForUser,
  createBankForUser,
  updateBankForUser,
  deleteBankForUser,
  setDefaultBankForUser,
  getTemplatesForUser,
  createTemplateForUser,
  updateTemplateForUser,
  deleteTemplateForUser,
  setDefaultTemplateForUser,
};
