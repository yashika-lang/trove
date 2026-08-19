import GSTSettings from "../models/gstSettings.model.js";

// ==========================================
// GET GST SETTINGS
// ==========================================

const getGSTSettings = async (
  companyId
) => {
  return await GSTSettings.findOne({
    company: companyId,
  }).lean();
};


// ==========================================
// CREATE GST SETTINGS
// ==========================================

const createGSTSettings = async (
  data
) => {
  return await GSTSettings.create(
    data
  );
};


// ==========================================
// UPDATE GST SETTINGS
// ==========================================

const updateGSTSettings = async (
  companyId,
  updateData
) => {
  return await GSTSettings.findOneAndUpdate(
    {
      company: companyId,
    },
    {
      $set: updateData,
    },
    {
      new: true,
      runValidators: true,
      upsert: true,
    }
  ).lean();
};


// ==========================================
// DELETE GST SETTINGS
// ==========================================

const deleteGSTSettings = async (
  companyId
) => {
  return await GSTSettings.findOneAndDelete({
    company: companyId,
  });
};


export {
  getGSTSettings,
  createGSTSettings,
  updateGSTSettings,
  deleteGSTSettings,
};