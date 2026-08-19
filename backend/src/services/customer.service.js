import CustomerRepository from "../repositories/customer.repository.js";
import ApiError from "../exceptions/ApiError.js";
import mongoose from "mongoose";

class CustomerService {

  constructor() {
    this.customerRepository = new CustomerRepository();
  }
  async createCustomer(customerData, companyId, userId) {
  const existingEmail = await this.customerRepository.findCustomerByEmail(
    customerData.email,
    companyId
  );

  if (existingEmail) {
    throw new ApiError(
      409,
      "Customer with this email already exists."
    );
  }

  const existingGSTIN = await this.customerRepository.findCustomerByGSTIN(
    customerData.gstin,
    companyId
  );

  if (existingGSTIN) {
    throw new ApiError(
      409,
      "Customer with this GSTIN already exists."
    );
  }

  const customer = await this.customerRepository.createCustomer({
    ...customerData,
    company: companyId,
    createdBy: userId,
    outstanding: 0,
  });

  return customer;
}
async getAllCustomers({
  companyId,
  search,
  status,
  page = 1,
  limit = 10,
}) {
  const skip = (page - 1) * limit;

  const customers = await this.customerRepository.findCustomers({
    companyId,
    search,
    status,
    skip,
    limit,
  });

  return customers;
}
async getCustomerById(customerId, companyId) {

  if (!mongoose.Types.ObjectId.isValid(customerId)) {
    throw new ApiError(
      404,
      "Customer not found."
    );
  }

  const customer = await this.customerRepository.findCustomerById(
    customerId,
    companyId
  );

  if (!customer) {
    throw new ApiError(
      404,
      "Customer not found."
    );
  }

  return customer;
}
async updateCustomer(customerId, companyId, updateData) {
  const customer = await this.customerRepository.findCustomerById(
    customerId,
    companyId
  );

  if (!customer) {
    throw new ApiError(
      404,
      "Customer not found."
    );
  }

  const updatedCustomer = await this.customerRepository.updateCustomer(
    customerId,
    companyId,
    updateData
  );

  return updatedCustomer;
}
async getCustomerStats(companyId) {
  return await this.customerRepository.getCustomerStats(companyId);
}
}

export default CustomerService;