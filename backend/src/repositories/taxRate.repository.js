import TaxRate from "../models/taxRate.model.js";

class TaxRateRepository {
  async create(data) {
    return await TaxRate.create(data);
  }

  async findAll(companyId) {
    return await TaxRate.find({
      company: companyId,
    }).sort({
      rate: 1,
    });
  }

  async findById(id, companyId) {
    return await TaxRate.findOne({
      _id: id,
      company: companyId,
    });
  }

  async update(id, companyId, data) {
    return await TaxRate.findOneAndUpdate(
      {
        _id: id,
        company: companyId,
      },
      data,
      {
        new: true,
        runValidators: true,
      }
    );
  }

  async delete(id, companyId) {
    return await TaxRate.findOneAndDelete({
      _id: id,
      company: companyId,
    });
  }
}

export default TaxRateRepository;