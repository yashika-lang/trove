import Customer from "../models/customer.model.js";
import mongoose from "mongoose";

class CustomerRepository {

    async createCustomer(customerData) { // 
    return await Customer.create(customerData);
  }

  async findCustomerById(customerId, companyId) {
  return await Customer.findOne(
  {
    _id: customerId,
    company: companyId,
  });
}
async findCustomerByEmail(email, companyId) {
  return await Customer.findOne({
    email,
    company: companyId,
  });
}
async findCustomerByGSTIN(gstin, companyId) { //Current company ke andar ye GSTIN already kisi customer ko assigned hai ya nahi.
  return await Customer.findOne({
    gstin,
    company: companyId,
  });
}
async findCustomers({
  companyId,
  search,
  status,
  skip,
  limit,
}) {
  const query = { //Sirf current company ke customers lao.
    company: companyId,
  };

  if (status) {
    query.status = status;
  }

  if (search) {
    query.$or = [
      { customerName: { $regex: search, $options: "i" } },
      { contactPerson: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
      { gstin: { $regex: search, $options: "i" } },
    ];
  }

  return await Customer.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
}
async updateCustomer(customerId, companyId, updateData) {
  return await Customer.findOneAndUpdate(
    {
      _id: customerId,
      company: companyId,
    },
    {
      $set: updateData,
    },
    {
      new: true,
      runValidators: true,
    }
  );
}
async getCustomerStats(companyId) {
  const stats = await Customer.aggregate([
    {
      $match: {
        company: new mongoose.Types.ObjectId(companyId),
      },
    },
    {
      $group: {
        _id: null,

        totalCustomers: {
          $sum: 1,
        },

        activeCustomers: {
          $sum: {
            $cond: [
              { $eq: ["$status", "ACTIVE"] },
              1,
              0,
            ],
          },
        },

        totalOutstanding: {
          $sum: "$outstanding",
        },

        customersWithDues: {
          $sum: {
            $cond: [
              { $gt: ["$outstanding", 0] },
              1,
              0,
            ],
          },
        },
      },
    },
  ]);

  return (
    stats[0] || {
      totalCustomers: 0,
      activeCustomers: 0,
      totalOutstanding: 0,
      customersWithDues: 0,
    }
  );
}
}

export default CustomerRepository;