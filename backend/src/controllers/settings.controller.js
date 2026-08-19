import asyncHandler from "../exceptions/asyncHandler.js";
import ApiResponse from "../exceptions/ApiResponse.js";

import {
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
} from "../services/settings.service.js";

const getSettings = asyncHandler(async (req, res) => {
  const data = await getAllSettings(req.user);
  return res.status(200).json(
    new ApiResponse(200, data, "Settings fetched successfully.")
  );
});

const patch = (service, message) =>
  asyncHandler(async (req, res) => {
    const data = await service(req.user, req.body);
    return res.status(200).json(
      new ApiResponse(200, data, message)
    );
  });

const getBanks = asyncHandler(async (req, res) => {
  const data = await getBanksForUser(req.user);
  return res.status(200).json(
    new ApiResponse(200, data, "Bank accounts fetched successfully.")
  );
});

const createBank = asyncHandler(async (req, res) => {
  const data = await createBankForUser(req.user, req.body);
  return res.status(201).json(
    new ApiResponse(201, data, "Bank account added successfully.")
  );
});

const updateBank = asyncHandler(async (req, res) => {
  const data = await updateBankForUser(
    req.user,
    req.params.bankId,
    req.body
  );
  return res.status(200).json(
    new ApiResponse(200, data, "Bank account updated successfully.")
  );
});

const deleteBank = asyncHandler(async (req, res) => {
  const data = await deleteBankForUser(
    req.user,
    req.params.bankId
  );
  return res.status(200).json(
    new ApiResponse(200, data, "Bank account deleted successfully.")
  );
});

const setDefaultBank = asyncHandler(async (req, res) => {
  const data = await setDefaultBankForUser(
    req.user,
    req.params.bankId
  );
  return res.status(200).json(
    new ApiResponse(200, data, "Default bank account updated successfully.")
  );
});

const getTemplates = asyncHandler(async (req, res) => {
  const data = await getTemplatesForUser(req.user, req.query.type);
  return res.status(200).json(
    new ApiResponse(200, data, "Document templates fetched successfully.")
  );
});

const createTemplate = asyncHandler(async (req, res) => {
  const data = await createTemplateForUser(req.user, req.body);
  return res.status(201).json(
    new ApiResponse(201, data, "Document template created successfully.")
  );
});

const updateTemplate = asyncHandler(async (req, res) => {
  const data = await updateTemplateForUser(
    req.user,
    req.params.templateId,
    req.body
  );
  return res.status(200).json(
    new ApiResponse(200, data, "Document template updated successfully.")
  );
});

const deleteTemplate = asyncHandler(async (req, res) => {
  const data = await deleteTemplateForUser(
    req.user,
    req.params.templateId
  );
  return res.status(200).json(
    new ApiResponse(200, data, "Document template deleted successfully.")
  );
});

const setDefaultTemplate = asyncHandler(async (req, res) => {
  const data = await setDefaultTemplateForUser(
    req.user,
    req.params.templateId
  );
  return res.status(200).json(
    new ApiResponse(200, data, "Default template updated successfully.")
  );
});

const updateGeneral = patch(updateGeneralSettings, "General settings updated successfully.");
const updateCompany = patch(updateCompanyInfo, "Company information updated successfully.");
const updateInvoice = patch(updateInvoiceQuotation, "Invoice and quotation settings updated successfully.");
const updateGst = patch(updateGstTax, "GST and tax settings updated successfully.");
const updatePayment = patch(updatePaymentPreferences, "Payment preferences updated successfully.");
const updateNotification = patch(updateNotifications, "Notification settings updated successfully.");
const updateSecurity = patch(updateSecurityPolicy, "Security settings updated successfully.");

export {
  getSettings,
  updateGeneral,
  updateCompany,
  updateInvoice,
  updateGst,
  updatePayment,
  updateNotification,
  updateSecurity,
  getBanks,
  createBank,
  updateBank,
  deleteBank,
  setDefaultBank,
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  setDefaultTemplate,
};
